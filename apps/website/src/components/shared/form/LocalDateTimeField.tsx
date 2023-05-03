import React, {
  type ChangeEvent,
  type InputHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useField, type AriaFieldProps } from "react-aria";
import IconCross from "@/icons/IconCross";

type DateTimeFieldProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  AriaFieldProps & {
    children?: ReactNode;
    label: string;
    className?: string;
    inputClassName?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showResetButton?: boolean;
  };

export function LocalDateTimeField(props: DateTimeFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { labelProps, fieldProps } = useField(props);
  const [showResetButton, setShowResetButton] = useState(
    () => props.showResetButton && Boolean(props.value || props.defaultValue)
  );
  const onChange = useMemo(
    () => (e: ChangeEvent<HTMLInputElement>) => {
      if (props.showResetButton) {
        setShowResetButton(Boolean(e.currentTarget.value));
      }

      if (props.onChange) {
        props.onChange(e);
      }
    },
    [props]
  );
  const reset = useCallback(() => {
    if (ref.current) {
      ref.current.value = "";
      setShowResetButton(false);
    }
  }, []);

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <div className="flex w-full items-center gap-1 rounded-sm border border-gray-700 bg-white text-gray-500">
        {props.prefix}
        <input
          ref={ref}
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          className={`w-full bg-white p-1 text-black ${
            props.inputClassName || ""
          }`}
          {...fieldProps}
          defaultValue={props.defaultValue}
          name={props.name}
          value={props.value}
          onChange={onChange}
        />
        {showResetButton && (
          <button className="px-2" type="button" onClick={reset}>
            <IconCross className="h-4 w-4" />
          </button>
        )}
        {props.suffix}
      </div>
    </div>
  );
}
