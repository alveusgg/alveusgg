import { type ComponentType, Fragment } from "react";

import { trpc } from "@/utils/trpc";

import useLocaleString from "@/hooks/locale";

import {
  type DateString,
  parseDateString,
} from "@/components/show-and-tell/GiveAnHourProgress";

import type { IconProps } from "@/icons/BaseIcon";
import IconCalendar from "@/icons/IconCalendar";
import IconMapPin from "@/icons/IconMapPin";
import IconPencil from "@/icons/IconPencil";
import IconUserGroup from "@/icons/IconUserGroup";

interface MetricItem {
  id: string;
  label: string;
  value: number;
  detail?: string;
}

type GiveAnHourCampaignRange = {
  start: DateString;
  end: DateString;
};

export const useGiveAnHourStats = (ranges: GiveAnHourCampaignRange[]) =>
  trpc.showAndTell.getGiveAnHourStats.useQuery(
    {
      ranges: ranges.map(({ start, end }) => ({
        start: parseDateString(start),
        end: parseDateString(end, 1),
      })),
    },
    { refetchInterval: 5 * 60 * 1000 },
  );

type GiveAnHourStatsQuery = ReturnType<typeof useGiveAnHourStats>;

const MetricRow = ({ label, value, detail }: MetricItem) => {
  const formattedValue = useLocaleString(Math.round(value));

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 leading-tight">
      <span className="text-lg leading-none font-semibold tabular-nums md:text-xl">
        {formattedValue}
      </span>
      <span className="text-xs md:text-sm">{label}</span>
      {detail && <span className="text-xs opacity-75">{detail}</span>}
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  items,
}: {
  icon: ComponentType<IconProps>;
  items: MetricItem[];
}) => (
  <div className="flex min-h-44 min-w-0 flex-col rounded-xl bg-white/75 p-3 text-center text-alveus-green-900 shadow-lg backdrop-blur-sm sm:aspect-square sm:min-h-0 md:p-2 md:text-lg lg:aspect-auto lg:h-[270px]">
    <div className="mx-auto size-8 shrink-0">
      <Icon className="size-full" />
    </div>
    <div className="flex min-h-0 flex-1 flex-col">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && (
            <div className="h-3 flex-none border-t border-alveus-green-900/15" />
          )}
          <MetricRow {...item} />
        </Fragment>
      ))}
    </div>
  </div>
);

export const GiveAnHourStats = ({
  statsQuery,
}: {
  statsQuery: GiveAnHourStatsQuery;
}) => {
  const stats = statsQuery.data;
  const hoursFormatted = useLocaleString(stats?.hours ?? 0);
  const daysFormatted = useLocaleString(Math.floor((stats?.hours ?? 0) / 24));
  const membersFormatted = useLocaleString(stats?.participants ?? 0);

  if (statsQuery.isPending) {
    return (
      <div
        className="mt-4 w-full animate-pulse"
        aria-label="Loading campaign statistics"
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="min-h-44 rounded-xl bg-alveus-green/10 sm:aspect-square sm:min-h-0 lg:aspect-auto lg:h-[270px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || statsQuery.isError) {
    return (
      <p className="mt-3 text-sm opacity-75">
        Campaign statistics are unavailable right now.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-4 w-full text-left text-lg">
        Since 2024, <strong>{membersFormatted} members</strong> of the Alveus
        community have given{" "}
        <strong>
          {hoursFormatted} {stats.hours === 1 ? "hour" : "hours"} (~{daysFormatted}{" "}
          {Math.floor(stats.hours / 24) === 1 ? "day" : "days"})
        </strong>
        {" during WWF's Give an Hour for Earth campaigns."}
      </p>

      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={IconCalendar}
          items={[
            {
              id: "average-hours",
              label: "average hours per campaign",
              value: stats.averageCommunityHoursPerCampaign,
            },
            {
              id: "record-hours",
              label: "most hours in a campaign",
              value: stats.recordHighCampaignHours,
              detail: stats.recordHighCampaignYear
                ? `${stats.recordHighCampaignYear}`
                : undefined,
            },
          ]}
        />
        <MetricCard
          icon={IconUserGroup}
          items={[
            {
              id: "average-new-participants",
              label: "average first-time participants per campaign",
              value: stats.averageFirstTimeParticipantsPerCampaign,
            },
            {
              id: "hours-per-participant",
              label: "average hours per participant",
              value: stats.averageHoursPerParticipant,
            },
          ]}
        />
        <MetricCard
          icon={IconPencil}
          items={[
            { id: "posts", label: "total posts", value: stats.posts },
            {
              id: "average-posts",
              label: "average posts per campaign",
              value: stats.averagePostsPerCampaign,
            },
          ]}
        />
        <MetricCard
          icon={IconMapPin}
          items={[
            {
              id: "locations",
              label: "locations",
              value: stats.locations,
            },
            {
              id: "countries",
              label: "countries",
              value: stats.countries,
            },
          ]}
        />
      </div>
    </div>
  );
};
