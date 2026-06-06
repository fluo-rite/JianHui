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
  const [components, setComponents] = useState<IComponent[]>([]);
  const [currentSelected, setCurrentSelected] = useState<IComponent>();

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
    <div className="flex min-h-screen flex-col bg-[#f1f2f4]">
      <header className="flex items-center bg-white px-6 py-4 shadow-sm md:px-10">
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

      <div className="flex flex-1 flex-col gap-4 p-4 xl:min-h-0 xl:flex-row">
        <div className="min-w-0 rounded-2xl bg-white shadow-sm xl:flex-[1.6]">
          <ComponentDatas components={components} pageId={pageId} />
        </div>
        <div className="min-w-0 rounded-2xl bg-white shadow-sm xl:flex xl:min-h-0 xl:w-[420px] xl:min-w-[380px] xl:max-w-[480px] xl:flex-col">
          <ComponentSelect
            components={components}
            setCurrnetSelected={setCurrentSelected}
            currentSelected={currentSelected?.id ?? 0}
          />
          <div className="min-h-[420px] border-t border-slate-100 xl:flex-1 xl:min-h-0">
            <DataSource currentSelected={currentSelected} pageId={pageId} />
          </div>
        </div>
      </div>
    </div>
  );
}
