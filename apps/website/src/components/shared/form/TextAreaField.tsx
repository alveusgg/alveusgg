import { type ReactNode, type Ref, useRef } from "react";
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
  ref?: Ref<HTMLTextAreaElement>;
};

export const TextAreaField = (props: TextAreaFieldProps) => {
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const { labelProps, inputProps } = useTextField(props, ownRef);
  const { style: _, ref: forwardedRef, ...textareaProps } = inputProps;

  return (
    <div className={classes("flex-1", props.className)}>
      <label className={props.labelClassName} {...labelProps}>
        {props.label}
      </label>
      <br />
      <TextareaAutosize
        className={classes(
          "h-[calc(1em+0.5rem)] max-h-[500px] min-h-[calc(1em+0.5rem)] w-full resize-y rounded-xs border border-gray-700 bg-white p-1 px-2 text-black",
          props.inputClassName,
        )}
        {...textareaProps}
        ref={(element) => {
          ownRef.current = element;
          if (typeof forwardedRef === "function") {
            forwardedRef(element);
          } else if (forwardedRef) {
            // eslint-disable-next-line react-hooks/immutability -- this is a ref, it can be mutated
            forwardedRef.current = element;
          }
        }}
      />
    </div>
  );
};
