import React from "react";
import { Input } from "antd";
import { type IInputComponentProps } from ".";

export default function InputComponent(props: IInputComponentProps) {
  return (
    <div className="space-y-3 p-4 sm:p-5">
      <span className="block text-base font-semibold leading-6 text-slate-900 sm:text-lg">
        {props.title}:
      </span>
      <Input
        className="w-full"
        placeholder={props.placeholder}
        value={props.text}
        onChange={(event) => props.onUpdate?.(event.target.value)}
      />
    </div>
  );
}
