import { useCallback, useState } from "react";

import { parseVideoUrl } from "@/utils/video-urls";

import IconPlus from "@/icons/IconPlus";

import { MessageBox } from "../MessageBox";
import { Button, defaultButtonClasses, disabledButtonClasses } from "./Button";
import type { TextAreaFieldProps } from "./TextAreaField";
import { TextAreaField } from "./TextAreaField";

type VideoUrlFieldProps = Omit<
  TextAreaFieldProps,
  "value" | "onChange" | "label"
> & {
  label?: string;
  value: string[];
  onChange: (videoUrls: string[]) => void;
  maxNumber?: number;
};

export function VideoLinksField({
  label = "Videos",
  value,
  onChange,
  maxNumber,
  ...props
}: VideoUrlFieldProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [errors, setErrors] = useState<string[] | null>(null);

  const handleChange = useCallback(
    (str: string) => {
      const lines = str.split("\n").map((line) => line.trim());

      const matches = [];
      const unmatched = [];
      const newErrors = [];

      for (const line of lines) {
        if (line.length === 0) continue;

        const match = parseVideoUrl(line);
        if (match === null) {
          newErrors.push(`"${line}" is not a valid video URL`);
          unmatched.push(line);
        } else {
          if (value.includes(match.normalizedUrl)) {
            newErrors.push(`"${line}" is already added`);
          } else {
            matches.push(match.normalizedUrl);
          }
        }

        onChange([...value, ...matches]);
        setInputValue(unmatched.join("\n"));
        setErrors(newErrors);
      }
    },
    [onChange, value],
  );

  return (
    <div>
      <div className="flex flex-col gap-2">
        {errors && errors.length > 0 && (
          <MessageBox variant="failure">
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </MessageBox>
        )}

        <TextAreaField
          {...props}
          label={
            <span className="inline-flex w-full flex-row items-end justify-between">
              <span>{label}</span>
              {maxNumber && (
                <span className="text-sm text-gray-600">
                  {value.length} / {maxNumber}
                </span>
              )}
            </span>
          }
          value={inputValue}
          onChange={(value) => setInputValue(value)}
          onBlur={() => handleChange(inputValue)}
          placeholder="Paste video URLs here (YouTube or Streamable). One per line. Click Add to add them."
        />
        <Button
          size="small"
          width="auto"
          onClick={() => handleChange(inputValue)}
          className={
            inputValue.length === 0
              ? disabledButtonClasses
              : defaultButtonClasses
          }
          disabled={inputValue.length === 0}
        >
          <IconPlus className="size-6" /> Add Videos
        </Button>
      </div>
    </div>
  );
}
