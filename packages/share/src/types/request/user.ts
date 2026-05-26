import type { IUser } from "..";

export interface CaptchaRequest {
  type: "register" | "login";
}

// 注册接口的参数类型
export type RegisterRequest = Pick<IUser, "username" | "password"> & {
  confirm: string;
};

// 账号密码登录接口参数类型
export type LoginWithPasswordRequest = Pick<IUser, "username" | "password">;

// 账号密码登录接口参数类型
export type LoginWithPhoneRequest = Pick<IUser, "phone"> & { sendCode: string };
