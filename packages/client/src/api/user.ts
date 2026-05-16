import request from "../utils/request";
import type {
  RegisterRequest,
  LoginWithPasswordRequest,
} from "@lowcode/share";

// 注册接口
export async function getRegister(data: RegisterRequest) {
  return request("/user/register", {
    data,
    method: "Post",
  });
}

/**
 * 账号密码登录
 */
export async function getLoginWithPassword(data: LoginWithPasswordRequest) {
  return request("/user/password_login", {
    data,
    method: "POST",
  });
}
