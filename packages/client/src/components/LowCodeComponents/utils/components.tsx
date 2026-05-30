import { Form, Button, Input, Modal, Image, message } from "antd";
import { ulid } from "ulid";
import type {
  FormItemProps,
  FormProps,
  InputProps,
  InputRef,
  ImageProps,
} from "antd";
import { useEffect, useState, useRef } from "react";
import type { FC, ReactNode, RefAttributes } from "react";
import type { TComponentPropsUnion, IResources } from "@lowcode/share";
import { objectOmit, UploadType } from "@lowcode/share";
import { useStoreComponents } from "~/hooks";
import {
  UploadOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import { deleteResource, getResources } from "~/api/resource";
import { uploadResource } from "~/utils/resource-upload";

interface IFormPropLabelProps extends FormItemProps {
  hidden?: boolean;
}

export const FormPropLabel: FC<IFormPropLabelProps> = (props) => {
  if (props.hidden) {
    return null;
  }

  return (
    <Form.Item {...objectOmit(props, ["hidden"])}>{props.children}</Form.Item>
  );
};

interface IFormContainer extends FormProps {
  values: Record<string, any>;
  onValuesChangeAfter?: (
    changedValues: Record<keyof TComponentPropsUnion["props"], any>
  ) => void;
}

export const FormContainer: FC<IFormContainer> = (props) => {
  const [form] = Form.useForm();
  const { updateCurrentComponent } = useStoreComponents();

  useEffect(() => {
    form.setFieldsValue({ ...props.values });
  }, [form, props.values]);

  function handleValuesChange(
    changedValues: Record<keyof TComponentPropsUnion["props"], any>
  ) {
    updateCurrentComponent(changedValues);
    props.onValuesChangeAfter?.(changedValues);
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      {...objectOmit(props, ["onValuesChangeAfter", "values"])}
    >
      {props.children as ReactNode}
    </Form>
  );
};

interface FormListItemProps<T> {
  index: number;
  isExpand: boolean;
  item: T;
  children: ReactNode;
  onClick: () => void;
  keyName?: string;
}

export const FormListItem: FC<FormListItemProps<any>> = (props) => {
  const { updateCurrentCompConfigWithArray } = useStoreComponents();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.isExpand) {
      form.setFieldsValue({ ...props.item });
    }
  }, [form, props.isExpand, props.item]);

  function handleValuesChange(changeValues: Record<string, any>) {
    const objEntry = Object.entries(changeValues)[0];

    updateCurrentCompConfigWithArray({
      key: props.keyName ?? "items",
      field: objEntry[0],
      index: props.index,
      value: objEntry[1],
    });
  }

  return (
    <div className="border my-1 p-2" onClick={props.onClick}>
      {props.isExpand ? (
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          {props.children}
        </Form>
      ) : (
        <span className="cursor-pointer flex items-center justify-center">
          点击展开
        </span>
      )}
    </div>
  );
};

interface FormContainerWithListProps<
  T extends { id: string } & Record<string, any>,
> {
  id: string;
  items: T[];
  children: ReactNode;
  newItemDefaultValue: T;
  keyName?: string;
}

export const FormContainerWithList: FC<FormContainerWithListProps<any>> = (
  props
) => {
  const { updateCurrentComponent, setItemsExpandIndex } = useStoreComponents();
  const [expandIndex, setExpandIndex] = useState(0);

  useEffect(() => {
    setExpandIndex(0);
  }, [props.id]);

  useEffect(() => {
    setItemsExpandIndex(expandIndex);
  }, [expandIndex, setItemsExpandIndex]);

  function addNewItem() {
    updateCurrentComponent({
      [props.keyName ?? "items"]: [
        ...props.items,
        {
          ...props.newItemDefaultValue,
          id: ulid(),
        },
      ],
    });
  }

  return (
    <>
      <Button type="primary" onClick={addNewItem}>
        添加新项
      </Button>
      {props.items.map((item, index) => {
        return (
          <FormListItem
            item={item}
            index={index}
            key={item.id}
            isExpand={expandIndex === index}
            onClick={() => setExpandIndex(index)}
            keyName={props.keyName}
          >
            {props.children}
          </FormListItem>
        );
      })}
    </>
  );
};

interface LoadResourceProps extends ImageProps {
  typeName: string;
  resourceId: number;
  onDelete: () => void;
  onClicked: () => void;
}

export const LoadResource: FC<LoadResourceProps> = ({
  src,
  resourceId,
  typeName,
  onDelete,
  onClicked,
  ...props
}) => {
  const [hover, setHover] = useState(false);

  const { run: execDeleteResource } = useRequest(
    () => deleteResource(resourceId),
    {
      manual: true,
      onSuccess: ({ msg }) => {
        message.success(msg ?? "删除成功");
        onDelete();
      },
    }
  );

  return (
    <div className="relative w-full h-full border">
      <div
        onClick={onClicked}
        onMouseLeave={() => setHover(false)}
        className={`overflow-hidden w-full h-full absolute top-0 left-0 bg-black/50 z-10 cursor-pointer flex flex-col items-center justify-center text-white text-lg transition-all ${
          !hover ? "hidden" : "block"
        }`}
      >
        <span className="text-sm">{props.alt}</span>
        <span>选择此{typeName}</span>
      </div>

      <Image
        src={src}
        preview={false}
        className="cursor-pointer"
        width={"100%"}
        height={"100%"}
        onMouseEnter={() => setHover(true)}
        fallback="https://placehold.co/380x200/f5f5f5/333333/png?text=ERROR"
        {...props}
      />

      <div
        onClick={execDeleteResource}
        className="float-right cursor-pointer hover:bg-neutral-400/50 p-1 rounded text-red-500/80 font-bold"
      >
        <span>删除此{typeName} </span>
        <DeleteOutlined />
      </div>
    </div>
  );
};

interface UploadComponentProps {
  visible: boolean;
  type: UploadType;
  onCancel: () => void;
  onChooise: (url: string) => void;
}

export const UploadComponent: FC<UploadComponentProps> = ({
  type,
  visible,
  onCancel,
  onChooise,
}) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const iconClassName = "text-3xl text-center block";
  const typeName = type === "image" ? "图片" : "视频";

  const [resources, setResources] = useState<IResources[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { run: execGetResources, loading: loadingWithGetResources } =
    useRequest(async () => await getResources(type), {
      manual: true,
      onSuccess: ({ data }) => {
        setResources(data);
      },
    });

  useEffect(() => {
    if (visible) {
      execGetResources();
    }
  }, [visible, execGetResources]);

  const handleUploadChange = async () => {
    const files = uploadRef.current?.files;
    if (!files) return;

    const file = files[0];
    uploadRef.current.value = "";

    setUploading(true);
    setUploadProgress(type === "video" ? 0 : null);

    try {
      await uploadResource(file, type, {
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });
      await execGetResources();
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "上传失败，请稍后重试";
      message.warning(messageText);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 600);
    }
  };

  function getVideoFirstFrameOrImage(url: string, resourceType: UploadType) {
    return resourceType === "image"
      ? url
      : `${url}?spm=qipa250&x-oss-process=video/snapshot,t_0,f_png,w_0,h_0,m_fast`;
  }

  return (
    <Modal
      title={`选择上传${typeName}`}
      open={visible}
      onOk={onCancel}
      onCancel={onCancel}
      cancelButtonProps={{ hidden: true }}
    >
      {loadingWithGetResources ? (
        <LoadingOutlined className={`${iconClassName} text-center`} />
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 gap-x-4 gap-y-10 mt-6">
          <div
            onClick={() => !uploading && uploadRef.current?.click()}
            className={`cursor-pointer text-gray-600 border select-none hover:border-dashed flex flex-col justify-center items-center ${
              resources.length <= 0 && "py-4"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {uploading ? (
              <LoadingOutlined className={iconClassName} />
            ) : (
              <CloudUploadOutlined className={iconClassName} />
            )}

            <span className="block text-center py-2 font-mono font-bold">
              {uploading
                ? type === "video" && uploadProgress != null
                  ? `${typeName}上传 ${uploadProgress}%`
                  : `${typeName}上传中`
                : `${typeName}上传`}
            </span>

            <input
              hidden
              type="file"
              ref={uploadRef}
              accept={type === "video" ? "video/*" : "image/*"}
              onChange={handleUploadChange}
            />
          </div>

          {resources.map((item) => {
            return (
              <LoadResource
                onDelete={execGetResources}
                resourceId={item.id}
                typeName={typeName}
                alt={item.name}
                src={getVideoFirstFrameOrImage(item.url, item.type)}
                key={item.id}
                onClicked={() => onChooise(item.url)}
              />
            );
          })}
        </div>
      )}
    </Modal>
  );
};

interface UploadEditOrChooiseInputProps
  extends InputProps,
    RefAttributes<InputRef> {
  propName: string;
  type: "video" | "image";
  listOptions?: {
    keyName?: string;
  };
}

export const UploadEditOrChooiseInput: FC<UploadEditOrChooiseInputProps> = ({
  type,
  propName,
  listOptions,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  const { updateCurrentComponent, updateCurrentCompConfigWithArray, store } =
    useStoreComponents();

  function handleChooise(url: string) {
    setVisible(false);

    if (listOptions !== undefined) {
      updateCurrentCompConfigWithArray({
        key: listOptions.keyName ?? "items",
        field: propName,
        index: store.itemsExpandIndex,
        value: url,
      });
    } else {
      updateCurrentComponent({ [propName]: url });
    }
  }

  return (
    <>
      <Input
        {...props}
        suffix={
          <UploadOutlined
            className="cursor-pointer"
            onClick={() => setVisible(true)}
          />
        }
      />
      <UploadComponent
        type={type}
        visible={visible}
        onChooise={handleChooise}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};
