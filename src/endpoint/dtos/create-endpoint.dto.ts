import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEndpointDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  path!: string;

  @IsOptional()
  requestBody?: Record<string, unknown>;

  @IsOptional()
  responseBody?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @IsOptional()
  headers?: Record<string, unknown> | null;

  @IsOptional()
  queryParams?: Record<string, unknown> | null;

  @IsOptional()
  pathParams?: Record<string, unknown> | null;
}
