import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { QueryFailedError } from 'typeorm';
import { HttpError } from '../utils/http';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    code: -1,
    data: null,
    msg: `未找到接口: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof TokenExpiredError) {
    return res.status(401).json({
      code: -1,
      data: null,
      msg: '登录已过期，请重新登陆',
    });
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(401).json({
      code: -1,
      data: null,
      msg: '请先登录',
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      code: -1,
      data: null,
      msg: error.message,
    });
  }

  if (error instanceof QueryFailedError) {
    return res.status(500).json({
      code: -1,
      data: null,
      msg: error.message,
    });
  }

  const message = error instanceof Error ? error.message : '服务器内部错误';

  return res.status(500).json({
    code: -1,
    data: null,
    msg: message,
  });
}
