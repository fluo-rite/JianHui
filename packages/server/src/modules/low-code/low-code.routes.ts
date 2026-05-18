import { Router } from 'express';
import type { RequestHandler, Router as ExpressRouter } from 'express';
import { asyncHandler, HttpError, sendSuccess } from '../../utils/http';
import { getRequestIp, getRequestUserAgent } from '../../utils/request-user';
import type { TCurrentUser } from '../../utils/request-user';
import { getSecret } from '../../utils/secret';
import {
  parseComponentIdBody,
  parsePageId,
  parseQuestionDataBody,
  parseReleaseBody,
} from './low-code.schemas';
import { LowCodeService } from './low-code.service';

function requireCurrentUser(currentUser?: TCurrentUser) {
  if (!currentUser) {
    throw new HttpError(401, '请先登录');
  }
  return currentUser;
}

export function createLowCodeRouter(
  lowCodeService: LowCodeService,
  authMiddleware: RequestHandler,
): ExpressRouter {
  const router = Router();

  router.post(
    '/release',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.release(
          parseReleaseBody(req.body),
          requireCurrentUser(req.currentUser),
        ),
      );
    }),
  );

  router.get(
    '/release_with_user',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getReleaseData(null, requireCurrentUser(req.currentUser)),
      );
    }),
  );

  router.get(
    '/release',
    asyncHandler(async (req, res) => {
      sendSuccess(res, await lowCodeService.getReleaseData(parsePageId(req.query.id)));
    }),
  );

  router.get(
    '/is_question_data_posted',
    asyncHandler(async (req, res) => {
      const key = getSecret(
        `${getRequestIp(req)}${String(getRequestUserAgent(req))}`,
      );
      sendSuccess(
        res,
        await lowCodeService.isQuestionDataPosted(key, parsePageId(req.query.page_id)),
      );
    }),
  );

  router.post(
    '/question_data',
    asyncHandler(async (req, res) => {
      const key = getSecret(
        `${getRequestIp(req)}${String(getRequestUserAgent(req))}`,
      );
      sendSuccess(
        res,
        await lowCodeService.postQuestionData(
          parseQuestionDataBody(req.body),
          key,
        ),
      );
    }),
  );

  router.get(
    '/question_components',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionComponents(
          requireCurrentUser(req.currentUser),
        ),
      );
    }),
  );

  router.get(
    '/question_data',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionData(requireCurrentUser(req.currentUser).id),
      );
    }),
  );

  router.post(
    '/get_question_data_by_id',
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionDataByIdRequest({
          ...parseComponentIdBody(req.body),
          userId: requireCurrentUser(req.currentUser).id,
        }),
      );
    }),
  );

  return router;
}
