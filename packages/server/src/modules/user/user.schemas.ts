import type {
  LoginWithPasswordRequest,
  RegisterRequest,
} from '@lowcode/share';
import { ensureObject, ensureString } from '../../utils/http';

export function parseRegisterBody(body: unknown): RegisterRequest {
  const values = ensureObject(body, '请求参数错误');

  return {
    username: ensureString(values.username, 'username限制不为空!'),
    password: ensureString(values.password, 'password限制不为空!'),
    confirm: ensureString(values.confirm, 'confirm限制不为空!'),
  };
}

export function parsePasswordLoginBody(
  body: unknown,
): LoginWithPasswordRequest {
  const values = ensureObject(body, '请求参数错误');

  return {
    username: ensureString(values.username, 'username限制不为空!'),
    password: ensureString(values.password, 'password限制不为空!'),
  };
}
