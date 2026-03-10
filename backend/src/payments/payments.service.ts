import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentGateway, PaymentMethod } from '@prisma/client';

export interface CreatePaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  gateway: PaymentGateway;
  savedCardToken?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(input: CreatePaymentInput) {
    // TODO: Integrate with iCount / Z-Credit API
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: input.bookingId,
        userId: input.userId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        gateway: input.gateway,
        status: 'pending',
      },
    });

    // Simulate successful payment in dev
    const completed = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        paidAt: new Date(),
        gatewayTransactionId: `DEV-${Date.now()}`,
      },
    });

    // Update booking payment status
    await this.prisma.booking.update({
      where: { id: input.bookingId },
      data: { paymentStatus: 'paid', status: 'confirmed' },
    });

    return completed;
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true, user: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async refund(id: string) {
    const payment = await this.findById(id);

    // TODO: Call gateway refund API
    const refunded = await this.prisma.payment.update({
      where: { id },
      data: { status: 'refunded', refundedAt: new Date() },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'refunded' },
    });

    return refunded;
  }

  async saveCard(userId: string, token: string, last4: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { savedCardToken: token, savedCardLast4: last4 },
    });
  }
}
