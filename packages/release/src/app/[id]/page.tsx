import ComponentRender from "../../components/ComponentRender";
import type { GetReleaseDataResponse, IRichTextContent } from "@lowcode/share";
import sanitizeHtml from "sanitize-html";
import { renderRichTextContentToHtml } from "../../utils/richText";

export const dynamic = "force-dynamic";

const API_INTERNAL_BASE_URL =
  process.env.API_INTERNAL_BASE_URL || "http://127.0.0.1:5000/api";

async function getData(id: string) {
  // 请求后端接口获取发布页面组件
  const response = await fetch(
    `${API_INTERNAL_BASE_URL}/low_code/release?id=${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error("未找到");

  const toJson = (await response.json()) as {
    code: number;
    data?: GetReleaseDataResponse;
  };

  if (!toJson.data) throw new Error("404");

  return {
    ...toJson.data!,
    components: toJson.data!.components.map((component) => {
      if (component.type !== "richText") return component;

      const content = component.options.content as IRichTextContent;
      const renderedHtml = sanitizeHtml(renderRichTextContentToHtml(content), {
        allowedTags: [
          "p",
          "br",
          "span",
          "strong",
          "em",
          "u",
          "s",
          "blockquote",
          "pre",
          "code",
          "h1",
          "h2",
          "h3",
          "h4",
          "ol",
          "ul",
          "li",
        ],
        allowedAttributes: {
          "*": ["style"],
        },
        allowedStyles: {
          "*": {
            color: [/^.*$/],
            "background-color": [/^.*$/],
            "text-align": [/^(left|right|center|justify)$/],
            "font-family": [/^.*$/],
          },
        },
      });

      return {
        ...component,
        options: {
          ...component.options,
          renderedHtml,
        },
      };
    }),
  };
}

interface PageType {
  params: { id: string };
}
export default async function Page({ params }: PageType) {
  const data = await getData(params.id);

  return (
    <div className="App">
      <ComponentRender data={data} id={params.id} />
    </div>
  );
}
