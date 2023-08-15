import React, { useCallback, useState } from "react";
import { parseVideoUrl } from "@/utils/video-urls";
import IconTrash from "@/icons/IconTrash";
import IconPlus from "@/icons/IconPlus";
import { Button, defaultButtonClasses, disabledButtonClasses } from "../Button";
import { MessageBox } from "../MessageBox";
import { VideoPlatformIcon } from "../VideoPlatformIcon";
import type { TextAreaFieldProps } from "./TextAreaField";
import { TextAreaField } from "./TextAreaField";

type VideoUrlFieldProps = Omit<
  TextAreaFieldProps,
  "value" | "onChange" | "label"
> & {
  label?: string;
  videoUrls: string[];
  setVideoUrls: (videoUrls: string[]) => void;
  maxNumber?: number;
};

export const useVideoLinksData = (initialVideoUrls: string[] = []) => {
  const [videoUrls, setVideoUrls] = useState<string[]>(initialVideoUrls);
  return { videoUrls, setVideoUrls };
};

export function VideoLinksField({
  label = "Videos",
  videoUrls,
  setVideoUrls,
  maxNumber = 4,
  ...props
}: VideoUrlFieldProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [errors, setErrors] = useState<string[] | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      const lines = value.split("\n").map((line) => line.trim());

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
          if (videoUrls.includes(match.normalizedUrl)) {
            newErrors.push(`"${line}" is already added`);
          } else {
            matches.push(match.normalizedUrl);
          }
        }

        setVideoUrls([...videoUrls, ...matches]);
        setInputValue(unmatched.join("\n"));
        setErrors(newErrors);
      }
    },
    [setVideoUrls, videoUrls],
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
              <span className="text-sm text-gray-600">
                {videoUrls.length} / {maxNumber}
              </span>
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
          <IconPlus className="h-6 w-6" /> Add Videos
        </Button>

        {videoUrls.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {videoUrls.map((url) => (
              <li
                key={url}
                className="flex flex-row items-center justify-between gap-2 rounded-xl bg-white p-1 px-3 shadow-xl"
              >
                <VideoPlatformIcon
                  className="h-5 w-5"
                  platform={parseVideoUrl(url)?.platform}
                />
                <span className="min-w-0 flex-1 truncate text-left">{url}</span>
                <Button
                  size="small"
                  width="auto"
                  onClick={() => {
                    setVideoUrls(videoUrls.filter((item) => item !== url));
                  }}
                >
                  <IconTrash className="h-6 w-6" /> Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
