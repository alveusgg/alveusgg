import { classes } from "@/utils/classes";

const SeenOnStreamBadgeBackground = ({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={classes(
      "absolute inset-0 aspect-square h-full w-full drop-shadow",
      dark ? "fill-alveus-tan" : "fill-alveus-green",
      className,
    )}
    viewBox="0 0 24 24"
  >
    <path d="m12 0 2.1 2.6 3.1-1.4.8 3.3h3.4l-.7 3.3 3 1.5-2 2.7 2 2.7-3 1.5.7 3.3H18l-.8 3.3-3-1.4L12 24l-2.1-2.6-3.1 1.4-.8-3.3H2.6l.7-3.3-3-1.5 2-2.7-2-2.7 3-1.5-.7-3.3H6l.8-3.3 3 1.4z" />
  </svg>
);

export const SeenOnStreamBadge = ({ dark = false, pulse = false }) => {
  return (
    <div className="absolute right-0 top-0 flex aspect-square w-[80px] items-center rotate-12">
      {pulse && (
        <div className="absolute inset-0 size-full opacity-25 scale-75 motion-reduce:hidden">
          <SeenOnStreamBadgeBackground
            dark={dark}
            className="animate-ping scale-150"
          />
        </div>
      )}
      <SeenOnStreamBadgeBackground dark={dark} />
      <span
        className={classes(
          "relative text-center text-sm leading-tight",
          dark ? "text-alveus-green-900" : "text-alveus-tan",
        )}
      >
        Seen on stream
      </span>
    </div>
  );
};
