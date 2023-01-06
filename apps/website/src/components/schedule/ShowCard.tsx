import React from "react";
import Image from "next/image";

import type { TimeString, WeekdayName } from "../shared/LocalWeekdayTimeSlot";
import { LocalWeekdayTimeSlot } from "../shared/LocalWeekdayTimeSlot";
import { Headline } from "../shared/Headline";

export type ShowCardProps = {
  name: string;
  imageUrl: string;
  timeSlotCT: TimeString;
  weekday: WeekdayName;
};

export const ShowCard: React.FC<ShowCardProps> = ({
  name,
  imageUrl,
  timeSlotCT,
  weekday,
}) => {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white p-2 shadow-xl">
      <Headline>{weekday}</Headline>
      <div className="w-full border-t"></div>
      <Image
        width={400}
        height={400}
        src={imageUrl}
        alt={name}
        className="aspect-square object-contain"
      />
      <div className="w-full border-t py-4 text-center text-2xl font-bold leading-loose">
        {timeSlotCT} <abbr title="Central Time (Austin, Texas)">CT</abbr>
        <br />
        <span className="font-normal text-gray-500">Local: </span>
        <LocalWeekdayTimeSlot
          timeSlot={timeSlotCT}
          weekday={weekday}
          zone="America/Chicago"
        />
      </div>
    </div>
  );
};
