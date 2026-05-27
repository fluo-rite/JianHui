import type { FC } from "react";
import { Alert } from "antd";
import { getComponentOptionsValidationIssues } from "@lowcode/share";
import { getComponentPropsByType } from "~/components/LowCodeComponents";
import { useStoreComponents } from "~/hooks";
import type { TStoreComponents } from "~/store";

const ComponentFields: FC<{ store: TStoreComponents }> = ({ store }) => {
  const { getCurrentComponentConfig } = useStoreComponents();

  if (!store.currentCompConfig) {
    return <div style={{ textAlign: "center" }}>未选中组件</div>;
  }

  const currentComponent = getCurrentComponentConfig.get();
  if (!currentComponent) {
    return <div style={{ textAlign: "center" }}>未选中组件</div>;
  }

  const ComponentProps = getComponentPropsByType(currentComponent.type);
  const validationIssues = getComponentOptionsValidationIssues(
    currentComponent.type,
    currentComponent.props,
  );

  return (
    <div className="space-y-3">
      {validationIssues.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message="当前组件配置有误"
          description={
            <ul className="mb-0 list-disc pl-5">
              {validationIssues.map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  {issue.path ? `${issue.path}: ` : ""}
                  {issue.message}
                </li>
              ))}
            </ul>
          }
        />
      ) : null}
      <ComponentProps {...currentComponent.props} id={currentComponent.id} />
    </div>
  );
};

export default ComponentFields;
