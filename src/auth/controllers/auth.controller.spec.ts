import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import express from 'express';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';
import { AuthController } from './auth.controller';
import { AuthLoginResponseDto } from '../dtos/auth-login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<
    Pick<AuthService, 'login' | 'register' | 'refresh'>
  >;
  let spy: jest.SpyInstance;
  const res = {
    cookie: jest.fn(),
  } as unknown as express.Response;

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

    spy = jest.spyOn(authController as any, 'setRefreshTokenCookie');
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
      const response: AuthLoginResponseDto = {
        token: 'access-token',
        refreshToken: 'refresh-token',
      };
      authService.login.mockResolvedValue(response);

      await expect(authController.login(authLoginDto, res)).resolves.toEqual({
        token: response.token,
      });
      expect(authService.login).toHaveBeenCalledWith(authLoginDto);
      expect(spy).toHaveBeenCalledWith(res, response.refreshToken);
    });

    it('should throw an error if the auth service login throws an error', async () => {
      const authLoginDto: AuthLoginDto = {
        email: 'user@nonexistent.com',
        password: 'password',
      };
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(authLoginDto, res)).rejects.toThrow(
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
      const mockRefreshToken = 'mock-refresh-token';
      authService.refresh.mockResolvedValue({
        token: 'access-token',
        refreshToken: mockRefreshToken,
      });

      await expect(
        authController.refresh(mockRefreshToken, res),
      ).resolves.toEqual({
        token: 'access-token',
      });
      expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should set refresh token cookie', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      authService.refresh.mockResolvedValue({
        token: 'access-token',
        refreshToken: mockRefreshToken,
      });

      await expect(
        authController.refresh(mockRefreshToken, res),
      ).resolves.toEqual({
        token: 'access-token',
      });
      expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
      expect(spy).toHaveBeenCalledWith(res, mockRefreshToken);
    });
  });
});
