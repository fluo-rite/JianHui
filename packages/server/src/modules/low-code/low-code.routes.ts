import { Router } from "express";
import type { RequestHandler, Router as ExpressRouter } from "express";
import { asyncHandler, HttpError, sendSuccess } from "../../utils/http";
import { getRequestIp, getRequestUserAgent } from "../../utils/request-user";
import type { TCurrentUser } from "../../utils/request-user";
import { getSecret } from "../../utils/secret";
import {
  parsePageAndComponentBody,
  parsePageId,
  parseQuestionDataBody,
  parseUpdatePageBody,
} from "./low-code.schemas";
import { LowCodeService } from "./low-code.service";

function requireCurrentUser(currentUser?: TCurrentUser) {
  if (!currentUser) {
    throw new HttpError(401, "请先登录");
  }
  return currentUser;
}

export function createLowCodeRouter(
  lowCodeService: LowCodeService,
  authMiddleware: RequestHandler
): ExpressRouter {
  const router = Router();

  router.post(
    "/pages",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(res, await lowCodeService.createPage(requireCurrentUser(req.currentUser)));
    })
  );

  router.get(
    "/pages",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(res, await lowCodeService.getPages(requireCurrentUser(req.currentUser)));
    })
  );

  router.get(
    "/pages/:id",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getPageDetail(
          parsePageId(req.params.id),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.put(
    "/pages/:id",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.updatePage(
          parsePageId(req.params.id),
          parseUpdatePageBody(req.body),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.post(
    "/pages/:id/publish",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.publishPage(
          parsePageId(req.params.id),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.post(
    "/pages/:id/close",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.closePage(
          parsePageId(req.params.id),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.post(
    "/pages/:id/reopen",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.reopenPage(
          parsePageId(req.params.id),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.delete(
    "/pages/:id",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.deletePage(
          parsePageId(req.params.id),
          requireCurrentUser(req.currentUser)
        )
      );
    })
  );

  router.get(
    "/release",
    asyncHandler(async (req, res) => {
      sendSuccess(res, await lowCodeService.getPublicReleaseData(parsePageId(req.query.id)));
    })
  );

  router.get(
    "/is_question_data_posted",
    asyncHandler(async (req, res) => {
      const key = getSecret(`${getRequestIp(req)}${String(getRequestUserAgent(req))}`);
      sendSuccess(
        res,
        await lowCodeService.isQuestionDataPosted(key, parsePageId(req.query.page_id))
      );
    })
  );

  router.post(
    "/question_data",
    asyncHandler(async (req, res) => {
      const key = getSecret(`${getRequestIp(req)}${String(getRequestUserAgent(req))}`);
      sendSuccess(
        res,
        await lowCodeService.postQuestionData(parseQuestionDataBody(req.body), key)
      );
    })
  );

  router.get(
    "/question_components",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionComponents(
          requireCurrentUser(req.currentUser),
          parsePageId(req.query.page_id)
        )
      );
    })
  );

  router.get(
    "/question_data",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionData(
          requireCurrentUser(req.currentUser).id,
          parsePageId(req.query.page_id)
        )
      );
    })
  );

  router.post(
    "/get_question_data_by_id",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionDataByIdRequest({
          ...parsePageAndComponentBody(req.body),
          userId: requireCurrentUser(req.currentUser).id,
        })
      );
    })
  );

  return router;
}
