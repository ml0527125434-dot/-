import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async getSchedules(locationId: string) {
    return this.prisma.schedule.findMany({
      where: { locationId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateSchedules(locationId: string, data: any) {
    // data.schedules is an array of schedule entries
    const schedules = data.schedules || [];
    const results: any[] = [];

    for (const sch of schedules) {
      if (sch.id) {
        // Update existing
        const updated = await this.prisma.schedule.update({
          where: { id: sch.id },
          data: {
            openTime: sch.openTime,
            closeTime: sch.closeTime,
            maxConcurrentBookings: sch.maxConcurrentBookings,
            slotDurationMinutes: sch.slotDurationMinutes,
            isActive: sch.isActive,
          },
        });
        results.push(updated);
      } else {
        // Create new
        const created = await this.prisma.schedule.create({
          data: {
            locationId,
            dayOfWeek: sch.dayOfWeek,
            openTime: sch.openTime,
            closeTime: sch.closeTime,
            maxConcurrentBookings: sch.maxConcurrentBookings || 5,
            slotDurationMinutes: sch.slotDurationMinutes || 60,
            isActive: sch.isActive ?? true,
          },
        });
        results.push(created);
      }
    }

    return results;
  }

  async getOverrides(locationId: string) {
    return this.prisma.scheduleOverride.findMany({
      where: { locationId },
      orderBy: { date: 'desc' },
    });
  }

  async createOverride(locationId: string, data: any) {
    return this.prisma.scheduleOverride.create({
      data: {
        locationId,
        date: new Date(data.date),
        isClosed: data.isClosed || false,
        openTime: data.openTime,
        closeTime: data.closeTime,
        reason: data.reason,
      },
    });
  }

  async deleteOverride(id: string) {
    return this.prisma.scheduleOverride.delete({ where: { id } });
  }
}
