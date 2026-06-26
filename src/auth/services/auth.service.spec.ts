import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let cryptoService: any;
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '',
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    cryptoService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    };
    const jwtService = new JwtService();
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
      expect(createdUser).toEqual(mockUserWithoutPassword);
      expect(createdUser.id).toEqual(mockUser.id);
    });
  });

  describe('login', () => {
    it('should throw an error if user does not exist', async () => {
      const user = { email: mockUser.email, password: 'password' };
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(authService.login(user)).rejects.toThrow();
    });
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
