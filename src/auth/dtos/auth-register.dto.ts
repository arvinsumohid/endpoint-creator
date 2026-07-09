import { IsEmail, IsString } from 'class-validator';

export class AuthRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name?: string;

  @IsString()
  password: string;
}

export class AuthRegisterResponseDto {
  @IsEmail()
  email: AuthRegisterDto['email'];

  @IsString()
  name?: AuthRegisterDto['name'];

  @IsString()
  id: string;
}
