import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { type AriaTextFieldOptions, useTextField } from "react-aria";

import { classes } from "@/utils/classes";

import IconX from "@/icons/IconX";

export type TextFieldProps = AriaTextFieldOptions<"input"> & {
  label: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  list?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showResetButton?: boolean;
};

export function TextField(props: TextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [showResetButton, setShowResetButton] = useState(
    () => props.showResetButton && Boolean(props.value || props.defaultValue),
  );
  const customizedProps = useMemo(() => {
    return {
      ...props,
      onChange: (value: string) => {
        if (props.showResetButton) {
          setShowResetButton(Boolean(value));
        }

        if (props.onChange) {
          props.onChange(value);
        }
      },
    };
  }, [props]);
  const reset = useCallback(() => {
    if (ref.current) {
      ref.current.value = "";
      customizedProps.onChange("");
      setShowResetButton(false);
    }
  }, [customizedProps]);

  const { labelProps, inputProps } = useTextField(customizedProps, ref);

  return (
    <div className={props.className || "flex-1"}>
      <label className={props.labelClassName} {...labelProps}>
        {props.label}
      </label>
      <div className="flex w-full items-center gap-1 rounded-sm border border-gray-700 bg-white text-gray-500">
        {props.prefix}
        <input
          className={classes(
            "w-full flex-1 bg-white p-1 px-2 text-black",
            props.inputClassName,
          )}
          {...inputProps}
          list={props.list}
          required={props.isRequired}
          ref={ref}
        />
        {showResetButton && (
          <button className="px-2" type="button" onClick={reset}>
            <IconX className="h-4 w-4" />
          </button>
        )}
        {props.suffix}
      </div>
    </div>
  );
}
