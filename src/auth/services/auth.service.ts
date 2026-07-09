import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from './crypto.service';
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
import { Prisma, User } from '../../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async login(body: AuthLoginDto): Promise<AuthLoginResponseDto> {
    const { email, password } = body;
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check password
    const isPasswordValid = await this.cryptoService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  async register(body: AuthRegisterDto): Promise<AuthRegisterResponseDto> {
    const existingUser = await this.findUserByEmail(body.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await this.cryptoService.hashPassword(body.password);

    const newUser = await this.createUser({
      email: body.email,
      name: body.name,
      password: hashedPassword,
    });

    return {
      email: newUser.email,
      name: newUser.name || '',
      id: newUser.id,
    };
  }

  async refresh(
    @RefreshToken() refreshToken: string,
  ): Promise<AuthLoginResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    //verify refresh token
    const payload: PayloadDto = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    //find user by email
    const user = await this.findUserByEmail(payload.email);

    // compare refresh token
    const isRefreshTokenValid = await this.cryptoService.compareRefreshToken(
      refreshToken,
      user?.refreshToken || '',
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user!);
    await this.updateRefreshToken(user!.id, newRefreshToken);

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.deleteRefreshToken(userId);
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private async createUser(data: AuthRegisterDto) {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken =
      await this.cryptoService.hashRefreshToken(refreshToken);
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  private async generateTokens(user: User) {
    const payload: PayloadDto = {
      email: user.email,
      sub: user.id,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  private async deleteRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }
}
