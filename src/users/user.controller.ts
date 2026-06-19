import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginDto } from './user-login.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() body: UserLoginDto): string {
    return 'Hello World!';
  }
}
