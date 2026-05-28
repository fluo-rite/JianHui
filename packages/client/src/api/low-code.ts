import type { TPageStatus, UpdatePageRequest } from "@lowcode/share";
import request from "~/utils/request";

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

export async function getQuestionData(pageId: number) {
  return request(`/low_code/pages/${pageId}/submissions`);
}

export async function getQuestionComponentSubmissions(
  pageId: number,
  componentId: number
) {
  return request(
    `/low_code/pages/${pageId}/question-components/${componentId}/submissions`
  );
}
