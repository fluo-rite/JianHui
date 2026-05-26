import ComponentRender from "../../components/ComponentRender";
import type { ReleasePageData } from "../../types/release";

export const dynamic = "force-dynamic";

const API_INTERNAL_BASE_URL =
  process.env.API_INTERNAL_BASE_URL || "http://127.0.0.1:5000/api";

async function getData(id: string) {
  const response = await fetch(
    `${API_INTERNAL_BASE_URL}/low_code/release?id=${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("未找到页面");
  }

  const toJson = (await response.json()) as {
    code: number;
    data?: ReleasePageData;
  };

  if (!toJson.data) {
    throw new Error("404");
  }

  return toJson.data;
}

interface PageType {
  params: { id: string };
}

export default async function Page({ params }: PageType) {
  const data = await getData(params.id);

  if (data.status === "closed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-6">
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold">页面已关闭</h1>
          <p className="text-gray-500">当前问卷已暂停访问，暂时无法填写。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ComponentRender data={data} id={params.id} />
    </div>
  );
}
