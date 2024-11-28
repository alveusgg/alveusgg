import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type AriaNumberFieldProps,
  type AriaButtonOptions,
  useLocale,
  useNumberField,
  useButton,
} from "react-aria";
import { useNumberFieldState } from "react-stately";

import { classes } from "@/utils/classes";

import IconX from "@/icons/IconX";

function NumberButton(
  props: AriaButtonOptions<"button"> & { children: ReactNode },
) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  return (
    <button
      className={classes(
        "m-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg text-white",
        props.isDisabled ? "cursor-not-allowed opacity-50" : "",
      )}
      {...buttonProps}
      ref={ref}
    >
      {props.children}
    </button>
  );
}

export type NumberFieldProps = AriaNumberFieldProps & {
  label: string;
  name: string;
  className?: string;
  inputClassName?: string;
  groupClassName?: string;
  labelClassName?: string;
  list?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showButtons?: boolean;
  showResetButton?: boolean;
  locale?: string;
};

export function NumberField(props: NumberFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [showResetButton, setShowResetButton] = useState(
    () => props.showResetButton && Boolean(props.value || props.defaultValue),
  );
  const customizedProps = useMemo(() => {
    return {
      ...props,
      onChange: (value: number) => {
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
      ref.current.valueAsNumber = 1;
      customizedProps.onChange(1);
      setShowResetButton(false);
    }
  }, [customizedProps]);

  const { locale } = useLocale();
  const state = useNumberFieldState({ ...props, locale });
  const {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
  } = useNumberField(customizedProps, state, ref);

  const focusInput = useCallback(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className={props.className || "flex-1"}>
      <label className={props.labelClassName} {...labelProps}>
        {props.label}
      </label>
      <div className={classes("flex", props.groupClassName)} {...groupProps}>
        {props.showButtons && (
          <NumberButton {...decrementButtonProps}>-</NumberButton>
        )}
        <div className="flex w-full items-center justify-center rounded-sm border border-gray-700 bg-white text-gray-500 focus-within:outline">
          <div className="contents" onClick={focusInput}>
            {props.prefix}
            <input
              className={classes(
                "w-full flex-1 bg-white p-1 px-2 text-black outline-none",
                props.inputClassName,
              )}
              {...inputProps}
              name={props.name}
              list={props.list}
              required={props.isRequired}
              ref={ref}
            />
            {props.suffix}
          </div>
          {showResetButton && (
            <button className="px-2" type="button" onClick={reset}>
              <IconX className="size-4" />
            </button>
          )}
        </div>
        {props.showButtons && (
          <NumberButton {...incrementButtonProps}>+</NumberButton>
        )}
      </div>
    </div>
  );
}
