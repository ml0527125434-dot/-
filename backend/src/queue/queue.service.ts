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
}
