import { Module } from '@nestjs/common';
import { EndpointController } from './controllers/endpoint.controller';
import { EndpointService } from './services/endpoint.service';

@Module({
  controllers: [EndpointController],
  providers: [EndpointService],
})
export class EndpointModule {}
