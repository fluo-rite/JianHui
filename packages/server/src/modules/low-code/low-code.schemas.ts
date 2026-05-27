import type {
  GetQuestionDataByIdRequest,
  PostQuestionDataRequest,
  UpdatePageRequest,
} from "@lowcode/share";
import {
  getComponentOptionsValidationIssues,
  isSupportedComponentType,
} from "@lowcode/share";
import {
  HttpError,
  ensureNumber,
  ensureObject,
  ensureString,
} from "../../utils/http";

function validatePageOptions(
  type: UpdatePageRequest["components"][number]["type"],
  options: unknown,
  index: number
) {
  const validationIssues = getComponentOptionsValidationIssues(
    type,
    options
  );

  if (validationIssues.length > 0) {
    const firstIssue = validationIssues[0];
    const path = firstIssue.path ? `.${firstIssue.path}` : "";
    throw new HttpError(
      400,
      `components[${index}].options${path} ${firstIssue.message}`.trim()
    );
  }

  return options as UpdatePageRequest["components"][number]["options"];
}

export function parsePageId(value: unknown) {
  return ensureNumber(value, "page_id 参数错误");
}

export function parseUpdatePageBody(body: unknown): UpdatePageRequest {
  const values = ensureObject(body, "请求参数错误");
  if (!Array.isArray(values.components)) {
    throw new HttpError(400, "components 必须是数组");
  }

  return {
    page_name: ensureString(values.page_name, "页面名称不能为空"),
    desc: typeof values.desc === "string" ? values.desc : "",
    tdk: typeof values.tdk === "string" ? values.tdk : "",
    components: values.components.map((component, index) => {
      const item = ensureObject(component, "组件配置错误");
      const type = ensureString(item.type, "组件类型不能为空");
      if (!isSupportedComponentType(type)) {
        throw new HttpError(400, `components[${index}].type 不支持的组件类型`);
      }

      return {
        type,
        options: validatePageOptions(type, item.options, index),
      } as UpdatePageRequest["components"][number];
    }) as UpdatePageRequest["components"],
  };
}

export function parseQuestionDataBody(
  body: unknown
): PostQuestionDataRequest {
  const values = ensureObject(body, "请求参数错误");
  if (!Array.isArray(values.props)) {
    throw new HttpError(400, "props 必须是数组");
  }

  return {
    page_id: ensureNumber(values.page_id, "page_id 参数错误"),
    props: values.props.map((item) => {
      const record = ensureObject(item, "问卷数据格式错误");
      return {
        id: ensureNumber(record.id, "组件 id 错误"),
        value: Array.isArray(record.value)
          ? record.value.map((value) => String(value))
          : record.value == null
            ? ""
            : String(record.value),
      };
    }),
  };
}

export function parsePageAndComponentBody(
  body: unknown
): GetQuestionDataByIdRequest {
  const values = ensureObject(body, "请求参数错误");
  return {
    id: ensureNumber(values.id, "组件 id 错误"),
    page_id: ensureNumber(values.page_id, "page_id 参数错误"),
  };
}
