"use client";

import { getComponentByType } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { useState } from "react";
import { useImmer } from "use-immer";
import type { ReleaseComponentData, ReleasePageData } from "../types/release";
import ReleaseRichText from "./ReleaseRichText";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const usingInputType = ["input", "textArea", "radio", "checkbox"];

interface RenderComponentConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

function generateComponent(
  conf: RenderComponentConfig,
  onUpdate: (value: unknown) => void
) {
  if (conf.type === "richText") {
    const html =
      typeof conf.props.renderedHtml === "string" ? conf.props.renderedHtml : "";

    return <ReleaseRichText html={html} key={conf.id} />;
  }

  const Component = getComponentByType(conf.type as never);

  if (!usingInputType.includes(conf.type)) {
    return <Component {...conf.props} key={conf.id} />;
  }

  return <Component {...conf.props} key={conf.id} onUpdate={onUpdate} />;
}

function getQuestionComponentValueField(component: { type: string }) {
  switch (component.type) {
    case "input":
    case "textArea":
      return "text";
    case "radio":
    case "checkbox":
      return "value";
    default:
      return null;
  }
}

function isQuestionComponentCompleted(component: ReleaseComponentData) {
  switch (component.type) {
    case "input":
    case "textArea": {
      const value = component.options.text;
      return typeof value === "string" && value.trim().length > 0;
    }
    case "radio": {
      const value = component.options.value;
      return typeof value === "string" && value.trim().length > 0;
    }
    case "checkbox":
      return true;
    default:
      return true;
  }
}

function getQuestionComponentSubmitValue(component: ReleaseComponentData) {
  const field = getQuestionComponentValueField(component);
  if (!field) return undefined;

  const value = component.options[field];
  if (component.type === "checkbox") {
    return Array.isArray(value) ? value : [];
  }

  return typeof value === "string" ? value : "";
}

interface ComponentRenderProps {
  id: string;
  data: ReleasePageData;
}

export default function ComponentRender({ data, id }: ComponentRenderProps) {
  const [isPosted, setIsPosted] = useState(false);
  const [localData, setLocalData] = useImmer(
    JSON.parse(JSON.stringify(data)) as ReleasePageData
  );

  function generateComponents() {
    return localData.components
      .map((comp) => {
        return {
          id: String(comp.id),
          type: comp.type,
          props: comp.options,
        };
      })
      .map((comp) =>
        generateComponent(comp, (value) => {
          setLocalData((draft) => {
            const target = draft.components.find(
              (item) => String(item.id) === comp.id
            );
            if (!target) return;

            const field = getQuestionComponentValueField(target);
            if (field) {
              target.options[field] = value;
            }
          });
        })
      );
  }

  useRequest(
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/low_code/is_question_data_posted?page_id=${data.id}`
      );

      return response.json() as Promise<{ data: boolean }>;
    },
    {
      onSuccess: ({ data }) => {
        if (data) {
          setIsPosted(true);
          message.open({ content: "您已提交过问卷，感谢您的参与" });
        }
      },
    }
  );

  const { run, loading } = useRequest(
    async () => {
      const isNotCompleted = localData.components.some((comp) => {
        if (!usingInputType.includes(comp.type)) return false;
        return !isQuestionComponentCompleted(comp);
      });

      if (isNotCompleted) {
        return { msg: "请填写完整问卷信息", data: false };
      }

      const response = await fetch(
        `${API_BASE_URL}/low_code/question_data?id=${data.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            page_id: id,
            props: localData.components
              .filter((comp) => usingInputType.includes(comp.type))
              .map((comp) => {
                return {
                  id: comp.id,
                  value: getQuestionComponentSubmitValue(comp),
                };
              }),
          }),
        }
      );

      return response.json();
    },
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        if (data !== undefined) {
          message.warning(msg);
        } else {
          message.success(msg);
          setIsPosted(true);
        }
      },
    }
  );

  return (
    <div
      className={`${isPosted ? "opacity-50 pointer-events-none select-none" : ""}`}
    >
      {generateComponents()}

      {data.components.some((comp) => usingInputType.includes(comp.type)) && (
        <div className="flex items-center justify-center">
          <Button type="primary" onClick={run} loading={loading}>
            提交问卷
          </Button>
        </div>
      )}
    </div>
  );
}
