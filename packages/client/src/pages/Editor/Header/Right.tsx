import { Button } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function Right() {
  const navigate = useNavigate();
  const toStatistics = () => {
    navigate("/dataCount");
  };

  return (
    <div className="flex items-center">
      <Button onClick={toStatistics} className="flex items-center mr-5">
        后台数据统计
        <LineChartOutlined />
      </Button>
      <img
        src="https://placehold.co/40x40/f5f5f5/000000/png?text=^_^"
        className="rounded-full border cursor-pointer"
      />
    </div>
  );
}
