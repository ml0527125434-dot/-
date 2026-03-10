import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getRules(locationId: string) {
    return this.prisma.pricingRule.findMany({
      where: { locationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(locationId: string, data: any) {
    return this.prisma.pricingRule.create({
      data: {
        locationId,
        name: data.name,
        roomType: data.roomType || 'standard',
        price: data.price,
        currency: data.currency || 'ILS',
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateRule(id: string, data: any) {
    return this.prisma.pricingRule.update({
      where: { id },
      data: {
        name: data.name,
        roomType: data.roomType,
        price: data.price,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async deleteRule(id: string) {
    return this.prisma.pricingRule.delete({ where: { id } });
  }
}
