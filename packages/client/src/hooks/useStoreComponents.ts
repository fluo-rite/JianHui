import { useMemo } from "react";
import { message } from "antd";
import { ulid } from "ulid";
import type {
  GetPageDetailResponse,
  TComponentPropsUnion,
  TComponentTypes,
} from "@lowcode/share";
import { normalizeComponentPropsByType } from "@lowcode/share";
import { componentsActions, type TStoreComponents } from "~/store";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

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

function mapPageDetailToStore(data: GetPageDetailResponse): TStoreComponents {
  const compConfigs = data.components.reduce<Record<string, TComponentPropsUnion>>(
    (acc, comp) => {
      const id = ulid();
      acc[id] = {
        id,
        type: comp.type,
        props: normalizeComponentPropsByType(comp.type, comp.options),
      };
      return acc;
    },
    {}
  );

  const sortableCompConfig = Object.keys(compConfigs);

  return {
    compConfigs,
    sortableCompConfig,
    currentCompConfig: sortableCompConfig[0] ?? null,
    copyedCompConig: null,
    itemsExpandIndex: 0,
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

  function replaceByPageDetail(data: GetPageDetailResponse) {
    dispatch(componentsActions.replacePresent(mapPageDetailToStore(data)));
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
    replaceByPageDetail,
  };
}
