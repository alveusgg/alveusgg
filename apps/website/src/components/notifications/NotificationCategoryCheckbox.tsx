import type { ChangeEvent } from "react";

import { classes } from "@/utils/classes";

import { navLinkClassesSub } from "@/components/layout/navbar/NavLink";

export const NotificationCategoryCheckbox: React.FC<{
  tag: string;
  label: string;
  endpoint: string;
  isRegistered: boolean;
  enabled: boolean;
  tags: Record<string, string>;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}> = ({ tag, label, endpoint, isRegistered, enabled, tags, handleChange }) => {
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
          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded border-gray-300"
          onChange={handleChange}
        />
      </div>

      <div className="ml-2 text-sm font-medium">{label}</div>
    </label>
  );
};
