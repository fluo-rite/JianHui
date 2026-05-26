import { CaretLeftOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { FloatButton, Spin, message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateComponent } from "./Editor/EditorCanvas";
import { getPageDetail } from "~/api/low-code";
import { useStoreComponents, useStorePage } from "~/hooks";

const PreviewCanvas = () => {
  const { store, getComponentById } = useStoreComponents();

  return (
    <>
      {store.sortableCompConfig
        .map((id) => getComponentById(id))
        .map((conf) => generateComponent(conf))}
    </>
  );
};

export default function Preview() {
  const nav = useNavigate();
  const params = useParams();
  const pageId = Number(params.pageId);
  const { replaceByPageDetail } = useStoreComponents();
  const { replacePage } = useStorePage();

  const { loading } = useRequest(
    async () => {
      if (!pageId) {
        throw new Error("页面参数错误");
      }
      return getPageDetail(pageId);
    },
    {
      onSuccess: ({ data }) => {
        if (data.status !== "draft") {
          message.warning("当前页面不可预览");
          nav("/pages", { replace: true });
          return;
        }

        replaceByPageDetail(data);
        replacePage({
          id: data.id,
          title: data.page_name,
          description: data.desc,
          tdk: data.tdk,
          status: data.status,
          createdAt: data.created_at ? String(data.created_at) : null,
          updatedAt: data.updated_at ? String(data.updated_at) : null,
          publishedAt: data.published_at ? String(data.published_at) : null,
          closedAt: data.closed_at ? String(data.closed_at) : null,
        });
      },
      onError: () => {
        message.warning("页面不存在或无法访问");
        nav("/pages", { replace: true });
      },
    }
  );

  useEffect(() => {
    if (!pageId) {
      nav("/pages", { replace: true });
    }
  }, [nav, pageId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-[#f1f2f4]">
      <div className="w-[380px] h-[700px] bg-white text-left overflow-y-auto overflow-x-hidden">
        <PreviewCanvas />
        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    </div>
  );
}
