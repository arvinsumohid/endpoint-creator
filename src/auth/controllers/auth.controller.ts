import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from '../services/auth.service';
import {
  AuthLoginDto,
  AuthLoginResponseDto,
  PayloadDto,
} from '../dtos/auth-login.dto';
import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import { Public } from '../decorators/public.decorator';

type AuthTokenResponse = Omit<AuthLoginResponseDto, 'refreshToken'>;

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: AuthLoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<AuthTokenResponse> {
    const result = await this.authService.login(body);
    const { refreshToken, ...tokenResponse } = result;
    this.setRefreshTokenCookie(res, refreshToken);
    return tokenResponse;
  }

  @Post('register')
  async register(
    @Body() body: AuthRegisterDto,
  ): Promise<AuthRegisterResponseDto> {
    return await this.authService.register(body);
  }

  @Post('refresh')
  async refresh(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<AuthTokenResponse> {
    const result = await this.authService.refresh(refreshToken);
    const { refreshToken: newRefreshToken, ...tokenResponse } = result;
    this.setRefreshTokenCookie(res, newRefreshToken);
    return tokenResponse;
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { sub: userId } = req.user as PayloadDto;
    await this.authService.logout(userId);
    this.clearRefreshTokenCookie(res);
    return { message: 'Logged out successfully' };
  }

  private setRefreshTokenCookie(res: express.Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: express.Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }
}
