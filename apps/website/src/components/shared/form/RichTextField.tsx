import dynamic from "next/dynamic";
import { type LegacyRef, useEffect, useRef, useState } from "react";
import { type AriaTextFieldOptions, useTextField } from "react-aria";
import type { default as ReactQuillType } from "react-quill-new";

import "react-quill-new/dist/quill.snow.css";

import { classes } from "@/utils/classes";

const ReactQuill = dynamic<
  ReactQuillType.ReactQuillProps & {
    forwardedRef?: LegacyRef<ReactQuillType>;
  }
>(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    return function DynamicReactQuill({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
  },
);

type FormFieldProps = AriaTextFieldOptions<"input"> & {
  label: string;
  className?: string;
};

const quillConfig: Partial<ReactQuillType.ReactQuillProps> = {
  theme: "snow",
  modules: {
    toolbar: [
      ["bold", "italic", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
    history: true,
  },
  formats: ["bold", "italic", "strike", "list", "bullet", "link"],
};

const nf = new Intl.NumberFormat(undefined);

export function RichTextField({ defaultValue, ...props }: FormFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const editorRef = useRef<ReactQuillType>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const { labelProps, inputProps } = useTextField(props, ref);
  const [value, setValue] = useState(defaultValue || "");
  const initialValueRef = useRef(defaultValue || "");
  const hasUserInteractedRef = useRef(false);

  // Update value when defaultValue changes (e.g., when entry data loads)
  // but don't trigger onChange for this update
  useEffect(() => {
    if (
      defaultValue !== undefined &&
      defaultValue !== initialValueRef.current
    ) {
      setValue(defaultValue);
      initialValueRef.current = defaultValue;
    }
  }, [defaultValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    // Only call onChange after user has actually interacted with the editor
    // Not when the value is being set programmatically
    if (hasUserInteractedRef.current && props.onChange) {
      props.onChange(newValue);
    }
  };

  return (
    <div className={classes("flex-1", props.className)}>
      <div className="flex flex-row items-end justify-between">
        <label
          {...labelProps}
          onClick={() => {
            editorRef.current?.focus();
          }}
        >
          {props.label}
        </label>
        {props.maxLength && (
          <span className="text-sm text-gray-600" ref={counterRef}>
            Characters 0 / {nf.format(props.maxLength)}
          </span>
        )}
      </div>
      <input
        className="sr-only"
        {...inputProps}
        type="hidden"
        name={props.name}
        value={value}
        ref={ref}
      />

      <ReactQuill
        {...quillConfig}
        value={value}
        onChange={handleChange}
        className="alveus-rte bg-white"
        forwardedRef={(ref) => {
          editorRef.current = ref;
          if (ref) {
            const quill = ref.getEditor();

            // Mark as user-interacted on first user-initiated text change
            quill.on("text-change", (delta, oldDelta, source) => {
              // Only mark as user-interacted if the change came from the user, not from API/programmatic changes
              if (source === "user") {
                hasUserInteractedRef.current = true;
              }

              if (props.maxLength) {
                const len = quill.getLength() - 1;
                if (len > props.maxLength) {
                  quill.deleteText(props.maxLength, len);
                }

                if (counterRef.current) {
                  const count = nf.format(Math.max(0, len));
                  const max = nf.format(props.maxLength);
                  counterRef.current.textContent = `Characters ${count} / ${max}`;
                }
              }
            });
          }
        }}
      />
    </div>
  );
}
