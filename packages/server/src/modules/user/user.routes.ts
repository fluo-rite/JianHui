import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { asyncHandler, sendSuccess } from '../../utils/http';
import {
  parsePasswordLoginBody,
  parseRegisterBody,
} from './user.schemas';
import { UserService } from './user.service';

export function createUserRouter(userService: UserService): ExpressRouter {
  const router = Router();

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      sendSuccess(res, await userService.register(parseRegisterBody(req.body)));
    }),
  );

  router.post(
    '/password_login',
    asyncHandler(async (req, res) => {
      sendSuccess(
        res,
        await userService.passwordLogin(parsePasswordLoginBody(req.body)),
      );
    }),
  );

  return router;
}
