import { Router } from 'express';
import type { RequestHandler, Router as ExpressRouter } from 'express';
import { asyncHandler, HttpError, sendSuccess } from '../../utils/http';
import type { TCurrentUser } from '../../utils/request-user';
import {
  parseAbortUploadBody,
  parseCompleteUploadBody,
  parseDeleteResourceQuery,
  parseDirectUploadInitBody,
  parseMultipartPartUrlBody,
  parseMultipartUploadInitBody,
  parseResourcesQuery,
} from './resources.schemas';
import { ResourcesService } from './resources.service';

function requireCurrentUser(currentUser?: TCurrentUser) {
  if (!currentUser) {
    throw new HttpError(401, '请先登录');
  }
  return currentUser;
}

export function createResourcesRouter(
  resourcesService: ResourcesService,
  authMiddleware: RequestHandler,
): ExpressRouter {
  const router = Router();

  router.post(
    '/uploads/direct/init',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.initDirectUpload({
          ...parseDirectUploadInitBody(req.body),
          accountId: requireCurrentUser(req.currentUser).id,
        }),
      );
    }),
  );

  router.post(
    '/uploads/multipart/init',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.initMultipartUpload({
          ...parseMultipartUploadInitBody(req.body),
          accountId: requireCurrentUser(req.currentUser).id,
        }),
      );
    }),
  );

  router.post(
    '/uploads/multipart/part-url',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.createMultipartPartUploadUrl({
          ...parseMultipartPartUrlBody(req.body),
          accountId: requireCurrentUser(req.currentUser).id,
        }),
      );
    }),
  );

  router.post(
    '/uploads/complete',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await resourcesService.completeUpload({
          ...parseCompleteUploadBody(req.body),
          accountId: requireCurrentUser(req.currentUser).id,
        }),
      );
    }),
  );

  router.post(
    '/uploads/abort',
    authMiddleware,
    asyncHandler(async (req, res) => {
      const currentUser = requireCurrentUser(req.currentUser);
      const payload = parseAbortUploadBody(req.body);
      sendSuccess(
        res,
        await resourcesService.abortUpload(
          payload.objectKey,
          payload.uploadId,
          currentUser.id,
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
