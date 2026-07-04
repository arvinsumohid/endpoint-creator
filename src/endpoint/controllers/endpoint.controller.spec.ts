import { EndpointService } from '../services/endpoint.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EndpointController } from './endpoint.controller';
import { CreateEndpointDto } from '../dtos/create-endpoint.dto';

describe('EndpointController', () => {
  let endpointController: EndpointController;
  let endpointService: jest.Mocked<Pick<EndpointService, 'createEndpoint'>>;
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
      const userId = '1';
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
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      };
      endpointService.createEndpoint.mockResolvedValue(mockEndpointResponse);
      await expect(
        endpointController.create(
          { user: { sub: userId } } as any,
          endpointDto,
        ),
      ).resolves.toEqual(mockEndpointResponse);
      expect(endpointService.createEndpoint).toHaveBeenCalledWith(
        userId,
        endpointDto,
      );
    });

    it('should handle errors from the endpoint service', async () => {
      const userId = '1';
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
      const error = new Error('Service error');
      endpointService.createEndpoint.mockRejectedValue(error);

      await expect(
        endpointController.create(
          { user: { sub: userId } } as any,
          endpointDto,
        ),
      ).rejects.toThrow('Service error');
      expect(endpointService.createEndpoint).toHaveBeenCalledWith(
        userId,
        endpointDto,
      );
    });
  });
});
