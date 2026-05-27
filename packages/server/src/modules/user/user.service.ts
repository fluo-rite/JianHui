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

function isDuplicateEntryError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    // mysql2 duplicate entry error code
    error.code === 'ER_DUP_ENTRY'
  );
}

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
    let user: User;

    try {
      user = await this.userRepository.save({
        username,
        head_img: avatar,
        phone: '',
        password: getSecret(password),
        open_id: '',
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new HttpError(400, '璇ョ敤鎴峰悕宸茶娉ㄥ唽');
      }
      throw error;
    }

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
