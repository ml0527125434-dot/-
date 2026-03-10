import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendantsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(locationId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { locationId, isActive: true },
      include: {
        currentBooking: { include: { user: true } },
        roomSessions: {
          where: { sessionEndedAt: null },
          include: { equipmentReqs: true },
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    const readyForImmersion = rooms.filter(
      (r) => r.status === 'waiting_for_attendant',
    );
    const inPreparation = rooms.filter(
      (r) => r.status === 'occupied' || r.status === 'preparation',
    );
    const inImmersion = rooms.filter((r) => r.status === 'immersion');
    const needsCleaning = rooms.filter(
      (r) =>
        r.status === 'cleaning_required' ||
        r.status === 'cleaning_in_progress',
    );

    return {
      readyForImmersion,
      inPreparation,
      inImmersion,
      needsCleaning,
      allRooms: rooms,
    };
  }

  async arriveAtRoom(roomId: string, attendantId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'immersion', statusChangedAt: new Date() },
      });

      const session = await tx.roomSession.findFirst({
        where: { roomId, sessionEndedAt: null },
        orderBy: { startedAt: 'desc' },
      });

      if (session) {
        await tx.roomSession.update({
          where: { id: session.id },
          data: { attendantArrivedAt: new Date() },
        });

        if (session.bookingId) {
          await tx.booking.update({
            where: { id: session.bookingId },
            data: { attendantId, status: 'in_progress' },
          });
        }
      }

      return { success: true };
    });
  }

  async completeImmersion(roomId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.roomSession.findFirst({
        where: { roomId, sessionEndedAt: null },
        orderBy: { startedAt: 'desc' },
      });

      if (session) {
        await tx.roomSession.update({
          where: { id: session.id },
          data: {
            immersionEndedAt: new Date(),
            sessionEndedAt: new Date(),
          },
        });

        await tx.booking.update({
          where: { id: session.bookingId },
          data: { status: 'completed', completedAt: new Date() },
        });
      }

      await tx.room.update({
        where: { id: roomId },
        data: {
          status: 'cleaning_required',
          currentBookingId: null,
          statusChangedAt: new Date(),
        },
      });

      return { success: true };
    });
  }
}
