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

  const increment = total >= 50_000 ? 5000 : 1000;
  const target = Math.ceil(total / increment) * increment;
  const targetFmt = useLocaleString(target);

  if (!subscriptions) return null;

  return (
    <p
      className={classes(
        className,
        "text-xl font-bold text-white tabular-nums text-stroke",
      )}
      {...props}
    >
      Subs: {totalFmt} / {targetFmt}
    </p>
  );
};

export default Subs;
