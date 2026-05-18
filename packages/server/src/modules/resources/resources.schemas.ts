import type { UploadType } from '@lowcode/share';
import { HttpError, ensureNumber, ensureObject, ensureString } from '../../utils/http';

export function parseResourcesType(source: unknown): UploadType {
  const type = ensureString(source, '资源类型不能为空');
  if (!['image', 'video'].includes(type)) {
    throw new HttpError(400, '资源类型错误');
  }
  return type as UploadType;
}

export function parseResourcesQuery(query: unknown) {
  const values = ensureObject(query, '请求参数错误');
  return {
    type: parseResourcesType(values.type),
  };
}

export function parseDeleteResourceQuery(query: unknown) {
  const values = ensureObject(query, '请求参数错误');
  return {
    id: ensureNumber(values.id, '资源 id 错误'),
  };
}
