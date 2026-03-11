import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getQueue(locationId: string) {
    return this.prisma.queueEntry.findMany({
      where: { locationId, isActive: true },
      include: { booking: { include: { user: true } } },
      orderBy: { position: 'asc' },
    });
  }

  async addToQueue(locationId: string, bookingId: string) {
    const lastEntry = await this.prisma.queueEntry.findFirst({
      where: { locationId, isActive: true },
      orderBy: { position: 'desc' },
    });

    return this.prisma.queueEntry.create({
      data: {
        locationId,
        bookingId,
        position: (lastEntry?.position || 0) + 1,
      },
    });
  }

  async removeFromQueue(bookingId: string) {
    return this.prisma.queueEntry.updateMany({
      where: { bookingId, isActive: true },
      data: { isActive: false, assignedAt: new Date() },
    });
  }

  async overrideQueue(bookingId: string, newPosition: number) {
    const entry = await this.prisma.queueEntry.findFirst({
      where: { bookingId, isActive: true },
    });

    if (entry) {
      // Shift other entries down
      await this.prisma.queueEntry.updateMany({
        where: {
          locationId: entry.locationId,
          isActive: true,
          position: { gte: newPosition },
        },
        data: { position: { increment: 1 } },
      });

      return this.prisma.queueEntry.update({
        where: { id: entry.id },
        data: { position: newPosition },
      });
    }

    return null;
  }

  async addManualEntry(
    locationId: string,
    data: { phone: string; firstName?: string; lastName?: string; notes?: string },
  ) {
    // Find or create the user
    let user = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    }

    // Create a walk-in booking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nowTime = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    const booking = await this.prisma.booking.create({
      data: {
        locationId,
        userId: user.id,
        bookingDate: today,
        timeSlotStart: nowTime,
        timeSlotEnd: nowTime,
        status: 'arrived',
        paymentStatus: 'unpaid',
        source: 'reception',
        notesForAttendant: data.notes,
        arrivedAt: new Date(),
      },
    });

    // Add to queue
    const entry = await this.addToQueue(locationId, booking.id);

    return {
      ...entry,
      booking: { ...booking, user },
    };
  }
}
