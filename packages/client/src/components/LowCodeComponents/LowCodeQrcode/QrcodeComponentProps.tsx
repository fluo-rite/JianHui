import { ColorPicker, Input, Segmented } from "antd";
import type { ColorFactory } from "antd/es/color-picker/color";

import type {
  IQrcodeComponentProps,
  TQrcodeComponentConfig,
} from "@lowcode/share";
import {
  isFieldHidden,
  qrcodeComponentDefaultConfig,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";
import { useStoreComponents } from "~/hooks";

export default function QrcodeComponentProps(props: IQrcodeComponentProps) {
  const { updateCurrentComponent } = useStoreComponents();

  function handleValuesChangeAfter(
    changedValues: TQrcodeComponentConfig["props"]
  ) {
    if (changedValues.bgColor !== undefined) {
      updateCurrentComponent({
        bgColor: `#${(changedValues.bgColor as unknown as ColorFactory).toHex()}`,
      });
    } else if (changedValues.color !== undefined) {
      updateCurrentComponent({
        color: `#${(changedValues.color as unknown as ColorFactory).toHex()}`,
      });
    }
  }

  return (
    <FormContainer values={props} onValuesChangeAfter={handleValuesChangeAfter}>
      <FormPropLabel
        hidden={isFieldHidden(qrcodeComponentDefaultConfig, "value")}
        name="value"
        label="二维码内容："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(qrcodeComponentDefaultConfig, "bgColor")}
        name="bgColor"
        label="二维码背景颜色："
      >
        <ColorPicker showText />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(qrcodeComponentDefaultConfig, "color")}
        name="color"
        label="二维码颜色："
      >
        <ColorPicker showText />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(qrcodeComponentDefaultConfig, "errorLevel")}
        name="errorLevel"
        label="二维码容错率："
      >
        <Segmented options={["L", "M", "Q", "H"]} />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(qrcodeComponentDefaultConfig, "size")}
        name="size"
        label="二维码大小："
      >
        <Input type="number" max={375} min={80} />
      </FormPropLabel>
    </FormContainer>
  );
}
