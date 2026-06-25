import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLoginDto, AuthLoginResponseDto } from '../dtos/auth-login.dto';
import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async login(body: AuthLoginDto): Promise<AuthLoginResponseDto> {
    const { email, password } = body;
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // TODO: Check password

    return {
      token: 'token',
      user: body,
    };
  }

  async register(body: AuthRegisterDto): Promise<AuthRegisterResponseDto> {
    const existingUser = await this.findUserByEmail(body.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await this.hashPassword(body.password);

    const newUser = await this.createUser({
      email: body.email,
      name: body.name,
      password: hashedPassword,
    });

    return {
      email: newUser.email,
      name: newUser.name,
      id: newUser.id,
    };
  }

  async refresh(): Promise<string> {
    // TODO: Implement refresh logic
    return 'refresh';
  }

  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    // TODO: Implement password hashing
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    return bcrypt.hash(password + process.env.PASSWORD_SALT, saltRounds);
  }

  private async createUser(data: AuthRegisterDto) {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }
}
