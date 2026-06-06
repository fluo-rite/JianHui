import type {
  GetQuestionDataByIdRequest,
  PostQuestionDataRequest,
  TPageStatus,
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

interface SubmissionCursor {
  createdAt: string;
  id: number;
}

function validatePageOptions(
  type: UpdatePageRequest["components"][number]["type"],
  options: unknown,
  index: number
) {
  const validationIssues = getComponentOptionsValidationIssues(type, options);

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

export function parseComponentId(value: unknown) {
  return ensureNumber(value, "组件 id 错误");
}

export function parsePageStatusBody(body: unknown): { status: TPageStatus } {
  const values = ensureObject(body, "请求参数错误");
  const status = ensureString(values.status, "status 参数错误");

  if (!["published", "closed"].includes(status)) {
    throw new HttpError(400, "status 仅支持 published 或 closed");
  }

  return {
    status: status as TPageStatus,
  };
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

export function parseQuestionDataBody(body: unknown): PostQuestionDataRequest {
  const values = ensureObject(body, "请求参数错误");
  if (!Array.isArray(values.props)) {
    throw new HttpError(400, "props 必须是数组");
  }

  return {
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

export function parseSubmissionRecordsQuery(query: unknown): {
  limit: number;
  cursor: SubmissionCursor | null;
} {
  const values = ensureObject(query ?? {}, "查询参数错误");
  const limitValue = values.limit;
  const cursorValue = values.cursor;

  let limit = 50;
  if (limitValue !== undefined) {
    limit = ensureNumber(limitValue, "limit 参数错误");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, "limit 仅支持 1 到 100");
  }

  if (cursorValue == null || cursorValue === "") {
    return {
      limit,
      cursor: null,
    };
  }

  if (typeof cursorValue !== "string") {
    throw new HttpError(400, "cursor 参数错误");
  }

  try {
    const decoded = Buffer.from(cursorValue, "base64").toString("utf8");
    const payload = ensureObject(JSON.parse(decoded), "cursor 参数错误");
    const createdAt = ensureString(payload.createdAt, "cursor createdAt 参数错误");
    const id = ensureNumber(payload.id, "cursor id 参数错误");

    if (Number.isNaN(new Date(createdAt).getTime())) {
      throw new HttpError(400, "cursor createdAt 参数错误");
    }

    return {
      limit,
      cursor: {
        createdAt,
        id,
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(400, "cursor 参数错误");
  }
}

export function parseQuestionDistributionParams(
  pageId: unknown,
  componentId: unknown
): GetQuestionDataByIdRequest & { page_id: number } {
  return {
    id: parseComponentId(componentId),
    page_id: parsePageId(pageId),
  };
}
