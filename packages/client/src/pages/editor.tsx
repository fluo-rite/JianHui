import { useRequest, useTitle } from "ahooks";
import { InfoCircleOutlined } from "@ant-design/icons";
import { message, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EditorHeader from "./Editor/EditorHeader";
import EditorLeftPanel from "./Editor/EditorLeftPanel";
import EditorRightPanel from "./Editor/EditorRightPanel";
import EditorCanvas from "./Editor/EditorCanvas";
import type { EditorCanvasHandle } from "./Editor/EditorCanvas";

import { getPageDetail } from "~/api/low-code";
import { useStoreComponents, useStorePage } from "~/hooks";

function Editor() {
  useTitle("简汇 - 页面编辑");
  const navigate = useNavigate();
  const params = useParams();
  const pageId = Number(params.pageId);
  const { store: storeComps, replaceByPageDetail } = useStoreComponents();
  const { replacePage } = useStorePage();

  const canvasRef = useRef<EditorCanvasHandle>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrolling, setScrolling] = useState(false);

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
          message.warning("当前页面不可编辑");
          navigate("/pages", { replace: true });
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
        navigate("/pages", { replace: true });
      },
    }
  );

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrolling) clearTimeout(scrollTimeout);

      setScrolling(true);
      canvasRef.current?.setShowToolbar(false);

      scrollTimeout = setTimeout(() => {
        setScrolling(false);
        canvasRef.current?.setShowToolbar(true);
      }, 300);
    };

    canvasContainerRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      canvasContainerRef.current?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrolling]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f1f2f4]">
      <header className="shadow-sm p-4 bg-white">
        <EditorHeader />
      </header>
      <main className="flex flex-1 border overflow-x-hidden">
        <div className="w-80 bg-white px-4 overflow-y-auto">
          <EditorLeftPanel />
        </div>
        <div className="flex-auto flex flex-col items-center justify-center gap-3">
          <div className="w-[380px] rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <div className="flex items-start gap-1 leading-5">
              <InfoCircleOutlined className="mt-0.5" />
              <span>
                双击左侧组件可添加到画布中，添加后可在中间画布里拖拽调整顺序。
              </span>
            </div>
          </div>
          <div
            ref={canvasContainerRef}
            className="editor-canvas-container w-[380px] h-[700px] bg-white text-left overflow-y-auto overflow-x-hidden"
          >
            <EditorCanvas store={storeComps} onRef={canvasRef} />
          </div>
        </div>
        <div className="w-80 bg-white px-4 overflow-y-auto">
          <EditorRightPanel />
        </div>
      </main>
    </div>
  );
}

export default Editor;
