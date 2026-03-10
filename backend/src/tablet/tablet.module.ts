import { Module } from '@nestjs/common';
import { TabletService } from './tablet.service';
import { TabletController } from './tablet.controller';

@Module({
  controllers: [TabletController],
  providers: [TabletService],
  exports: [TabletService],
})
export class TabletModule {}
