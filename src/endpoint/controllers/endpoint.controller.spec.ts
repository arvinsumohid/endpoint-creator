import { EndpointService } from '../services/endpoint.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EndpointController } from './endpoint.controller';
import { CreateEndpointDto } from '../dtos/create-endpoint.dto';
import express from 'express';

describe('EndpointController', () => {
  let endpointController: EndpointController;
  let endpointService: jest.Mocked<Pick<EndpointService, 'createEndpoint'>>;
  const mockRequest = {
    user: { sub: 1 },
  } as unknown as express.Request;
  beforeEach(async () => {
    endpointService = {
      createEndpoint: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [EndpointController],
      providers: [
        {
          provide: EndpointService,
          useValue: endpointService,
        },
      ],
    }).compile();

    endpointController = app.get<EndpointController>(EndpointController);
  });

  it('should be defined', () => {
    expect(endpointController).toBeDefined();
  });

  describe('createEndpoint', () => {
    it('should return the endpoint service createEndpoint response', async () => {
      const userId = mockRequest.user.sub as string;
      const endpointDto: CreateEndpointDto = {
        name: 'test',
        description: 'test',
        path: '/test',
        requestBody: {},
        responseBody: {},
        statusCode: 200,
        headers: null,
        queryParams: null,
        pathParams: null,
      };
      const mockEndpointResponse = {
        ...endpointDto,
        id: mockRequest.user.sub as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      };
      endpointService.createEndpoint.mockResolvedValue(mockEndpointResponse);
      await expect(
        endpointController.create(mockRequest, endpointDto),
      ).resolves.toEqual(mockEndpointResponse);
      expect(endpointService.createEndpoint).toHaveBeenCalledWith(
        userId,
        endpointDto,
      );
    });

    it('should handle errors from the endpoint service', async () => {
      const userId = mockRequest.user.sub as string;
      const endpointDto: CreateEndpointDto = {
        name: 'test',
        description: 'test',
        path: '/test',
        requestBody: {},
        responseBody: {},
        statusCode: 200,
        headers: null,
        queryParams: null,
        pathParams: null,
      };
      const error = 'Boom';
      endpointService.createEndpoint.mockRejectedValue(new Error(error));

      await expect(
        endpointController.create(mockRequest, endpointDto),
      ).rejects.toThrow(error);
      expect(endpointService.createEndpoint).toHaveBeenCalledWith(
        userId,
        endpointDto,
      );
    });
  });
});
