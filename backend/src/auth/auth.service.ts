import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  // In production, store codes in Redis with TTL
  private verificationCodes = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async sendCode(phone: string): Promise<{ success: boolean }> {
    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.verificationCodes.set(phone, code);

    // TODO: Send SMS via provider
    console.log(`[DEV] Verification code for ${phone}: ${code}`);

    return { success: true };
  }

  async verifyCode(
    phone: string,
    code: string,
  ): Promise<{ accessToken: string; user: any }> {
    const storedCode = this.verificationCodes.get(phone);

    // In dev, accept '0000' as universal code
    if (
      storedCode !== code &&
      !(process.env.NODE_ENV === 'development' && code === '0000')
    ) {
      throw new UnauthorizedException('Invalid verification code');
    }

    this.verificationCodes.delete(phone);

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({ data: { phone } });
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });

    return { accessToken, user };
  }
}
