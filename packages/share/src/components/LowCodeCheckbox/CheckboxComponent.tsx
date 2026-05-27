import React, { useMemo } from "react";
import { Checkbox } from "antd";
import { getDefaultValueByConfig } from "../func";
import {
  type ICheckboxComponentProps,
  checkboxComponentDefaultConfig,
} from ".";

export default function CheckboxComponent(_props: ICheckboxComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(checkboxComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <div className="space-y-3 p-4 sm:p-5">
      <span className="block text-base font-semibold leading-6 text-slate-900 sm:text-lg">
        {props.title}
      </span>
      <Checkbox.Group
        className="flex w-full flex-col gap-3"
        options={props.options.map((item) => ({
          label: item.value,
          value: item.id,
        }))}
        value={props.value}
        onChange={(value) => props.onUpdate?.(value)}
      />
    </div>
  );
}
