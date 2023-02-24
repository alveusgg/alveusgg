import React, { useRef } from "react";
import type { AriaTextFieldOptions } from "react-aria";
import { useTextField } from "react-aria";

export type TextFieldProps = AriaTextFieldOptions<"input"> & {
  label: string;
  className?: string;
  list?: string;
};

export function TextField(props: TextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { labelProps, inputProps } = useTextField(props, ref);

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <input
        className="w-full rounded-sm border border-gray-700 bg-white p-1"
        {...inputProps}
        list={props.list}
        required={props.isRequired}
        ref={ref}
      />
    </div>
  );
}
