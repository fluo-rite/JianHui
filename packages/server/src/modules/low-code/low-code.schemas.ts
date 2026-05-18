import type {
  PostQuestionDataRequest,
  PostReleaseRequest,
} from '@lowcode/share';
import { HttpError, ensureNumber, ensureObject, ensureString } from '../../utils/http';

export function parseReleaseBody(body: unknown): PostReleaseRequest {
  const values = ensureObject(body, '请求参数错误');
  if (!Array.isArray(values.components)) {
    throw new HttpError(400, 'components 必须是数组');
  }

  return {
    page_name: ensureString(values.page_name, '页面名称不能为空'),
    desc: typeof values.desc === 'string' ? values.desc : '',
    tdk: typeof values.tdk === 'string' ? values.tdk : '',
    components: values.components.map((component) => {
      const item = ensureObject(component, '组件配置错误');
      return {
        id: 0,
        type: ensureString(item.type, '组件类型不能为空') as any,
        options:
          item.options && typeof item.options === 'object'
            ? (item.options as Record<string, any>)
            : {},
      };
    }),
  };
}

export function parsePageId(value: unknown) {
  return ensureNumber(value, 'page_id 参数错误');
}

export function parseQuestionDataBody(
  body: unknown,
): PostQuestionDataRequest {
  const values = ensureObject(body, '请求参数错误');
  if (!Array.isArray(values.props)) {
    throw new HttpError(400, 'props 必须是数组');
  }

  return {
    page_id: ensureNumber(values.page_id, 'page_id 参数错误'),
    props: values.props.map((item) => {
      const record = ensureObject(item, '问卷数据格式错误');
      return {
        id: ensureNumber(record.id, '组件 id 错误'),
        value: Array.isArray(record.value)
          ? record.value.map((value) => String(value))
          : record.value == null
            ? ''
            : String(record.value),
      };
    }),
  };
}

export function parseComponentIdBody(body: unknown) {
  const values = ensureObject(body, '请求参数错误');
  return {
    id: ensureNumber(values.id, '组件 id 错误'),
  };
}
