import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let cryptoService: any;
  let jwtService: JwtService;
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '',
    refreshToken: 'hashed-refresh-token',
  };

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    cryptoService = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
      hashRefreshToken: jest.fn().mockResolvedValue('hashed-refresh-token'),
      comparePassword: jest.fn(),
      compareRefreshToken: jest.fn(),
    };
    jwtService = new JwtService();
    authService = new AuthService(prismaService, jwtService, cryptoService);
    mockUser.password =
      await authService['cryptoService'].hashPassword('password');
  });

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(authService.register(mockUser)).rejects.toThrow();
    });

    it('should create a new user if user does not exist', async () => {
      const userToCreate: AuthRegisterDto = {
        email: mockUser.email,
        name: mockUser.name || undefined,
        password: mockUser.password,
      };
      const mockUserWithoutPassword = {
        ...mockUser,
        password: undefined,
      };
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUserWithoutPassword);

      const createdUser = await authService.register(userToCreate);
      expect(createdUser).toEqual({
        email: mockUser.email,
        name: mockUser.name,
        id: mockUser.id,
      });
    });
  });

  describe('login', () => {
    it('should throw an error if user does not exist', async () => {
      const user = { email: mockUser.email, password: 'password' };
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(authService.login(user)).rejects.toThrow();
    });

    it('should return a token if user exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      cryptoService.comparePassword.mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockUser);
      const result = await authService.login({
        email: mockUser.email,
        password: 'password',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refresh', () => {
    const createRefreshToken = (expiresIn = '7d') =>
      jwtService.signAsync(
        { email: mockUser.email, sub: mockUser.id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn,
        },
      );

    it('should throw an error if refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';
      await expect(authService.refresh(refreshToken)).rejects.toThrow();
    });

    it('should return a new token if refresh token is valid', async () => {
      const refreshToken = await createRefreshToken();
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      cryptoService.compareRefreshToken.mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue(mockUser);
      const result = await authService.refresh(refreshToken);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if user does not exist', async () => {
      const refreshToken = await createRefreshToken();
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(authService.refresh(refreshToken)).rejects.toThrow();
    });

    it('should throw an error if refresh token is expired', async () => {
      const refreshToken = await createRefreshToken('-1s');
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(authService.refresh(refreshToken)).rejects.toThrow();
    });

    it('should throw an error if no refresh token is provided', async () => {
      await expect(authService.refresh('')).rejects.toThrow();
    });
  });
});
