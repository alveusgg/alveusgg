import React, { useRef } from "react";
import type { AriaTextFieldOptions } from "react-aria";
import { useTextField } from "react-aria";

type FormFieldProps = AriaTextFieldOptions<"input"> & {
  label: string;
  className?: string;
};

export function TextField(props: FormFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { labelProps, inputProps } = useTextField(props, ref);

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <input
        className="w-full rounded-sm border border-gray-700 bg-white p-1"
        {...inputProps}
        ref={ref}
      />
    </div>
  );
}
