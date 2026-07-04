export class CreateEndpointDto {
  name: string;
  description?: string;
  path: string;
  requestBody: any;
  responseBody: any;
  statusCode: number;
  headers: any;
  queryParams: any;
  pathParams: any;
}
