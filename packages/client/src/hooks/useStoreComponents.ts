import { useMemo } from "react";
import { message } from "antd";
import { ulid } from "ulid";
import type {
  GetReleaseDataResponse,
  TComponentPropsUnion,
  TComponentTypes,
} from "@lowcode/share";
import { componentsActions, pageActions, type TStoreComponents } from "~/store";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { getLowCodePage } from "~/api/low-code";

function buildCurrentComponentGetter(
  currentComponent: TComponentPropsUnion | null
) {
  return {
    get: () => currentComponent,
  };
}

function buildCurrentIndexGetter(currentIndex: number) {
  return {
    get: () => currentIndex,
  };
}

export function useStoreComponents() {
  const dispatch = useAppDispatch();
  const componentsStore = useAppSelector((state) => state.components.present);
  const undoCount = useAppSelector((state) => state.components.past.length);
  const redoCount = useAppSelector((state) => state.components.future.length);

  const currentComponent = useMemo(() => {
    if (!componentsStore.currentCompConfig) return null;
    return (
      componentsStore.compConfigs[componentsStore.currentCompConfig] ?? null
    );
  }, [componentsStore.compConfigs, componentsStore.currentCompConfig]);

  const currentComponentIndex = useMemo(() => {
    if (!currentComponent) return -1;
    return componentsStore.sortableCompConfig.indexOf(currentComponent.id);
  }, [componentsStore.sortableCompConfig, currentComponent]);

  const getCurrentComponentConfig = useMemo(
    () => buildCurrentComponentGetter(currentComponent),
    [currentComponent]
  );

  const getCurrentComponentIndex = useMemo(
    () => buildCurrentIndexGetter(currentComponentIndex),
    [currentComponentIndex]
  );

  function setCurrentComponent(id: string) {
    dispatch(componentsActions.setCurrentComponent(id));
  }

  function push(type: TComponentTypes) {
    dispatch(componentsActions.pushComponent(type));
  }

  function getComponentById(id: string) {
    return componentsStore.compConfigs[id];
  }

  function isCurrentComponent(compConfig: TComponentPropsUnion) {
    return getCurrentComponentConfig.get()?.id === compConfig.id;
  }

  function updateCurrentComponent(compConfig: TComponentPropsUnion["props"]) {
    if (!getCurrentComponentConfig.get()) return;
    dispatch(componentsActions.updateCurrentComponent(compConfig));
  }

  function updateCurrentCompConfigWithArray(args: {
    key: string;
    index: number;
    field: string;
    value: string;
  }) {
    if (!getCurrentComponentConfig.get()) return;
    dispatch(componentsActions.updateCurrentCompConfigWithArray(args));
  }

  function setItemsExpandIndex(index: number) {
    dispatch(componentsActions.setItemsExpandIndex(index));
  }

  function undo() {
    if (undoCount === 0) {
      message.warning("没有可撤销的操作");
      return;
    }

    dispatch(componentsActions.undo());
  }

  function redo() {
    if (redoCount === 0) {
      message.warning("没有可重做的操作");
      return;
    }

    dispatch(componentsActions.redo());
  }

  function moveComponent(pos: { oldIndex: number; newIndex: number }) {
    dispatch(componentsActions.moveComponent(pos));
  }

  function moveUpComponent() {
    const oldIndex = getCurrentComponentIndex.get();
    if (oldIndex <= 0) {
      message.warning("此组件已经是第一个了");
      return;
    }

    moveComponent({
      oldIndex,
      newIndex: oldIndex - 1,
    });
  }

  function moveDownComponent() {
    const oldIndex = getCurrentComponentIndex.get();
    if (oldIndex < 0) return;

    if (oldIndex >= componentsStore.sortableCompConfig.length - 1) {
      message.warning("此组件已经是最后一个了");
      return;
    }

    moveComponent({
      oldIndex,
      newIndex: oldIndex + 1,
    });
  }

  function copyCurrentComponent() {
    if (!getCurrentComponentConfig.get()) return;
    dispatch(componentsActions.copyCurrentComponent());
  }

  function pasteCopyedComponent() {
    if (!componentsStore.copyedCompConig) return;
    dispatch(componentsActions.pasteCopyedComponent());
  }

  function removeCurrentComponent() {
    if (!getCurrentComponentConfig.get()) return;
    dispatch(componentsActions.removeCurrentComponent());
  }

  function _replace(value: TStoreComponents) {
    dispatch(componentsActions.replacePresent(value));
  }

  function storeInLocalStorage() {
    localStorage.setItem("compConfig", JSON.stringify(componentsStore.compConfigs));
    localStorage.setItem(
      "sortableCompConfig",
      JSON.stringify(componentsStore.sortableCompConfig)
    );
    localStorage.setItem(
      "currentCompConfig",
      JSON.stringify(componentsStore.currentCompConfig)
    );
    localStorage.setItem("store_time", String(Date.now()));

    message.success("保存成功");
  }

  async function readDataFromServer() {
    const { data } = (await getLowCodePage()) as {
      data?: GetReleaseDataResponse;
    };
    const components = data?.components ?? [];
    const compConfigs = components.reduce<Record<string, TComponentPropsUnion>>(
      (acc, comp) => {
        const id = ulid();
        acc[id] = {
          id,
          type: comp.type,
          props: comp.options ?? {},
        };
        return acc;
      },
      {}
    );

    const sortableCompConfig = Object.keys(compConfigs);
    dispatch(
      componentsActions.replacePresent({
        compConfigs,
        sortableCompConfig,
        currentCompConfig: sortableCompConfig[0] ?? null,
      })
    );

    if (data) {
      dispatch(
        pageActions.updatePage({
          tdk: data.tdk,
          title: data.page_name,
          description: data.desc,
        })
      );
      message.success("已自动从服务器读取数据");
    } else {
      message.info("当前账号还没有发布页面，已为你创建空白画布");
    }
  }

  async function localStorageInStore() {
    const compConfig = localStorage.getItem("compConfig");
    const sortableCompConfig = localStorage.getItem("sortableCompConfig");
    const currentCompConfig = localStorage.getItem("currentCompConfig");
    const storeTime = localStorage.getItem("store_time");
    const releaseTime = localStorage.getItem("release_time");

    if (compConfig && compConfig !== "{}") {
      const shouldUseDraft =
        storeTime && Number(storeTime) > (releaseTime ? Number(releaseTime) : 0);

      if (shouldUseDraft) {
        dispatch(
          componentsActions.replacePresent({
            compConfigs: JSON.parse(compConfig),
            sortableCompConfig: JSON.parse(sortableCompConfig ?? "[]"),
            currentCompConfig: JSON.parse(currentCompConfig ?? "null"),
          })
        );
        message.success("已自动从草稿中读取数据");
        return;
      }
    }

    await readDataFromServer();
  }

  return {
    _replace,
    push,
    getComponentById,
    isCurrentComponent,
    getCurrentComponentConfig,
    setCurrentComponent,
    store: componentsStore,
    updateCurrentComponent,
    updateCurrentCompConfigWithArray,
    setItemsExpandIndex,
    undo,
    redo,
    moveComponent,
    moveUpComponent,
    moveDownComponent,
    copyCurrentComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    getCurrentComponentIndex,
    storeInLocalStorage,
    localStorageInStore,
  };
}
