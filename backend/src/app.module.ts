import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { RoomsModule } from './rooms/rooms.module';
import { AttendantsModule } from './attendants/attendants.module';
import { QueueModule } from './queue/queue.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TabletModule } from './tablet/tablet.module';
import { GatewayModule } from './gateway/gateway.module';
import { SchedulesModule } from './schedules/schedules.module';
import { PricingModule } from './pricing/pricing.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    BookingsModule,
    PaymentsModule,
    RoomsModule,
    AttendantsModule,
    QueueModule,
    AdminModule,
    ReportsModule,
    NotificationsModule,
    TabletModule,
    GatewayModule,
    SchedulesModule,
    PricingModule,
    MusicModule,
  ],
})
export class AppModule {}
