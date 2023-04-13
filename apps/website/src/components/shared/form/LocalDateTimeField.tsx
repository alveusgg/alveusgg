import React, {
  type InputHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
} from "react";
import { useField, type AriaFieldProps } from "react-aria";

type DateTimeFieldProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  AriaFieldProps & {
    children?: ReactNode;
    label: string;
    className?: string;
  };

export function LocalDateTimeField(props: DateTimeFieldProps) {
  const { labelProps, fieldProps } = useField(props);

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <input
        type="datetime-local"
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
        className="w-full rounded-sm border border-gray-700 bg-white p-1 text-black"
        {...fieldProps}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      >
        {props.children}
      </input>
    </div>
  );
}
