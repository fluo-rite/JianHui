import { AppstoreOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Right() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center">
      <Button onClick={() => navigate("/pages")} className="flex items-center mr-5">
        页面管理
        <AppstoreOutlined />
      </Button>
      <img
        src="https://placehold.co/40x40/f5f5f5/000000/png?text=^_^"
        className="rounded-full border cursor-pointer"
      />
    </div>
  );
}
