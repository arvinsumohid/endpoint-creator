export class AuthRegisterDto {
  email: string;
  name?: string;
  password: string;
}

export class AuthRegisterResponseDto {
  email: string;
  name: string | null;
  id: string;
}
