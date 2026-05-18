import type { FC } from "react";
import { getComponentPropsByType } from "~/components/LowCodeComponents";
import type { TStoreComponents } from "~/store";
import { useStoreComponents } from "~/hooks";

const ComponentFields: FC<{ store: TStoreComponents }> = ({ store }) => {
  const { getCurrentComponentConfig } = useStoreComponents();

  if (!store.currentCompConfig)
    return <div style={{ textAlign: "center" }}>未选中组件</div>;

  const currentComponent = getCurrentComponentConfig.get();
  if (!currentComponent)
    return <div style={{ textAlign: "center" }}>未选中组件</div>;

  const ComponentProps = getComponentPropsByType(currentComponent.type);

  return (
    <ComponentProps {...currentComponent.props} id={currentComponent.id} />
  );
};

export default ComponentFields;
