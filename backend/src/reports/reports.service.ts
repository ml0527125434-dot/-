import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReport(locationId: string, dateFrom: string, dateTo: string) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const bookings = await this.prisma.booking.findMany({
      where: {
        locationId,
        bookingDate: { gte: from, lte: to },
      },
      include: {
        user: true,
        room: true,
        payments: true,
        roomSession: true,
      },
      orderBy: [{ bookingDate: 'asc' }, { timeSlotStart: 'asc' }],
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        booking: { locationId, bookingDate: { gte: from, lte: to } },
        status: 'completed',
      },
    });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const summary = {
      totalBookings: bookings.length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      noShow: bookings.filter((b) => b.status === 'no_show').length,
      totalRevenue,
      averagePrice:
        bookings.length > 0 ? totalRevenue / bookings.length : 0,
      showerCount: bookings.filter(
        (b) => b.room && b.room.hasShower && !b.room.hasBathtub,
      ).length,
      bathtubCount: bookings.filter((b) => b.room?.hasBathtub).length,
    };

    return { summary, bookings };
  }

  async exportData(locationId: string, dateFrom: string, dateTo: string) {
    const { summary, bookings } = await this.getReport(
      locationId,
      dateFrom,
      dateTo,
    );

    // Generate CSV-compatible data
    const rows = bookings.map((b) => ({
      id: b.id,
      date: b.bookingDate,
      time: b.timeSlotStart,
      userName: `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim(),
      userPhone: b.user?.phone || '',
      roomNumber: b.room?.roomNumber || '',
      roomType: b.room?.roomType || '',
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalPaid: b.payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0),
      arrivedAt: b.arrivedAt || '',
      completedAt: b.completedAt || '',
      notes: b.notesForAttendant || '',
    }));

    return { summary, rows };
  }
}
