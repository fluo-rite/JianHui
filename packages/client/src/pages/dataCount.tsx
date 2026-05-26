import { FormOutlined, LineChartOutlined } from "@ant-design/icons";
import type { IComponent } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, Spin, message } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPageDetail, getQuestionComponents } from "~/api/low-code";
import { useStorePage } from "~/hooks";
import ComponentDatas from "./DataCount/ComponentDatas";
import ComponentSelect from "./DataCount/ComponentSelect";
import DataSource from "./DataCount/DataSource";

export default function Statistics() {
  const nav = useNavigate();
  const params = useParams();
  const pageId = Number(params.pageId);
  const { replacePage } = useStorePage();
  const [disable, setDisable] = useState(false);
  const [components, setComponents] = useState<IComponent[]>([]);
  const [currentSelected, setCurrentSelected] = useState<IComponent>();

  function handleDisable() {
    setDisable(true);
  }

  const { loading } = useRequest(
    async () => {
      if (!pageId) {
        throw new Error("页面参数错误");
      }

      const [pageDetail, questionComponents] = await Promise.all([
        getPageDetail(pageId),
        getQuestionComponents(pageId),
      ]);

      return {
        pageDetail: pageDetail.data,
        questionComponents: questionComponents.data as IComponent[],
      };
    },
    {
      onSuccess: ({ pageDetail, questionComponents }) => {
        if (pageDetail.status === "draft") {
          message.warning("未发布页面暂无统计数据");
          nav("/pages", { replace: true });
          return;
        }

        replacePage({
          id: pageDetail.id,
          title: pageDetail.page_name,
          description: pageDetail.desc,
          tdk: pageDetail.tdk,
          status: pageDetail.status,
          createdAt: pageDetail.created_at ? String(pageDetail.created_at) : null,
          updatedAt: pageDetail.updated_at ? String(pageDetail.updated_at) : null,
          publishedAt: pageDetail.published_at
            ? String(pageDetail.published_at)
            : null,
          closedAt: pageDetail.closed_at ? String(pageDetail.closed_at) : null,
        });

        if (questionComponents.length === 0) {
          setDisable(true);
          message.warning("请先创建至少一个表单组件");
          return;
        }

        setComponents(questionComponents);
        setCurrentSelected(questionComponents[0]);
      },
      onError: () => {
        message.warning("页面不存在或无法访问");
        nav("/pages", { replace: true });
      },
    }
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f1f2f4]">
      <header className="flex items-center shadow-sm px-10 py-4 bg-white">
        <div className="flex-1">
          简汇数据统计
          <LineChartOutlined />
        </div>
        <div className="flex-1 flex justify-end items-center">
          <Button
            onClick={() => nav("/pages")}
            className="flex items-center mr-5"
          >
            返回页面管理
            <FormOutlined />
          </Button>
          <img
            src="https://placehold.co/40x40/f5f5f5/000000/png?text=^_^"
            className="rounded-full border cursor-pointer"
          />
        </div>
      </header>

      <div
        className={`${
          disable ? "opacity-50 select-none pointer-events-none" : ""
        } flex flex-1 p-4 flex-grow-[2] overflow-x-hidden overflow-y-auto`}
      >
        <div className="bg-white flex-1 mr-4">
          <ComponentDatas
            components={components}
            handleDisable={handleDisable}
            pageId={pageId}
          />
        </div>
        <div className="bg-white flex-[1] flex flex-col">
          <ComponentSelect
            components={components}
            setCurrnetSelected={setCurrentSelected}
            currentSelected={currentSelected?.id ?? 0}
          />
          <div className="w-full text-center">
            <DataSource currentSelected={currentSelected} pageId={pageId} />
          </div>
        </div>
      </div>
    </div>
  );
}
