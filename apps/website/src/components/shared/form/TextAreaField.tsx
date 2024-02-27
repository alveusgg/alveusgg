import { useRef, type ReactNode, forwardRef } from "react";
import { type AriaTextFieldOptions, useTextField } from "react-aria";
import { default as TextareaAutosize } from "react-textarea-autosize";

import { classes } from "@/utils/classes";

export type TextAreaFieldProps = Omit<
  AriaTextFieldOptions<"textarea">,
  "style"
> & {
  label: ReactNode | ReactNode[];
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export const TextAreaField = forwardRef(function TextAreaField(
  props: TextAreaFieldProps,
  forwardedRef,
) {
  const ownRef = useRef<HTMLTextAreaElement | null>(null);
  const { labelProps, inputProps } = useTextField(props, ownRef);
  const { style: _, ...textareaProps } = inputProps;

  return (
    <div className={classes("flex-1", props.className)}>
      <label className={props.labelClassName} {...labelProps}>
        {props.label}
      </label>
      <br />
      <TextareaAutosize
        className={classes(
          "h-[calc(1em+0.5rem)] max-h-[500px] min-h-[calc(1em+0.5rem)] w-full resize-y rounded-sm border border-gray-700 bg-white p-1 px-2 text-black",
          props.inputClassName,
        )}
        {...textareaProps}
        ref={(element) => {
          ownRef.current = element;
          if (typeof forwardedRef === "function") {
            forwardedRef(element);
          } else if (forwardedRef) {
            forwardedRef.current = element;
          }
        }}
      />
    </div>
  );
});
