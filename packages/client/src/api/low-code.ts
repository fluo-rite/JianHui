import type {
  GetQuestionDataByIdRequest,
  UpdatePageRequest,
} from "@lowcode/share";
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

export async function publishPage(id: number) {
  return request(`/low_code/pages/${id}/publish`, {
    method: "POST",
  });
}

export async function closePage(id: number) {
  return request(`/low_code/pages/${id}/close`, {
    method: "POST",
  });
}

export async function reopenPage(id: number) {
  return request(`/low_code/pages/${id}/reopen`, {
    method: "POST",
  });
}

export async function deletePage(id: number) {
  return request(`/low_code/pages/${id}`, {
    method: "DELETE",
  });
}

export async function getQuestionComponents(pageId: number) {
  return request("/low_code/question_components", {
    params: { page_id: pageId },
  });
}

export async function getQuestionData(pageId: number) {
  return request("/low_code/question_data", {
    params: { page_id: pageId },
  });
}

export async function getQuestionDataByTypeRequest(
  data: GetQuestionDataByIdRequest
) {
  return request("/low_code/get_question_data_by_id", {
    data,
    method: "POST",
  });
}
