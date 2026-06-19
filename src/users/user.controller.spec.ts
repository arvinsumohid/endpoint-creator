import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = app.get<UserController>(UserController);
  });
  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('login', () => {
    it('should return invalid user or password if user does not exist', () => {
      const userLoginDto: UserLoginDto = {
        email: 'user@nonexistent.com',
        password: 'password',
      };
      expect(userController.login(userLoginDto)).toBe(
        'invalid user or password',
      );
    });

    it('should return invalid user or password when password is incorrect', () => {
      const userLoginDto: UserLoginDto = {
        email: 'user@existing.com',
        password: 'wrongpassword',
      };
      expect(userController.login(userLoginDto)).toBe(
        'invalid user or password',
      );
    });

    it('should block request after 5 failed attempts', () => {
      const userLoginDto: UserLoginDto = {
        email: 'user@existing.com',
        password: 'wrongpassword',
      };
      for (let i = 0; i < 5; i++) {
        expect(userController.login(userLoginDto)).toBe(
          'invalid user or password',
        );
      }
      expect(userController.login(userLoginDto)).toBe(
        'too many failed attempts, try again later',
      );
    });

    it('should return success when password is correct', () => {
      const userLoginDto: UserLoginDto = {
        email: 'user@existing.com',
        password: 'password',
      };
      expect(userController.login(userLoginDto)).toEqual({
        token: expect.any(String),
        user: userLoginDto,
      });
    });
  });

  describe('register', () => {
    const userRegisterDto: UserRegisterDto = {
      email: 'user@existing.com',
      name: 'User',
      password: 'password',
    };

    const newUserRegisterDto: UserRegisterDto = {
      email: 'user@new.com',
      name: 'New User',
      password: 'password',
    };

    it('should return error if user already exists', () => {
      expect(userController.register(userRegisterDto)).toBe(
        'user already exists',
      );
    });

    it('should return success when user is created', () => {
      expect(userController.register(newUserRegisterDto)).toBe(
        'successfully registered',
      );
    });
  });
});
