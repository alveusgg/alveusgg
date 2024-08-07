import { classes } from "@/utils/classes";

export type SwitchFieldProps = {
  isChecked: boolean;
  onClick: (isChecked: boolean) => void;
  showLabel?: boolean;
  title: string;
};

export const SwitchField = ({
  isChecked,
  showLabel = false,
  title,
  onClick,
}: SwitchFieldProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={() => {
        onClick(!isChecked);
      }}
      title={title}
      className="group flex flex-wrap items-center justify-center gap-2"
    >
      {showLabel && <span className="label">{title}</span>}
      <div
        className={classes(
          isChecked && "bg-alveus-green-300",
          "relative inline-flex h-4 w-8 items-center rounded-full border-2 border-alveus-green transition-colors group-[:hover:not(:focus-within)]:bg-alveus-green",
        )}
      >
        <span
          className={classes(
            isChecked ? "translate-x-3.5" : "-translate-x-0.5",
            "inline-block h-4 w-4 rounded-full border-2 border-alveus-green bg-alveus-tan transition-transform",
          )}
        />
      </div>
    </button>
  );
};
