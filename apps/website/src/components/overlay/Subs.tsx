import { keepPreviousData } from "@tanstack/react-query";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import useLocaleString from "@/hooks/locale";

const Subs = ({ className }: { className?: string }) => {
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

  return (
    subscriptions && (
      <p
        className={classes(
          className,
          "font-mono text-4xl text-stroke-2 font-medium text-white",
        )}
      >
        Subs: {totalFmt} / {targetFmt}
      </p>
    )
  );
};

export default Subs;
