import { classes } from "@/utils/classes";

export default function WishlistFundsNote({
  className,
}: {
  className?: string;
}) {
  return (
    <p className={classes("text-sm", className)}>
      Alveus will do its best to purchase the item shown. If it’s unavailable or
      no longer needed, your donation will support the sanctuary’s general
      operations. Any amount raised above the item’s funding goal also supports
      general operations.
    </p>
  );
}
