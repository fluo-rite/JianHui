import { Input, Select, Switch } from "antd";
import {
  type IAlertComponentProps,
  alertComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";

export default function AlertComponentProps(props: IAlertComponentProps) {
  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "title")}
        name="title"
        label="标题:"
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "type")}
        name="type"
        label="类型:"
      >
        <Select
          options={[
            { label: "成功", value: "success" },
            { label: "警告", value: "warning" },
            { label: "信息", value: "info" },
            { label: "错误", value: "error" },
          ]}
        />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "showIcon")}
        name="showIcon"
        label="是否显示图标:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "showClose")}
        name="showClose"
        label="是否显示关闭按钮:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "isBanner")}
        name="isBanner"
        label="是否显示为 Banner:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(alertComponentDefaultConfig, "description")}
        name="description"
        label="描述:"
      >
        <Input.TextArea rows={3} />
      </FormPropLabel>
    </FormContainer>
  );
}
