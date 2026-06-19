import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginDto } from './dtos/user-login.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() body: UserLoginDto): string {
    return 'Hello World!';
  }

  @Post('register')
  register(@Body() body: UserLoginDto): string {
    return 'Hello World!';
  }
}
