import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateEndpointDto } from '../dtos/create-endpoint.dto';
import express from 'express';
import { PayloadDto } from 'src/auth/dtos/auth-login.dto';
import { EndpointService } from '../services/endpoint.service';

@Controller('endpoints')
export class EndpointController {
  constructor(private readonly endpointService: EndpointService) {}

  @Post()
  async create(
    @Req() req: express.Request,
    @Body() body: CreateEndpointDto,
  ): Promise<any> {
    const { sub: userId } = req.user as PayloadDto;

    return await this.endpointService.createEndpoint(userId, body);
  }
}
