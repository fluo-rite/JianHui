import React from "react";
import { Radio } from "antd";
import { type IRadioComponentProps } from ".";

export default function RadioComponent(props: IRadioComponentProps) {
  return (
    <div className="space-y-3 p-4 sm:p-5">
      <span className="block text-base font-semibold leading-6 text-slate-900 sm:text-lg">
        {props.title}:
      </span>
      <Radio.Group
        className="flex w-full flex-col gap-3"
        value={props.value}
        onChange={(event) => props.onUpdate?.(event.target.value)}
      >
        {props.options.map((item) => (
          <Radio value={item.id} key={item.id}>
            {item.value}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
}
