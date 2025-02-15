import type { ChangeEvent } from "react";

import { classes } from "@/utils/classes";

import { navLinkClassesSub } from "@/components/layout/navbar/NavLink";

export const NotificationCategoryCheckbox = ({
  tag,
  label,
  endpoint,
  isRegistered,
  enabled,
  tags,
  handleChange,
}: {
  tag: string;
  label: string;
  endpoint: string;
  isRegistered: boolean;
  enabled: boolean;
  tags: Record<string, string>;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label
      htmlFor={`tag-${tag}`}
      className={classes(
        navLinkClassesSub,
        "relative flex cursor-pointer items-start",
      )}
    >
      <div className="flex h-5 items-center">
        <input
          id={`tag-${tag}`}
          name={`tag-${tag}`}
          key={`${isRegistered}-${tag}-${endpoint}`}
          value="1"
          checked={enabled && tags ? tags[tag] === "1" : true}
          type="checkbox"
          disabled={!enabled}
          className="size-4 rounded-sm border-gray-300 accent-alveus-green"
          onChange={handleChange}
        />
      </div>

      <div className="ml-2 text-sm font-medium">{label}</div>
    </label>
  );
};
