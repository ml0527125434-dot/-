import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, RoomStatus } from '@prisma/client';
import { CreateBookingDto, BookingQueryDto, AssignRoomDto } from './bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        userId,
        locationId: dto.locationId,
        bookingDate: new Date(dto.bookingDate),
        timeSlotStart: dto.timeSlotStart,
        timeSlotEnd: dto.timeSlotEnd,
        notesForAttendant: dto.notesForAttendant,
        roomTypePreference: dto.roomTypePreference,
        source: dto.source || 'mobile_app',
        status: 'draft',
      },
      include: { user: true, location: true },
    });
  }

  async findAll(query: BookingQueryDto) {
    const where: any = {};
    if (query.locationId) where.locationId = query.locationId;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.bookingDate = {};
      if (query.dateFrom) where.bookingDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.bookingDate.lte = new Date(query.dateTo);
    }

    return this.prisma.booking.findMany({
      where,
      include: { user: true, room: true, attendant: true },
      orderBy: [{ bookingDate: 'asc' }, { timeSlotStart: 'asc' }],
    });
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
        attendant: true,
        payments: true,
        roomSession: true,
        location: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findAvailableSlots(locationId: string, date: string) {
    const dayDate = new Date(date);
    const dayOfWeek = dayDate.getDay();

    const schedule = await this.prisma.schedule.findFirst({
      where: { locationId, dayOfWeek, isActive: true },
    });
    if (!schedule) return [];

    // Check for overrides
    const override = await this.prisma.scheduleOverride.findFirst({
      where: { locationId, date: dayDate },
    });
    if (override?.isClosed) return [];

    const openTime = override?.openTime || schedule.openTime;
    const closeTime = override?.closeTime || schedule.closeTime;

    // Get existing bookings for the date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        locationId,
        bookingDate: dayDate,
        status: { notIn: ['cancelled', 'no_show', 'draft'] },
      },
    });

    // Generate time slots
    const slots: { start: string; available: boolean; currentBookings: number; maxBookings: number }[] = [];
    const [openH, openM] = (openTime as string).split(':').map(Number);
    const [closeH, closeM] = (closeTime as string).split(':').map(Number);
    const slotMinutes = schedule.slotDurationMinutes;

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    while (currentMinutes + slotMinutes <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const slotStart = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

      const bookingsInSlot = existingBookings.filter(
        (b) => b.timeSlotStart === slotStart,
      );
      const available =
        bookingsInSlot.length < schedule.maxConcurrentBookings;

      slots.push({
        start: slotStart,
        available,
        currentBookings: bookingsInSlot.length,
        maxBookings: schedule.maxConcurrentBookings,
      });

      currentMinutes += slotMinutes;
    }

    return slots;
  }

  async markArrived(id: string) {
    const booking = await this.findById(id);
    if (!['confirmed', 'pending_payment'].includes(booking.status)) {
      throw new BadRequestException(
        `Cannot mark as arrived from status: ${booking.status}`,
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'arrived', arrivedAt: new Date() },
    });
  }

  async assignRoom(id: string, dto: AssignRoomDto) {
    const booking = await this.findById(id);
    if (booking.status !== 'arrived') {
      throw new BadRequestException('Booking must be in arrived status');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });
    if (!room || room.status !== 'available') {
      throw new BadRequestException('Room is not available');
    }

    // Transaction: update booking + room + create session
    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'assigned',
          roomId: dto.roomId,
          assignedAt: new Date(),
        },
      });

      await tx.room.update({
        where: { id: dto.roomId },
        data: {
          status: 'occupied',
          currentBookingId: id,
          statusChangedAt: new Date(),
        },
      });

      await tx.roomSession.create({
        data: {
          roomId: dto.roomId,
          bookingId: id,
        },
      });

      return updatedBooking;
    });
  }

  async markReady(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: 'ready_for_immersion', readyAt: new Date() },
      });

      if (booking.roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'waiting_for_attendant', statusChangedAt: new Date() },
        });

        await tx.roomSession.update({
          where: { bookingId: id },
          data: { readyForImmersionAt: new Date() },
        });
      }

      return booking;
    });
  }

  async startImmersion(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: 'in_progress', immersionStartedAt: new Date() },
      });

      if (booking.roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'immersion', statusChangedAt: new Date() },
        });

        await tx.roomSession.update({
          where: { bookingId: id },
          data: { immersionStartedAt: new Date() },
        });
      }

      return booking;
    });
  }

  async complete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: 'completed', completedAt: new Date() },
      });

      if (booking.roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: {
            status: 'cleaning_required',
            currentBookingId: null,
            statusChangedAt: new Date(),
          },
        });

        await tx.roomSession.update({
          where: { bookingId: id },
          data: {
            immersionEndedAt: new Date(),
            sessionEndedAt: new Date(),
          },
        });
      }

      return booking;
    });
  }

  async cancel(id: string, reason?: string) {
    const booking = await this.findById(id);
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  }
}
