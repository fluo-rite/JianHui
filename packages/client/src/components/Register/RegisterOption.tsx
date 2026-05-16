import { Button, Form, Input } from "antd";
import { useRequest } from "ahooks";
import { getRegister } from "../../api/user";
import type { RegisterRequest } from "@lowcode/share";
import { useStoreAuth } from "../../hooks/useStoreAuth";

export default function RegisterCaptcha() {
  const { login } = useStoreAuth();

  // 注册接口请求
  const { run: execRegister, loading: loadingWithRegister } = useRequest(
    async (values: RegisterRequest) => await getRegister(values),
    {
      manual: true,
      onSuccess: ({ data }) => {
        login(data);
      },
    }
  );
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Form
          onFinish={(values) => {
            execRegister(values);
          }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirm"
            rules={[{ required: true, message: "请输入确认密码!" }]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              disabled={loadingWithRegister}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
