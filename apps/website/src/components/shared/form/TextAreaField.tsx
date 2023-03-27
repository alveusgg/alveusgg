import type { ReactNode } from "react";
import React, { useRef } from "react";
import type { AriaTextFieldOptions } from "react-aria";
import { useTextField } from "react-aria";
import { default as TextareaAutosize } from "react-textarea-autosize";

export type TextAreaFieldProps = Omit<
  AriaTextFieldOptions<"textarea">,
  "style"
> & {
  label: ReactNode | ReactNode[];
  className?: string;
  inputClassName?: string;
};

export function TextAreaField(props: TextAreaFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { labelProps, inputProps } = useTextField(props, ref);
  const { style: _, ...textareaProps } = inputProps;

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <TextareaAutosize
        className={`h-[calc(1em+0.5rem)] min-h-[calc(1em+0.5rem)] w-full resize-none resize-y rounded-sm border border-gray-700 bg-white p-1 ${
          props.inputClassName || ""
        } text-black`}
        {...textareaProps}
        ref={ref}
      />
    </div>
  );
}
