import React, { useRef } from "react";
import type { AriaTextFieldOptions } from "react-aria";
import { useTextField } from "react-aria";

export type TextFieldProps = AriaTextFieldOptions<"input"> & {
  label: string;
  className?: string;
  inputClassName?: string;
  list?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

export function TextField(props: TextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { labelProps, inputProps } = useTextField(props, ref);

  return (
    <div className={props.className || "flex-1"}>
      <label {...labelProps}>{props.label}</label>
      <div className="flex w-full items-center gap-1 rounded-sm border border-gray-700 bg-white text-gray-500">
        {props.prefix}
        <input
          className={`w-full flex-1 bg-white p-1 px-2 text-black ${
            props.inputClassName || ""
          }`}
          {...inputProps}
          list={props.list}
          required={props.isRequired}
          ref={ref}
        />
        {props.suffix}
      </div>
    </div>
  );
}
