import { keepPreviousData } from "@tanstack/react-query";
import type { HTMLProps } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import useLocaleString from "@/hooks/locale";

const Subs = ({ className, ...props }: HTMLProps<HTMLParagraphElement>) => {
  const { data: subscriptions } = trpc.stream.getSubscriptions.useQuery(
    undefined,
    {
      placeholderData: keepPreviousData,
      refetchInterval: 30 * 1000,
      refetchIntervalInBackground: true,
    },
  );

  const total = subscriptions?.total ?? 0;
  const totalFmt = useLocaleString(total);

  // Show a target based on the nearest 100
  const target = Math.ceil(total / 100) * 100;
  const targetFmt = useLocaleString(target);

  if (!subscriptions) return null;

  return (
    <p
      className={classes(
        className,
        "text-3xl font-medium text-white tabular-nums text-stroke-2",
      )}
      {...props}
    >
      Subs: {totalFmt} / {targetFmt}
    </p>
  );
};

export default Subs;
