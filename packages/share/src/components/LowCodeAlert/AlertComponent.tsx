import React from "react";
import { Alert } from "antd";
import type { IAlertComponentProps } from ".";

export default function AlertComponent(props: IAlertComponentProps) {
  return (
    <Alert
      type={props.type}
      message={props.title || "请输入文本"}
      showIcon={props.showIcon}
      closable={props.showClose}
    />
  );
}
