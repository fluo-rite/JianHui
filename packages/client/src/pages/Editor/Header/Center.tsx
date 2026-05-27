import { FundViewOutlined, SaveOutlined } from "@ant-design/icons";
import type { UpdatePageRequest } from "@lowcode/share";
import { useRequest } from "ahooks";
import { Button, Space, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { updatePage as updatePageRequest } from "~/api/low-code";
import { useStoreComponents, useStorePage } from "~/hooks";
import { validatePageComponentOptionsBeforeSave } from "~/utils/component-validation";

function buildRequestPayload(
  store: ReturnType<typeof useStorePage>["store"],
  storeComponents: ReturnType<typeof useStoreComponents>["store"],
  getComponentById: ReturnType<typeof useStoreComponents>["getComponentById"]
): UpdatePageRequest {
  const components: UpdatePageRequest["components"] = storeComponents.sortableCompConfig
    .map((comp) => getComponentById(comp))
    .map((comp) => ({
      type: comp.type,
      options: comp.props,
    }));

  return {
    components,
    desc: store.description,
    page_name: store.title,
    tdk: store.tdk,
  };
}

export default function Center() {
  const nav = useNavigate();
  const params = useParams();
  const pageId = Number(params.pageId);
  const { store } = useStorePage();
  const { store: storeComponents, getComponentById } = useStoreComponents();

  const { runAsync, loading } = useRequest(
    async (values: UpdatePageRequest) => updatePageRequest(pageId, values),
    {
      manual: true,
    }
  );

  async function handleSave() {
    if (!pageId) {
      message.warning("页面参数错误");
      return false;
    }

    const failure = validatePageComponentOptionsBeforeSave(
      storeComponents,
      getComponentById
    );
    if (failure) {
      message.warning(
        failure.fieldLabel
          ? `第 ${failure.componentIndex + 1} 个组件的${failure.fieldLabel}配置有误：${failure.message}`
          : `第 ${failure.componentIndex + 1} 个组件配置有误：${failure.message}`
      );
      return false;
    }

    await runAsync(buildRequestPayload(store, storeComponents, getComponentById));
    return true;
  }

  async function handleGoPreview() {
    const saved = await handleSave();
    if (!saved) return;
    nav(`/preview/${pageId}`);
  }

  return (
    <Space>
      <Button className="flex items-center" onClick={handleGoPreview}>
        预览 <FundViewOutlined />
      </Button>
      <Button
        loading={loading}
        className="flex items-center"
        type="primary"
        onClick={handleSave}
      >
        保存 <SaveOutlined />
      </Button>
    </Space>
  );
}
