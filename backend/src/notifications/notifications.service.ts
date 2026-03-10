import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendBookingConfirmation(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, location: true },
    });

    if (!booking) return;

    const message = `שלום ${booking.user.firstName || ''}, ההזמנה שלך למקווה ${booking.location.name} אושרה לתאריך ${booking.bookingDate.toLocaleDateString('he-IL')} בשעה ${booking.timeSlotStart}`;

    await this.prisma.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        type: 'booking_confirmation',
        channel: 'sms',
        content: message,
        status: 'pending',
      },
    });

    // TODO: Send via SMS provider
    console.log(`[SMS] ${booking.user.phone}: ${message}`);
  }

  async sendReminder(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, location: true },
    });

    if (!booking) return;

    const message = `תזכורת: ההזמנה שלך למקווה ${booking.location.name} היום בשעה ${booking.timeSlotStart}`;

    await this.prisma.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        type: 'reminder',
        channel: 'sms',
        content: message,
        status: 'pending',
      },
    });

    console.log(`[SMS Reminder] ${booking.user.phone}: ${message}`);
  }

  // Cron: Send reminders 1 hour before booking
  @Cron('*/15 * * * *') // every 15 minutes
  async processReminders() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        bookingDate: { gte: today, lt: tomorrow },
        status: 'confirmed',
      },
      include: { user: true, location: true },
    });

    const currentTimeStr = `${String(oneHourLater.getHours()).padStart(2, '0')}:${String(oneHourLater.getMinutes()).padStart(2, '0')}`;

    for (const booking of upcomingBookings) {
      if (booking.timeSlotStart <= currentTimeStr) {
        // Check if reminder already sent
        const existing = await this.prisma.notification.findFirst({
          where: { bookingId: booking.id, type: 'reminder' },
        });

        if (!existing) {
          await this.sendReminder(booking.id);
        }
      }
    }
  }

  // Cron: Mark no-shows 30 min after slot
  @Cron('*/15 * * * *')
  async checkNoShows() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const checkTimeStr = `${String(thirtyMinAgo.getHours()).padStart(2, '0')}:${String(thirtyMinAgo.getMinutes()).padStart(2, '0')}`;

    const possibleNoShows = await this.prisma.booking.findMany({
      where: {
        bookingDate: { gte: today, lt: tomorrow },
        status: 'confirmed',
        timeSlotStart: { lte: checkTimeStr },
      },
    });

    for (const booking of possibleNoShows) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'no_show' },
      });
    }
  }

  // Cron: Room overtime alerts
  @Cron('*/5 * * * *')
  async checkOvertimeRooms() {
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000);

    const overtimeRooms = await this.prisma.room.findMany({
      where: {
        status: { in: ['occupied', 'preparation'] },
        statusChangedAt: { lte: twentyMinAgo },
        isActive: true,
      },
      include: { currentBooking: { include: { user: true } } },
    });

    for (const room of overtimeRooms) {
      console.log(
        `[OVERTIME ALERT] Room ${room.roomNumber} has been in ${room.status} for over 20 minutes`,
      );
    }
  }
}
