import {
  AuthRegisterDto,
  AuthRegisterResponseDto,
} from '../dtos/auth-register.dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    authService = new AuthService(prismaService);
  });

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'password' };
      prismaService.user.findUnique.mockResolvedValue(user);
      await expect(authService.register(user)).rejects.toThrow();
    });

    it('should create a new user if user does not exist', async () => {
      const userToCreate: AuthRegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
      };
      const userWithoutPassword = { ...userToCreate, password: undefined };
      const mockUser: AuthRegisterResponseDto = {
        id: '1',
        ...userWithoutPassword,
      };
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);

      const createdUser = await authService.register(userToCreate);
      expect(createdUser).toEqual(mockUser);
      expect(createdUser.id).toEqual('1');
    });
  });
});
