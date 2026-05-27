import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

const packageRoot = resolve(__dirname, '..', '..', '..');
const uploadTempDir = resolve(packageRoot, '__temps__');

mkdirSync(uploadTempDir, { recursive: true });

export const env = {
  packageRoot,
  uploadTempDir,
  port: getNumberEnv('PORT', 3000),
  dbHost: process.env.DB_HOST ?? '127.0.0.1',
  dbPort: getNumberEnv('DB_PORT', 3306),
  dbUsername: process.env.DB_USERNAME ?? 'root',
  dbPassword: process.env.DB_PASSWORD ?? '',
  dbDatabase: process.env.DB_DATABASE ?? 'jianhui-lowcode',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: '7d',
  aliOssRegion: process.env.ALI_OSS_REGION ?? 'oss-cn-guangzhou',
  aliOssAccessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID ?? '',
  aliOssAccessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET ?? '',
  aliOssBucket: process.env.ALI_OSS_BUCKET ?? '',
  aliOssCustomDomain: process.env.ALI_OSS_CUSTOM_DOMAIN ?? '',
};
