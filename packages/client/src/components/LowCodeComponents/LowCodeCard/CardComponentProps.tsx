import { Input } from "antd";
import {
  type ICardComponentProps,
  cardComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { FormContainer, FormPropLabel, UploadEditOrChooiseInput } from "..";

export default function CardComponentProps(props: ICardComponentProps) {
  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(cardComponentDefaultConfig, "coverImg")}
        name="coverImg"
        label="封面图片:"
      >
        <UploadEditOrChooiseInput propName="coverImg" type="image" />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(cardComponentDefaultConfig, "title")}
        name="title"
        label="标题:"
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(cardComponentDefaultConfig, "description")}
        name="description"
        label="描述:"
      >
        <Input />
      </FormPropLabel>
    </FormContainer>
  );
}
