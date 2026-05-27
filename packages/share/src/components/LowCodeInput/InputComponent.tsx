import React, { useMemo } from "react";
import { Input } from "antd";
import { getDefaultValueByConfig } from "..";
import { type IInputComponentProps, inputComponentDefaultConfig } from ".";

export default function InputComponent(_props: IInputComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(inputComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

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
