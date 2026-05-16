import { useTitle } from "ahooks";
import Account from "./Login/Account.tsx";

interface ILoginProps {
  changeState: () => void;
}
export default function Login(props: ILoginProps) {
  useTitle("简汇低代码平台 - 登录");

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-[368px] rounded-lg shadow-lg bg-white p-6 space-y-2 border-gray-200">
        <div className="space-y-2 px-12 text-center">
          <span className="font-bold">用户名登录</span>
          <p className="text-zinc-500 text-xs">登录后即可体验简汇低代码平台</p>
        </div>

        <Account />
        <div className="text-sm flex justify-center text-[#aaaaaa]">
          <span>
            还没账号？
            <span
              onClick={props.changeState}
              className="text-blue-500 cursor-pointer"
            >
              去注册
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
