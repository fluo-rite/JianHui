import { createHash } from 'node:crypto';

export function getSecret(data: string) {
  return createHash('md5').update(data).digest('hex');
}
