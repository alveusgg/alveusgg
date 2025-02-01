import { type MouseEventHandler } from "react";
import { DATETIME_USER_ZONE, DATETIME_USER_ZONE_SHORT } from "@/hooks/timezone";
import IconCheck from "@/icons/IconCheck";
import { classes } from "@/utils/classes";
import {
  DATETIME_ALVEUS_ZONE,
  DATETIME_ALVEUS_ZONE_SHORT,
} from "@/utils/datetime";

export type CalendarTimezoneSwitchButtonProps = {
  label: string;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export const CalendarTimezoneSwitchButton = ({
  label,
  isSelected,
  onClick,
  className,
}: CalendarTimezoneSwitchButtonProps) => (
  <button
    role="radio"
    value={label}
    aria-checked={isSelected}
    className={classes(
      `relative flex items-center justify-center gap-2 rounded-full border border-alveus-green-900 p-1 text-sm text-alveus-green-900 transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan max-[420px]:p-0 max-[420px]:text-xs`,
      isSelected ? "bg-alveus-green-900 text-alveus-tan" : "bg-alveus-tan",
      className,
    )}
    onClick={onClick}
  >
    <span className="mr-4 ml-5 min-[420px]:mr-6 min-[420px]:ml-7">{label}</span>
    <IconCheck
      role="presentation"
      className={classes(
        "not-sr-only absolute top-1/2 left-1 w-3 -translate-y-1/2 min-[420px]:left-2 min-[420px]:w-5",
        !isSelected && "invisible",
      )}
    />
  </button>
);

export type CalendarTimezoneSwitchProps = {
  onChange: (timezone: string) => void;
  timeZone?: string;
};

export const CalendarTimezoneSwitch = ({
  onChange,
  timeZone,
}: CalendarTimezoneSwitchProps) => {
  const isAlveusTimeZone = timeZone === DATETIME_ALVEUS_ZONE;

  return (
    <div className="flex" role="radiogroup" aria-label="Calendar Timezone">
      <CalendarTimezoneSwitchButton
        label={`Local time (${DATETIME_USER_ZONE_SHORT})`}
        isSelected={!isAlveusTimeZone}
        className="rounded-r-none"
        onClick={() => onChange(DATETIME_USER_ZONE)}
      />
      <CalendarTimezoneSwitchButton
        label={`Alveus time (${DATETIME_ALVEUS_ZONE_SHORT})`}
        isSelected={isAlveusTimeZone}
        className="rounded-l-none border-l-0"
        onClick={() => onChange(DATETIME_ALVEUS_ZONE)}
      />
    </div>
  );
};
