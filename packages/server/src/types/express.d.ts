import type { TCurrentUser } from '../utils/request-user';

declare global {
  namespace Express {
    interface Request {
      currentUser?: TCurrentUser;
    }
  }
}

export {};
