import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { PasswordLoginDto } from './dto/login.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 注册控制器
   */
  @Post('register')
  register(@Body() body: RegisterDto) {
    const { username, password, confirm } = body;
    return this.userService.register(username, password, confirm);
  }

  /**
   * 账号密码登录控制器
   */
  @Post('password_login')
  passwordLogin(@Body() body: PasswordLoginDto) {
    return this.userService.passwordLogin(body);
  }
}
