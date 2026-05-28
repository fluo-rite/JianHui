import { Form, Input, Select, Switch } from "antd";
import type { ISwiperComponentProps } from "@lowcode/share";
import {
  defaultImageInfo,
  isFieldHidden,
  swiperComponentDefaultConfig,
} from "@lowcode/share";
import {
  FormContainer,
  FormContainerWithList,
  FormPropLabel,
  UploadEditOrChooiseInput,
} from "..";

export default function SwiperComponentProps(props: ISwiperComponentProps) {
  const fitOptions = [
    { value: "contain", label: "包含" },
    { value: "cover", label: "覆盖" },
    { value: "fill", label: "填充" },
    { value: "none", label: "无" },
    { value: "scale-down", label: "缩小" },
    { value: "initial", label: "默认" },
    { value: "revert", label: "恢复" },
    { value: "unset", label: "重置" },
  ];

  const clickOptions = [
    { value: "open-url", label: "跳转链接" },
    { value: "none", label: "无" },
  ];

  return (
    <>
      <FormContainer values={props} layout="vertical">
        <FormPropLabel
          hidden={isFieldHidden(swiperComponentDefaultConfig, "interval")}
          label="自动切换时间间隔（毫秒）"
          name="interval"
        >
          <Input type="number" placeholder="请输入自动切换时间间隔（毫秒）" />
        </FormPropLabel>

        <FormPropLabel
          hidden={isFieldHidden(swiperComponentDefaultConfig, "autoPlay")}
          label="是否启用自动播放？"
          name="autoPlay"
          valuePropName="checked"
        >
          <Switch />
        </FormPropLabel>

        <FormPropLabel
          hidden={isFieldHidden(swiperComponentDefaultConfig, "showIndicators")}
          label="是否显示面板指示点？"
          name="showIndicators"
          valuePropName="checked"
        >
          <Switch />
        </FormPropLabel>

        <FormPropLabel
          hidden={isFieldHidden(swiperComponentDefaultConfig, "dotPosition")}
          label="选择面板指示点位置"
          name="dotPosition"
        >
          <Select
            options={[
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
              { value: "top", label: "Top" },
            ]}
          />
        </FormPropLabel>
      </FormContainer>

      <FormContainerWithList
        keyName="images"
        id={props.id}
        items={props.images}
        newItemDefaultValue={defaultImageInfo}
      >
        <Form.Item label="图片填充方式：" name="fit">
          <Select options={fitOptions} />
        </Form.Item>

        <Form.Item label="图片点击后方式：" name="handleClicked">
          <Select options={clickOptions} />
        </Form.Item>

        <Form.Item label="图片跳转地址：" name="link">
          <Input />
        </Form.Item>

        <Form.Item name="url" label="图片地址：">
          <UploadEditOrChooiseInput
            type="image"
            propName="url"
            listOptions={{ keyName: "images" }}
          />
        </Form.Item>
      </FormContainerWithList>
    </>
  );
}
