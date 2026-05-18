import type { SignOptions } from 'jsonwebtoken';
import { env } from './env';

export const jwtConfig = {
  secret: env.jwtSecret,
  expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
};
