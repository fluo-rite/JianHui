import { JwtModuleOptions } from '@nestjs/jwt';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';

function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function getBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

// typeORM 链接数据库配置
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: getNumberEnv('DB_PORT', 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'jianhui-lowcode',
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: getBooleanEnv('DB_SYNCHRONIZE', true),
};

// redis 配置
export const redisConfig: RedisOptions = {
  port: getNumberEnv('REDIS_PORT', 6379),
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  password: process.env.REDIS_PASSWORD ?? '',
};

// token 参数配置
export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET ?? 'change-me',
  signOptions: { expiresIn: '7d' },
  global: true,
};

// 阿里云 oss 配置
export const aliOssConfig = {
  region: process.env.ALI_OSS_REGION ?? 'oss-cn-guangzhou',
  accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID ?? '',
  accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET ?? '',
  bucket: process.env.ALI_OSS_BUCKET ?? '',
};

export const aliOssDomain = process.env.ALI_OSS_CUSTOM_DOMAIN ?? '';
