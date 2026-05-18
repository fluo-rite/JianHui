import type {
  LoginWithPasswordRequest,
  RegisterRequest,
} from '@lowcode/share';
import { sign } from 'jsonwebtoken';
import type { Repository } from 'typeorm';
import { jwtConfig } from '../../config/jwt';
import { User } from '../../entities/user.entity';
import { HttpError } from '../../utils/http';
import { getSecret } from '../../utils/secret';

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async register({ username, password, confirm }: RegisterRequest) {
    const existUser = await this.userRepository.findOne({ where: { username } });
    if (existUser) {
      throw new HttpError(400, '该用户名已被注册');
    }

    if (password !== confirm) {
      throw new HttpError(400, '输入的两次密码不一致');
    }

    const avatar = 'https://placehold.co/120x120/f5f5f5/000000/png?text=^_^';
    const user = await this.userRepository.save({
      username,
      head_img: avatar,
      phone: '',
      password: getSecret(password),
      open_id: '',
    });

    return {
      data: sign({ id: user.id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      }),
      msg: '注册成功',
    };
  }

  async passwordLogin({ username, password }: LoginWithPasswordRequest) {
    const foundUser = await this.userRepository.findOneBy({ username });
    if (!foundUser) {
      throw new HttpError(400, '账号不存在');
    }

    if (foundUser.password !== getSecret(password)) {
      throw new HttpError(400, '密码错误');
    }

    return {
      data: sign({ id: foundUser.id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      }),
      msg: '登录成功',
    };
  }
}
