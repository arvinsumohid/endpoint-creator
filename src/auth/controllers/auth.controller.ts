import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto, AuthLoginResponseDto } from '../dtos/auth-login.dto';
import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: AuthLoginDto): Promise<AuthLoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: AuthRegisterDto): Promise<AuthRegisterResponseDto> {
    return this.authService.register(body);
  }

  @Post('refresh')
  refresh(): Promise<string> {
    return this.authService.refresh();
  }
}
