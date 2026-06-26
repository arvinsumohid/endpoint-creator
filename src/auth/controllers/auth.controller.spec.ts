import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<
    Pick<AuthService, 'login' | 'register' | 'refresh'>
  >;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refresh: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return the auth service login response', async () => {
      const authLoginDto: AuthLoginDto = {
        email: 'user@existing.com',
        password: 'password',
      };
      const response = {
        token: expect.any(String),
        user: authLoginDto,
      };
      authService.login.mockResolvedValue(response);

      await expect(authController.login(authLoginDto)).resolves.toEqual(
        response,
      );
      expect(authService.login).toHaveBeenCalledWith(authLoginDto);
    });

    it('should throw an error if the auth service login throws an error', async () => {
      const authLoginDto: AuthLoginDto = {
        email: 'user@nonexistent.com',
        password: 'password',
      };
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(authLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(authLoginDto);
    });
  });

  describe('register', () => {
    const authRegisterDto: AuthRegisterDto = {
      email: 'user@existing.com',
      name: 'User',
      password: 'password',
    };

    it('should return the auth service register response', async () => {
      const authRegisterDto: AuthRegisterDto = {
        email: 'user@new.com',
        name: 'New User',
        password: 'password',
      };
      const response: AuthRegisterResponseDto = {
        email: authRegisterDto.email,
        name: authRegisterDto.name || null,
        id: 'user-id',
      };
      authService.register.mockResolvedValue(response);

      await expect(authController.register(authRegisterDto)).resolves.toEqual(
        response,
      );
      expect(authService.register).toHaveBeenCalledWith(authRegisterDto);
    });

    it('should return error if user already exists', async () => {
      authService.register.mockRejectedValue(
        new UnauthorizedException('User already exists'),
      );

      await expect(authController.register(authRegisterDto)).rejects.toThrow(
        'User already exists',
      );
      expect(authService.register).toHaveBeenCalledWith(authRegisterDto);
    });
  });

  describe('refresh', () => {
    it('should return the auth service refresh response', async () => {
      authService.refresh.mockResolvedValue('refresh');

      await expect(authController.refresh()).resolves.toBe('refresh');
      expect(authService.refresh).toHaveBeenCalled();
    });
  });
});
