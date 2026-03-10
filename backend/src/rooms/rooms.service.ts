import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findByLocation(locationId: string) {
    return this.prisma.room.findMany({
      where: { locationId, isActive: true },
      include: {
        currentBooking: { include: { user: true } },
      },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        currentBooking: { include: { user: true } },
        roomSessions: {
          where: { sessionEndedAt: null },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async updateStatus(id: string, status: RoomStatus) {
    return this.prisma.room.update({
      where: { id },
      data: { status, statusChangedAt: new Date() },
    });
  }

  async markClean(id: string, cleanedById?: string) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.update({
        where: { id },
        data: {
          status: 'available',
          currentBookingId: null,
          statusChangedAt: new Date(),
        },
      });

      // Update the room session cleaning timestamps
      const activeSession = await tx.roomSession.findFirst({
        where: { roomId: id, cleaningCompletedAt: null },
        orderBy: { startedAt: 'desc' },
      });

      if (activeSession) {
        await tx.roomSession.update({
          where: { id: activeSession.id },
          data: {
            cleaningCompletedAt: new Date(),
            cleanedById,
          },
        });
      }

      return room;
    });
  }

  async getCurrentSession(roomId: string) {
    return this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      include: {
        booking: { include: { user: true } },
        equipmentReqs: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getRoomStats(locationId: string) {
    const rooms = await this.findByLocation(locationId);
    const stats = {
      total: rooms.length,
      available: 0,
      occupied: 0,
      cleaning: 0,
      outOfService: 0,
      immersion: 0,
      waitingForAttendant: 0,
    };

    for (const room of rooms) {
      switch (room.status) {
        case 'available': stats.available++; break;
        case 'occupied':
        case 'preparation': stats.occupied++; break;
        case 'cleaning_required':
        case 'cleaning_in_progress': stats.cleaning++; break;
        case 'out_of_service': stats.outOfService++; break;
        case 'immersion': stats.immersion++; break;
        case 'waiting_for_attendant': stats.waitingForAttendant++; break;
      }
    }

    return { stats, rooms };
  }
}
