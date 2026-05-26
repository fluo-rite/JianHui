import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { message } from "antd";
import { authActions, store } from "~/store";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const request = axios.create({ baseURL: BASE_URL });

// 定义请求拦截器，统一携带 token
request.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// 定义响应拦截器，统一
request.interceptors.response.use(
  (response) => {
    const data = response?.data;
    if (data.code === 0 && data.msg !== undefined) {
      message.success(data.msg);
    }
    return response;
  },
  (err) => {
    const response = err?.response;
    const status = response?.status;
    const msg = response?.data?.msg ?? "请求异常";

    if (status === 401) {
      message.warning(msg);
      store.dispatch(authActions.clearAuth());
      localStorage.removeItem("token");

      if (window.location.hash !== "#/login_or_register") {
        window.location.hash = "#/login_or_register";
      }

      return Promise.reject(err);
    }

    if (typeof status === "number" && status >= 400) {
      message.warning(msg);
    }

    return Promise.reject(err);
  }
);

export default async function makeRequest(
  url: string,
  options?: AxiosRequestConfig
) {
  return (await request({ url, ...options })).data;
}
