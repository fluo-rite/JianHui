import { Router } from "express";
import type { RequestHandler, Router as ExpressRouter } from "express";
import { asyncHandler, HttpError, sendSuccess } from "../../utils/http";
import { getRequestIp, getRequestUserAgent } from "../../utils/request-user";
import type { TCurrentUser } from "../../utils/request-user";
import { getSecret } from "../../utils/secret";
import {
  parseComponentId,
  parsePageId,
  parsePageStatusBody,
  parseQuestionComponentSubmissionParams,
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
      sendSuccess(
        res,
        await lowCodeService.createPage(requireCurrentUser(req.currentUser))
      );
    })
  );

  router.get(
    "/pages",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getPages(requireCurrentUser(req.currentUser))
      );
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

  router.patch(
    "/pages/:id/status",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const pageId = parsePageId(req.params.id);
      const { status } = parsePageStatusBody(req.body);
      const currentUser = requireCurrentUser(req.currentUser);

      const result =
        status === "closed"
          ? await lowCodeService.closePage(pageId, currentUser)
          : await lowCodeService.getPageDetail(pageId, currentUser).then((page) => {
              if (page.status === "closed") {
                return lowCodeService.reopenPage(pageId, currentUser);
              }
              if (page.status === "draft") {
                return lowCodeService.publishPage(pageId, currentUser);
              }
              return { msg: "页面已发布" };
            });

      sendSuccess(res, result);
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
    "/public/pages/:pageId",
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getPublicReleaseData(parsePageId(req.params.pageId))
      );
    })
  );

  router.get(
    "/public/pages/:pageId/submission",
    asyncHandler(async (req, res) => {
      const key = getSecret(
        `${getRequestIp(req)}${String(getRequestUserAgent(req))}`
      );
      sendSuccess(res, {
        submitted: await lowCodeService.isQuestionDataPosted(
          key,
          parsePageId(req.params.pageId)
        ),
      });
    })
  );

  router.post(
    "/public/pages/:pageId/submissions",
    asyncHandler(async (req, res) => {
      const key = getSecret(
        `${getRequestIp(req)}${String(getRequestUserAgent(req))}`
      );
      sendSuccess(
        res,
        await lowCodeService.postQuestionData(
          parsePageId(req.params.pageId),
          parseQuestionDataBody(req.body),
          key
        )
      );
    })
  );

  router.get(
    "/pages/:pageId/question-components",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionComponents(
          requireCurrentUser(req.currentUser),
          parsePageId(req.params.pageId)
        )
      );
    })
  );

  router.get(
    "/pages/:pageId/submissions",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionData(
          requireCurrentUser(req.currentUser).id,
          parsePageId(req.params.pageId)
        )
      );
    })
  );

  router.get(
    "/pages/:pageId/question-components/:componentId/submissions",
    authMiddleware,
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await lowCodeService.getQuestionDataByIdRequest({
          ...parseQuestionComponentSubmissionParams(
            req.params.pageId,
            req.params.componentId
          ),
          userId: requireCurrentUser(req.currentUser).id,
        })
      );
    })
  );

  return router;
}
