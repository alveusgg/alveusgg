import Image from "next/image";

import { trpc } from "@/utils/trpc";
import { getShortBaseUrl } from "@/utils/short-url";

import Link from "@/components/content/Link";

export function Schedule() {
  const schedule = trpc.notifications.getSchedule.useQuery();

  if (schedule.isLoading) return <p>Loading schedule...</p>;

  if (!schedule.data) return <p>No schedule is available currently.</p>;

  return (
    <Link
      href={`${getShortBaseUrl()}/l/${schedule.data.slug}`}
      external
      custom
      className="group"
    >
      <Image
        src={schedule.data.link}
        alt=""
        width={980}
        height={675}
        className="h-auto w-full rounded-md border-2 border-alveus-green-900/80 bg-alveus-green shadow-md transition group-hover:scale-102 group-hover:shadow-xl"
      />
    </Link>
  );
}
