import React, { useRef, type ReactNode } from "react";
import { useCheckbox, type AriaCheckboxProps } from "react-aria";
import { useToggleState } from "react-stately";

type CheckboxFieldProps = AriaCheckboxProps & {
  children: ReactNode | ReactNode[];
};

export function CheckboxField(props: CheckboxFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const state = useToggleState(props);
  const { inputProps } = useCheckbox(props, state, ref);

  return (
    <label className="flex flex-row gap-3">
      <input {...inputProps} ref={ref} />
      <span>{props.children}</span>
    </label>
  );
}
