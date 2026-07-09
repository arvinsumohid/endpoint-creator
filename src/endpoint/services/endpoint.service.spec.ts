import { EndpointService } from './endpoint.service';

describe('EndpointService', () => {
  let endpointService: EndpointService;
  let prismaService: {
    endpoint: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      endpoint: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    endpointService = new EndpointService(prismaService);
  });

  describe('createEndpoint', () => {
    it('should create an endpoint', async () => {
      const userId = '1';
      const body = {
        name: 'Test Endpoint',
        description: 'Test Description',
        path: '/test',
        requestBody: '{}',
        responseBody: '{}',
        statusCode: 200,
        headers: '{}',
        queryParams: '{}',
        pathParams: '{}',
      };

      prismaService.endpoint.findUnique.mockResolvedValue(null);
      prismaService.endpoint.create.mockResolvedValue({
        id: '1',
        userId,
        ...body,
      });
      const result = await endpointService.createEndpoint(userId, body);

      expect(result).toEqual({
        id: '1',
        userId,
        name: body.name,
        description: body.description,
        path: body.path,
        requestBody: body.requestBody,
        responseBody: body.responseBody,
        statusCode: body.statusCode,
        headers: body.headers,
        queryParams: body.queryParams,
        pathParams: body.pathParams,
      });
    });

    it('should throw an error if endpoint already exists', async () => {
      const userId = '1';
      const body = {
        name: 'Test Endpoint',
        description: 'Test Description',
        path: '/test',
        requestBody: '{}',
        responseBody: '{}',
        statusCode: 200,
        headers: '{}',
        queryParams: '{}',
        pathParams: '{}',
      };

      prismaService.endpoint.findUnique.mockResolvedValue({
        id: '1',
        ...body,
        userId,
      });

      await expect(
        endpointService.createEndpoint(userId, body),
      ).rejects.toThrow('Endpoint already exists');
    });
  });
});
