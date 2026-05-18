import type { IUser } from '@lowcode/share';
import type { Request } from 'express';

export type TCurrentUser = Omit<IUser, 'password'>;

export function getRequestIp(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : '';

  const candidate = firstForwarded || req.ip || req.socket.remoteAddress || '';
  return candidate.match(/\d+\.\d+\.\d+\.\d+/)?.[0] ?? candidate;
}

export function getRequestUserAgent(req: Request) {
  return req.headers['user-agent'] ?? '';
}
