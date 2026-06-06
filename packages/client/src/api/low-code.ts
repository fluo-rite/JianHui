import type {
  QuestionDistributionResponse,
  SubmissionRecordPageResponse,
  TPageStatus,
  UpdatePageRequest,
} from "@lowcode/share";
import { requestClient } from "~/utils/request";
import request from "~/utils/request";
import { store } from "~/store";

export async function createPage() {
  return request("/low_code/pages", {
    method: "POST",
  });
}

export async function getPages() {
  return request("/low_code/pages");
}

export async function getPageDetail(id: number) {
  return request(`/low_code/pages/${id}`);
}

export async function updatePage(id: number, data: UpdatePageRequest) {
  return request(`/low_code/pages/${id}`, {
    data,
    method: "PUT",
  });
}

export async function updatePageStatus(
  id: number,
  status: Extract<TPageStatus, "published" | "closed">
) {
  return request(`/low_code/pages/${id}/status`, {
    data: { status },
    method: "PATCH",
  });
}

export async function deletePage(id: number) {
  return request(`/low_code/pages/${id}`, {
    method: "DELETE",
  });
}

export async function getQuestionComponents(pageId: number) {
  return request(`/low_code/pages/${pageId}/question-components`);
}

export async function getSubmissionRecords(
  pageId: number,
  params?: {
    limit?: number;
    cursor?: string | null;
  }
) {
  return request<SubmissionRecordPageResponse>(
    `/low_code/pages/${pageId}/submission-records`,
    {
      params: {
        limit: params?.limit,
        cursor: params?.cursor ?? undefined,
      },
    }
  );
}

export async function getQuestionDistribution(
  pageId: number,
  componentId: number
) {
  return request<QuestionDistributionResponse>(
    `/low_code/pages/${pageId}/question-components/${componentId}/distribution`
  );
}

function getFileNameFromDisposition(disposition?: string | null) {
  if (!disposition) return null;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? null;
}

export async function downloadSubmissionCsv(pageId: number) {
  const token = store.getState().auth.token;
  const response = await requestClient.get(
    `/low_code/pages/${pageId}/submissions/export.csv`,
    {
      headers: token
        ? {
            Authorization: token,
          }
        : undefined,
      responseType: "blob",
    }
  );

  const blob = response.data as Blob;
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  const filename =
    getFileNameFromDisposition(response.headers["content-disposition"]) ??
    `page-${pageId}-submissions.csv`;

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
