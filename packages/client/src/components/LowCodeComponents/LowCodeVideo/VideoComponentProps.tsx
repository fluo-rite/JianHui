import type { IVideoComponentProps } from "@lowcode/share";
import {
  isFieldHidden,
  videoComponentDefaultConfig,
} from "@lowcode/share";
import { Input, Switch } from "antd";
import { FormContainer, FormPropLabel, UploadEditOrChooiseInput } from "..";

export default function VideoComponentProps(props: IVideoComponentProps) {
  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(videoComponentDefaultConfig, "src")}
        name="src"
        label="播放器地址："
      >
        <UploadEditOrChooiseInput propName="src" type="video" />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(videoComponentDefaultConfig, "startTime")}
        name="startTime"
        label="初始播放时间（秒）："
      >
        <Input type="number" placeholder="请输入初始播放时间" />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(videoComponentDefaultConfig, "autoPlay")}
        name="autoPlay"
        label="是否启用自动播放："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(videoComponentDefaultConfig, "loop")}
        name="loop"
        label="是否启用循环播放："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(videoComponentDefaultConfig, "muted")}
        name="muted"
        label="是否启用静音播放："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
    </FormContainer>
  );
}
