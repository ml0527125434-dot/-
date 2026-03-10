import { Module } from '@nestjs/common';
import { ZentroGateway } from './zentro.gateway';

@Module({
  providers: [ZentroGateway],
  exports: [ZentroGateway],
})
export class GatewayModule {}
