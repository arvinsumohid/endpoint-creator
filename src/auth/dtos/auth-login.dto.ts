export class AuthLoginDto {
  email: string;
  password: string;
}

export class AuthLoginResponseDto {
  token: string;
  user: AuthLoginDto;
}
