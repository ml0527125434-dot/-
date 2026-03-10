import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TabletService {
  constructor(private prisma: PrismaService) {}

  async getRoomInfo(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        currentBooking: { include: { user: true } },
      },
    });
    if (!room) throw new NotFoundException('Room not found');

    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      include: { equipmentReqs: true },
      orderBy: { startedAt: 'desc' },
    });

    return {
      room,
      session,
      guestName: room.currentBooking?.user?.firstName || null,
      notes: room.currentBooking?.notesForAttendant || null,
    };
  }

  async requestEquipment(
    roomId: string,
    items: { itemType: string; quantity: number }[],
  ) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    const requests = await Promise.all(
      items.map((item) =>
        this.prisma.equipmentRequest.create({
          data: {
            roomSessionId: session.id,
            roomId,
            itemType: item.itemType,
            quantity: item.quantity,
          },
        }),
      ),
    );

    return requests;
  }

  async markReady(roomId: string) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    await this.prisma.roomSession.update({
      where: { id: session.id },
      data: { readyForImmersionAt: new Date() },
    });

    await this.prisma.room.update({
      where: { id: roomId },
      data: { status: 'waiting_for_attendant', statusChangedAt: new Date() },
    });

    if (session.bookingId) {
      await this.prisma.booking.update({
        where: { id: session.bookingId },
        data: { status: 'ready_for_immersion', readyAt: new Date() },
      });
    }

    return { success: true };
  }

  async updateChecklist(roomId: string, checklist: Record<string, boolean>) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    return this.prisma.roomSession.update({
      where: { id: session.id },
      data: { preparationChecklist: checklist },
    });
  }

  async changeMusic(roomId: string, preference: string) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    // TODO: Send IoT command to room speaker
    return this.prisma.roomSession.update({
      where: { id: session.id },
      data: { musicPreference: preference },
    });
  }
}
