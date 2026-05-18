import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import type { DataSource } from 'typeorm';
import { jwtConfig } from '../config/jwt';
import { User } from '../entities/user.entity';
import { HttpError } from '../utils/http';

export function createAuthMiddleware(dataSource: DataSource) {
  return async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization?.startsWith('Bearer ')) {
        throw new HttpError(401, '请先登录');
      }

      const token = authorization.slice('Bearer '.length).trim();
      const payload = verify(token, jwtConfig.secret) as { id: number };
      const userRepository = dataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: payload.id });

      if (!user) {
        throw new HttpError(401, '出现错误，请重新登录');
      }

      const { password: _password, ...safeUser } = user;
      req.currentUser = safeUser;
      next();
    } catch (error) {
      next(error);
    }
  };
}
