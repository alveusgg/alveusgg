import { classes } from "@/utils/classes";

const getActionPreviewTooltip = (preview: string) => {
  const ActionPreviewTooltip = ({
    className,
    children,
  }: {
    className: string;
    children: string;
  }) => (
    <div className={classes(className, "flex flex-col")}>
      <span>{children}</span>
      <span className="font-mono text-xs text-alveus-green-300">{preview}</span>
    </div>
  );
  return ActionPreviewTooltip;
};

export default getActionPreviewTooltip;
