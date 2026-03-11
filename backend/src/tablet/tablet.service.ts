import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      include: { equipmentReqs: true, musicTrack: true },
      orderBy: { startedAt: 'desc' },
    });

    const musicTracks = await this.prisma.musicTrack.findMany({
      where: { locationId: room.locationId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });

    const defaultTrack = await this.prisma.musicTrack.findFirst({
      where: { locationId: room.locationId, isDefault: true, isActive: true },
    });

    return {
      room,
      session,
      guestName: room.currentBooking?.user?.firstName || null,
      notes: room.currentBooking?.notesForAttendant || null,
      musicTracks,
      defaultTrack,
      currentTrack: session?.musicTrack || defaultTrack || null,
      musicVolume: session?.musicVolume ?? 50,
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

  async changeMusic(roomId: string, trackId: string | null, volume?: number) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    const updateData: any = {};
    if (trackId !== undefined) {
      updateData.musicTrackId = trackId;
      updateData.musicPreference = trackId;
    }
    if (volume !== undefined) {
      updateData.musicVolume = Math.min(100, Math.max(0, volume));
    }

    return this.prisma.roomSession.update({
      where: { id: session.id },
      data: updateData,
      include: { musicTrack: true },
    });
  }

  async changeVolume(roomId: string, volume: number) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    return this.prisma.roomSession.update({
      where: { id: session.id },
      data: { musicVolume: Math.min(100, Math.max(0, volume)) },
    });
  }

  async exitRoom(roomId: string, exitMethod: string, exitCode?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { currentBooking: true },
    });
    if (!room) throw new NotFoundException('Room not found');

    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (session) {
      await this.prisma.roomSession.update({
        where: { id: session.id },
        data: {
          sessionEndedAt: new Date(),
          exitMethod: exitMethod as any,
          exitCode,
          exitedAt: new Date(),
          musicTrackId: null,
          musicVolume: 50,
          musicPreference: null,
        },
      });

      if (session.bookingId) {
        await this.prisma.booking.update({
          where: { id: session.bookingId },
          data: { status: 'completed', completedAt: new Date() },
        });
      }
    }

    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        status: 'cleaning_required',
        statusChangedAt: new Date(),
        currentBookingId: null,
      },
    });

    return { success: true, message: 'Guest exited, room reset to default' };
  }

  async verifyExitCode(roomId: string, code: string) {
    const session = await this.prisma.roomSession.findFirst({
      where: { roomId, sessionEndedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) throw new NotFoundException('No active session');

    if (session.exitCode && session.exitCode !== code) {
      throw new BadRequestException('Invalid exit code');
    }

    return this.exitRoom(roomId, 'room_code', code);
  }
}
