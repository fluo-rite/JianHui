import type { NextFunction, Request, RequestHandler, Response } from 'express';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> | void,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function formatSuccess(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'msg' in payload &&
    Object.prototype.hasOwnProperty.call(payload, 'msg')
  ) {
    const typedPayload = payload as { msg: string; data?: unknown };
    return {
      code: 0,
      msg: typedPayload.msg,
      data: typedPayload.data,
    };
  }

  return {
    code: 0,
    data: payload,
  };
}

export function sendSuccess(res: Response, payload: unknown, status = 200) {
  return res.status(status).json(formatSuccess(payload));
}

export function ensureNumber(value: unknown, message: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, message);
  }
  return parsed;
}

export function ensureString(value: unknown, message: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, message);
  }
  return value.trim();
}

export function ensureObject(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, message);
  }
  return value as Record<string, unknown>;
}
