import ClassNames from "classnames";
import type { FC, ReactNode, Ref } from "react";
import {
  useMemo,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { getComponentByType } from "@lowcode/share";
import type {
  TBasicComponentConfig,
  TComponentPropsUnion,
} from "@lowcode/share";
import { useStoreComponents, useComponentKeyPress } from "~/hooks";
import type { TStoreComponents } from "~/store";
import SortableContainer from "~/components/DragSortable/SortableContainer";
import SortableItem from "~/components/DragSortable/SortableItem";
import type { DragStartEvent } from "@dnd-kit/core";
import { components } from "./LeftPanel/ComponentList";
import { DeleteOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

export interface EditorCanvasHandle {
  setShowToolbar: (value: boolean) => void;
}

interface EditorToolbarHandle {
  setRefrash: (value: boolean) => void;
}

export function generateComponent(conf: TBasicComponentConfig) {
  const Component = getComponentByType(conf.type);
  return <Component {...conf.props} key={conf.id} />;
}

interface ComponentWrapperProps {
  id: string;
  children: ReactNode;
  isDragable: boolean;
  onClick: () => void;
  isCurrentComponent: boolean;
}

const ComponentWrapper: FC<ComponentWrapperProps> = ({
  id,
  children,
  isDragable,
  isCurrentComponent,
  onClick,
}) => {
  const classNames = useMemo(() => {
    return ClassNames({
      "absolute left-0 top-0 z-[999] h-full w-full": true,
      "hover:border-[3px] hover:border-blue-500":
        !isCurrentComponent && !isDragable,
      "border-[2px] border-blue-400": isCurrentComponent,
    });
  }, [isCurrentComponent, isDragable]);

  return (
    <div
      className="component-warpper relative cursor-pointer"
      onClick={onClick}
      data-id={id}
    >
      <div className={classNames} />
      <div className="pointer-events-none">{children}</div>
    </div>
  );
};

const EditorChooiseToolbarIconContainer: FC<{
  children: ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <div
      className="cursor-pointer px-[0.5px] transition-colors hover:bg-gray-50/50"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const EditorChooiseToolbar: FC<{
  hidden: boolean;
  onRef: Ref<EditorToolbarHandle>;
}> = ({ hidden, onRef }) => {
  const {
    store,
    moveUpComponent,
    moveDownComponent,
    removeCurrentComponent,
    getCurrentComponentConfig,
  } = useStoreComponents();
  const [currentComponentRect, setCurrentComponentRect] =
    useState<ClientRect>();
  const [isFirst, setIsFirst] = useState(false);
  const [refrash, setRefrash] = useState(false);
  const [localHidden, setLocalHidden] = useState(false);

  const classNames = useMemo(() => {
    return ClassNames({
      hidden: hidden || localHidden,
      "absolute flex items-center gap-2 bg-blue-500 p-[4px] text-sm text-white":
        true,
    });
  }, [hidden, localHidden]);

  useImperativeHandle(onRef, () => ({ setRefrash }));

  const componentName = useMemo(() => {
    return (
      components.find(
        (item) => item.type === getCurrentComponentConfig.get()?.type
      )?.name ?? "组件名称"
    );
  }, [getCurrentComponentConfig.get()]);

  function getCurrentCompConfig() {
    const componentWarppers = document.querySelectorAll(".component-warpper");
    let currentCompConfig = null;

    componentWarppers?.forEach((el) => {
      if (el.getAttribute("data-id") === store.currentCompConfig) {
        currentCompConfig = el;
      }
    });

    return currentCompConfig as HTMLDivElement | null;
  }

  function resizeComponent() {
    const currentComponent = getCurrentCompConfig();
    if (currentComponent) {
      setCurrentComponentRect(currentComponent.getBoundingClientRect());
    }
  }

  useEffect(() => {
    const canvasContainer = document.querySelector(".editor-canvas-container");
    const currentComponent = getCurrentCompConfig();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== currentComponent) return;
          setLocalHidden(!entry.isIntersecting);
        });
      },
      {
        threshold: 0.9,
        root: canvasContainer,
      }
    );

    if (currentComponent && canvasContainer) {
      observer.observe(currentComponent);
    }

    return () => {
      observer.disconnect();
    };
  }, [getCurrentComponentConfig.get(), hidden]);

  useEffect(() => {
    if (!isFirst) {
      setIsFirst(true);
      window.setTimeout(() => {
        resizeComponent();
      }, 500);
      return;
    }

    if (refrash) {
      setRefrash(false);
      return;
    }

    resizeComponent();
  }, [hidden, localHidden, isFirst, refrash, getCurrentComponentConfig.get()]);

  function handleOnClick(fn: () => void) {
    setRefrash(true);
    fn();
  }

  return (
    getCurrentComponentConfig.get() && (
      <div
        className={classNames}
        style={{
          left: `${currentComponentRect?.right}px`,
          top: `${currentComponentRect && currentComponentRect.bottom - 28}px`,
        }}
      >
        <span>{componentName} |</span>

        <EditorChooiseToolbarIconContainer
          onClick={() => handleOnClick(removeCurrentComponent)}
        >
          <DeleteOutlined />
        </EditorChooiseToolbarIconContainer>

        <EditorChooiseToolbarIconContainer
          onClick={() => handleOnClick(moveUpComponent)}
        >
          <UpOutlined />
        </EditorChooiseToolbarIconContainer>

        <EditorChooiseToolbarIconContainer
          onClick={() => handleOnClick(moveDownComponent)}
        >
          <DownOutlined />
        </EditorChooiseToolbarIconContainer>
      </div>
    )
  );
};

const EditorCanvas: FC<{
  store: TStoreComponents;
  onRef: Ref<EditorCanvasHandle>;
}> = ({ store, onRef }) => {
  const {
    getComponentById,
    isCurrentComponent,
    setCurrentComponent,
    getCurrentComponentConfig,
    moveComponent,
  } = useStoreComponents();

  const [isDragable, setIsDragable] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarRef = useRef<EditorToolbarHandle>();

  function handleComponentClick(conf: TComponentPropsUnion) {
    if (isCurrentComponent(conf)) return;
    setCurrentComponent(conf.id);
  }

  function handleDragEnd(oldIndex: number, newIndex: number) {
    moveComponent({ oldIndex, newIndex });
    setIsDragable(false);
    toolbarRef.current?.setRefrash(true);
  }

  function handleDragStart(event: DragStartEvent) {
    setCurrentComponent(event.active.id.toString());
    setIsDragable(true);
  }

  useComponentKeyPress();
  useImperativeHandle(onRef, () => ({ setShowToolbar }));

  return (
    <>
      {store.sortableCompConfig.length <= 0 && (
        <div className="mb-3 rounded border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
          画布还是空的，先去左侧双击一个组件添加进来吧。
        </div>
      )}

      <SortableContainer
        items={store.sortableCompConfig}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        {store.sortableCompConfig
          .map((id) => getComponentById(id))
          .map((conf) => {
            return (
              <SortableItem id={conf.id} key={conf.id}>
                <ComponentWrapper
                  id={conf.id}
                  key={conf.id}
                  isDragable={isDragable}
                  onClick={() => handleComponentClick(conf)}
                  isCurrentComponent={
                    getCurrentComponentConfig.get()?.id === conf.id
                  }
                >
                  {generateComponent(conf)}
                </ComponentWrapper>
              </SortableItem>
            );
          })}
      </SortableContainer>

      <EditorChooiseToolbar hidden={!showToolbar} onRef={toolbarRef} />
    </>
  );
};

export default EditorCanvas;
