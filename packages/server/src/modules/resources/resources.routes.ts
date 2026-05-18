import { Router } from 'express';
import type { RequestHandler, Router as ExpressRouter } from 'express';
import multer = require('multer');
import { env } from '../../config/env';
import { asyncHandler, HttpError, sendSuccess } from '../../utils/http';
import type { TCurrentUser } from '../../utils/request-user';
import {
  parseDeleteResourceQuery,
  parseResourcesQuery,
  parseResourcesType,
} from './resources.schemas';
import { ResourcesService } from './resources.service';

function requireCurrentUser(currentUser?: TCurrentUser) {
  if (!currentUser) {
    throw new HttpError(401, '请先登录');
  }
  return currentUser;
}

const upload = multer({ dest: env.uploadTempDir });

export function createResourcesRouter(
  resourcesService: ResourcesService,
  authMiddleware: RequestHandler,
): ExpressRouter {
  const router = Router();

  router.post(
    '/upload',
    authMiddleware,
    upload.single('file'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        throw new HttpError(400, '请选择要上传的文件');
      }

      sendSuccess(
        res,
        await resourcesService.upload(
          req.file,
          parseResourcesType(req.body?.type),
          requireCurrentUser(req.currentUser).id,
        ),
      );
    }),
  );

  router.delete(
    '/',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.deleteResource(
          parseDeleteResourceQuery(req.query).id,
          requireCurrentUser(req.currentUser).id,
        ),
      );
    }),
  );

  router.get(
    '/',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.getResources(
          parseResourcesQuery(req.query).type,
          requireCurrentUser(req.currentUser).id,
        ),
      );
    }),
  );

  return router;
}
