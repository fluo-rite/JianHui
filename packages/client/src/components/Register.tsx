import { useTitle } from "ahooks";
import RegisterOption from "./Register/RegisterOption";

interface IRegisterProps {
  changeState: () => void; // 切换弹窗
}

export default function Register(props: IRegisterProps) {
  useTitle("简汇低代码平台 - 注册");
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-[368px] rounded-lg shadow-lg bg-white p-6 space-y-2 border-gray-200">
        <div className="space-y-2 px-12 text-center">
          <span className="font-bold cursor-pointer">快速注册</span>
        </div>

        {/* 注册输入框 */}
        <RegisterOption />
        <div className="text-sm flex justify-center text-[#aaaaaa]">
          <span>
            已有账号？
            <span
              onClick={props.changeState}
              className="text-blue-500 cursor-pointer"
            >
              去登录
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
