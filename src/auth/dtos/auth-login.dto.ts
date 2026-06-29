import { IsEmail, IsJWT, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AuthLoginResponseDto {
  @IsJWT()
  token: string;

  @IsJWT()
  refreshToken: string;
}

export class PayloadDto {
  sub: string;
  email: string;
}
