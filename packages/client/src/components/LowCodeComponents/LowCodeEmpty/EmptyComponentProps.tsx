import { Input, Select } from "antd";
import {
  type IEmptyComponentProps,
  emptyComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";
import { fitOptions } from "../LowCodeImage/ImageComponentProps";

export default function EmptyComponentProps(props: IEmptyComponentProps) {
  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(emptyComponentDefaultConfig, "image")}
        name="image"
        label="图片"
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(emptyComponentDefaultConfig, "description")}
        name="description"
        label="描述"
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(emptyComponentDefaultConfig, "imageWidth")}
        name="imageWidth"
        label="图片宽度"
      >
        <Input type="number" />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(emptyComponentDefaultConfig, "imageHeight")}
        name="imageHeight"
        label="图片高度"
      >
        <Input type="number" />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(emptyComponentDefaultConfig, "imageObjectFit")}
        name="imageObjectFit"
        label="图片填充方式："
      >
        <Select options={fitOptions} />
      </FormPropLabel>
    </FormContainer>
  );
}
