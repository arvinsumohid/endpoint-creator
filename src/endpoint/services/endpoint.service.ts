import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEndpointDto } from '../dtos/create-endpoint.dto';

@Injectable()
export class EndpointService {
  constructor(private readonly prisma: PrismaService) {}

  async createEndpoint(userId: string, body: CreateEndpointDto) {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: {
        id: userId,
        path: body.path,
      },
    });

    if (endpoint) {
      throw new Error('Endpoint already exists');
    }

    const createdEndpoint = await this.prisma.endpoint.create({
      data: {
        name: body.name,
        description: body.description,
        path: body.path,
        requestBody: body.requestBody,
        responseBody: body.responseBody,
        statusCode: body.statusCode,
        headers: body.headers,
        queryParams: body.queryParams,
        pathParams: body.pathParams,
        userId,
      },
    });
    return createdEndpoint;
  }
}
