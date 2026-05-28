import {
  BarChartOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  SendOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { GetPageListItemResponse, TPageStatus } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, Card, List, Space, Tag, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  createPage,
  deletePage,
  getPages,
  updatePageStatus,
} from "~/api/low-code";

const { Text } = Typography;

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function getStatusTag(status: TPageStatus) {
  switch (status) {
    case "draft":
      return <Tag color="default">未发布</Tag>;
    case "published":
      return <Tag color="green">已发布</Tag>;
    case "closed":
      return <Tag color="orange">已关闭</Tag>;
  }
}

export default function Pages() {
  const navigate = useNavigate();
  const releaseBaseUrl =
    import.meta.env.VITE_RELEASE_BASE_URL ||
    `${window.location.protocol}//${window.location.host}/release`;

  const {
    data,
    loading,
    refresh: refreshPages,
  } = useRequest(async () => {
    const response = await getPages();
    return response.data as GetPageListItemResponse[];
  });

  const { runAsync: execCreate, loading: creating } = useRequest(createPage, {
    manual: true,
  });
  const { runAsync: execUpdateStatus, loading: updatingStatus } = useRequest(
    ({ id, status }: { id: number; status: "published" | "closed" }) =>
      updatePageStatus(id, status),
    {
      manual: true,
    }
  );
  const { runAsync: execDelete, loading: deleting } = useRequest(deletePage, {
    manual: true,
  });

  async function handleCreate() {
    await execCreate();
    refreshPages();
  }

  async function handlePublish(pageId: number) {
    await execUpdateStatus({ id: pageId, status: "published" });
    refreshPages();
  }

  async function handleClose(pageId: number) {
    await execUpdateStatus({ id: pageId, status: "closed" });
    refreshPages();
  }

  async function handleReopen(pageId: number) {
    await execUpdateStatus({ id: pageId, status: "published" });
    refreshPages();
  }

  async function handleDelete(pageId: number) {
    await execDelete(pageId);
    refreshPages();
  }

  async function handleCopyUrl(pageId: number) {
    await navigator.clipboard.writeText(`${releaseBaseUrl}/${pageId}`);
    message.success("发布页面 URL 已复制");
  }

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">页面管理</h1>
            <Text type="secondary">创建、发布、关闭和查看问卷页面</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={creating}
          >
            创建页面
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={data ?? []}
          renderItem={(item) => (
            <List.Item>
              <Card className="w-full">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-medium">{item.page_name}</h2>
                      {getStatusTag(item.status)}
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-sm text-gray-500 md:grid-cols-2">
                      <span>创建时间：{formatDate(item.created_at)}</span>
                      <span>更新时间：{formatDate(item.updated_at)}</span>
                      <span>发布时间：{formatDate(item.published_at)}</span>
                      <span>关闭时间：{formatDate(item.closed_at)}</span>
                      <span>提交份数：{item.submission_count}</span>
                    </div>
                  </div>

                  <Space wrap>
                    {item.status === "draft" && (
                      <>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/editor/${item.id}`)}
                        >
                          编辑
                        </Button>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => handlePublish(item.id)}
                          loading={updatingStatus}
                        >
                          发布
                        </Button>
                      </>
                    )}

                    {item.status === "published" && (
                      <>
                        <Button
                          icon={<BarChartOutlined />}
                          onClick={() => navigate(`/dataCount/${item.id}`)}
                        >
                          查看统计数据
                        </Button>
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyUrl(item.id)}
                        >
                          复制发布页面 URL
                        </Button>
                        <Button
                          icon={<EyeInvisibleOutlined />}
                          onClick={() => handleClose(item.id)}
                          loading={updatingStatus}
                        >
                          关闭
                        </Button>
                      </>
                    )}

                    {item.status === "closed" && (
                      <>
                        <Button
                          icon={<BarChartOutlined />}
                          onClick={() => navigate(`/dataCount/${item.id}`)}
                        >
                          查看统计数据
                        </Button>
                        <Button
                          icon={<UnlockOutlined />}
                          onClick={() => handleReopen(item.id)}
                          loading={updatingStatus}
                        >
                          重新打开
                        </Button>
                      </>
                    )}

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                      loading={deleting}
                    >
                      删除
                    </Button>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
