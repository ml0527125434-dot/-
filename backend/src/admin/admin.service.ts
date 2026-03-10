import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(locationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [bookingsToday, rooms, queue] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          locationId,
          bookingDate: { gte: today, lt: tomorrow },
        },
        include: { user: true, room: true },
      }),
      this.prisma.room.findMany({
        where: { locationId, isActive: true },
        include: { currentBooking: { include: { user: true } } },
      }),
      this.prisma.queueEntry.findMany({
        where: { locationId, isActive: true },
        include: { booking: { include: { user: true } } },
      }),
    ]);

    const stats = {
      totalBookings: bookingsToday.length,
      arrived: bookingsToday.filter((b) => b.arrivedAt).length,
      completed: bookingsToday.filter((b) => b.status === 'completed').length,
      cancelled: bookingsToday.filter((b) => b.status === 'cancelled').length,
      noShow: bookingsToday.filter((b) => b.status === 'no_show').length,
      waiting: queue.length,
      inRooms: rooms.filter(
        (r) => !['available', 'out_of_service'].includes(r.status),
      ).length,
    };

    return { stats, bookings: bookingsToday, rooms, queue };
  }

  async getSettings(locationId: string) {
    const [location, schedules, pricingRules, features] = await Promise.all([
      this.prisma.mikvehLocation.findUnique({ where: { id: locationId } }),
      this.prisma.schedule.findMany({
        where: { locationId },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.pricingRule.findMany({ where: { locationId } }),
      this.prisma.featureFlag.findMany({ where: { locationId } }),
    ]);

    return { location, schedules, pricingRules, features };
  }

  async updateSettings(locationId: string, settings: any) {
    return this.prisma.mikvehLocation.update({
      where: { id: locationId },
      data: { settings },
    });
  }

  async toggleFeature(
    locationId: string,
    featureKey: string,
    isEnabled: boolean,
    config?: any,
  ) {
    return this.prisma.featureFlag.upsert({
      where: {
        locationId_featureKey: { locationId, featureKey },
      },
      update: { isEnabled, config },
      create: { locationId, featureKey, isEnabled, config },
    });
  }

  async sendSms(
    locationId: string,
    adminUserId: string,
    recipientPhone: string,
    message: string,
  ) {
    // TODO: Integrate with SMS provider
    console.log(`[SMS] To: ${recipientPhone}, Message: ${message}`);

    const sms = await this.prisma.smsMessage.create({
      data: {
        locationId,
        sentById: adminUserId,
        recipientPhone,
        message,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    await this.prisma.adminActionLog.create({
      data: {
        locationId,
        adminUserId,
        actionType: 'send_sms',
        entityType: 'sms_message',
        entityId: sms.id,
        details: { recipientPhone, message },
      },
    });

    return sms;
  }

  async getAuditLog(locationId: string, limit = 50) {
    return this.prisma.adminActionLog.findMany({
      where: { locationId },
      include: { adminUser: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
