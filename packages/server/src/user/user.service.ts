import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RandomTool } from '../utils/RandomTool';
import { SecretTool } from '../utils/SecretTool';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly randomTool: RandomTool,
    private readonly secretTool: SecretTool,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 注册服务
   */
  async register(username: string, password: string, confirm: string) {
    // 用户名查重
    const existUser = await this.userRepository.findOne({ where: { username } });
    if (existUser) throw new BadRequestException('该用户名已被注册');

    // 验证二次密码
    if (password !== confirm) {
      throw new BadRequestException('输入的两次密码不一致');
    }

    // const avatar = this.randomTool.randomAvatar();
    const avatar = 'https://placehold.co/120x120/f5f5f5/000000/png?text=^_^';

    // 生成加密密码
    const pwd = this.secretTool.getSecret(password);

    // 将新用户的数据插入数据库
    const user = await this.userRepository.save({
      username,
      head_img: avatar,
      phone: '',
      password: pwd,
      open_id: '',
    });

    // 生成 7 天过期的 token
    const token = this.jwtService.sign({ id: user.id });

    return {
      data: token,
      msg: '注册成功',
    };
  }

  /**
   * 账号密码登录服务
   */
  async passwordLogin({ username, password }) {
    // 查找用户是否注册
    const foundUser = await this.userRepository.findOneBy({ username });
    if (!foundUser) throw new BadRequestException('账号不存在');

    // 检查密码是否正确
    const isPasswordValid =
      foundUser.password === this.secretTool.getSecret(password);
    if (!isPasswordValid) throw new BadRequestException('密码错误');

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }
}
