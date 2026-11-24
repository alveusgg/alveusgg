import { classes } from "@/utils/classes";

export default function WishlistFundsNote({
  className,
}: {
  className?: string;
}) {
  return (
    <p className={classes("text-sm", className)}>
      Alveus will do its best to purchase the item shown. If it’s unavailable or
      no longer needed, your donation will support general operations. Any
      amount above the item’s funding goal supports Alveus Sanctuary. For items
      tagged ARRI, the excess supports the Alveus Research and Recovery
      Institute.
    </p>
  );
}
