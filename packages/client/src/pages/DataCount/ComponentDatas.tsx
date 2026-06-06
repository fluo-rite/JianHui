import type { IComponent, SubmissionRecordItem } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import {
  downloadSubmissionCsv,
  getSubmissionRecords,
} from "~/api/low-code";

const PAGE_SIZE = 50;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function ComponentDatas(props: {
  components: IComponent[];
  pageId: number;
}) {
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);
  const [items, setItems] = useState<SubmissionRecordItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setCurrentCursor(null);
    setCursorHistory([]);
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
  }, [props.pageId]);

  const columns: ColumnsType<Record<string, string | number>> = useMemo(() => {
    return [
      {
        key: "submissionId",
        dataIndex: "submissionId",
        title: "提交ID",
        width: 120,
      },
      {
        key: "submittedAt",
        dataIndex: "submittedAt",
        title: "提交时间",
        width: 180,
      },
      ...props.components.map((item) => ({
        key: String(item.id),
        dataIndex: String(item.id),
        title: item.options.title ?? "默认展示的标题",
      })),
    ];
  }, [props.components]);

  const { loading } = useRequest(
    () =>
      getSubmissionRecords(props.pageId, {
        limit: PAGE_SIZE,
        cursor: currentCursor,
      }),
    {
      refreshDeps: [props.pageId, currentCursor],
      onSuccess: ({ data }) => {
        setItems(data.items);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      },
    }
  );

  const dataSource = useMemo(() => {
    return items.map((item) => ({
      key: item.submissionId,
      submissionId: item.submissionId,
      submittedAt: formatDateTime(item.submittedAt),
      ...item.answers,
    }));
  }, [items]);

  function handlePreviousPage() {
    if (cursorHistory.length === 0) {
      return;
    }

    const nextHistory = [...cursorHistory];
    const previousCursor = nextHistory.pop() ?? null;
    setCursorHistory(nextHistory);
    setCurrentCursor(previousCursor);
  }

  function handleNextPage() {
    if (!nextCursor) {
      return;
    }

    setCursorHistory((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  }

  return (
    <div className="flex h-full min-h-[640px] flex-col p-4">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">
          每页 {PAGE_SIZE} 条，共展示当前分页内的提交记录。
        </div>
        <Button type="primary" onClick={() => downloadSubmissionCsv(props.pageId)}>
          导出 CSV
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ x: "max-content", y: 520 }}
        />
      </div>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <Space>
          <Button onClick={handlePreviousPage} disabled={cursorHistory.length === 0}>
            上一页
          </Button>
          <Button onClick={handleNextPage} disabled={!hasMore || !nextCursor}>
            下一页
          </Button>
        </Space>
      </div>
    </div>
  );
}
