export class UserLoginDto {
  email: string;
  password: string;
}

export class UserLoginResponseDto {
  token: string;
  user: UserLoginDto;
}
