import React from "react";

import IconCalendar from "@/icons/IconCalendar";

import { classes } from "@/utils/classes";

type TimelineProps = {
  items: {
    key: string;
    date: string;
    content: React.ReactNode;
  }[];
  before?: string;
  after?: string;
};

const Timeline: React.FC<TimelineProps> = ({ items, before, after }) => (
  <div className="relative z-0 mx-auto max-w-6xl">
    <div
      className={classes(
        "absolute left-5 -z-10 w-1 -translate-x-1/2 bg-alveus-green md:left-1/2",
        before || "top-0",
        after || "bottom-0",
      )}
    />
    <ol>
      {items.map((item, idx) => (
        <li key={item.key} className="relative my-4 flex items-start">
          <div
            className={`absolute left-5 inline-block ${
              idx % 2 ? "md:left-1/2" : "md:left-auto md:right-1/2"
            }`}
          >
            <div
              className={`
            mt-1
            hidden
            border-y-[1rem] border-solid border-y-transparent md:block
            ${
              idx % 2
                ? "ml-6 border-l-0 border-r-[1rem] border-r-alveus-green"
                : "mr-6 border-l-[1rem] border-r-0 border-l-alveus-green"
            }`}
            />
            <div
              className={`
            ml-6
            mt-1 border-y-[1rem] border-l-0 border-r-[1rem]
            border-solid border-y-transparent border-r-alveus-green md:hidden`}
            />
          </div>
          <div className="rounded-full bg-alveus-green p-3 text-alveus-tan">
            <IconCalendar size={16} />
          </div>
          <div
            className={`hidden basis-1/2 px-4 pt-2 md:block ${
              idx % 2 ? "md:order-first" : "md:order-last"
            }`}
          >
            <p
              className={`text-md text-alveus-green-700 ${
                idx % 2 ? "text-right" : "text-left"
              }`}
            >
              {item.date}
            </p>
          </div>
          <div
            className={`basis-full px-4 md:basis-1/2 ${
              idx % 2 ? "md:order-last" : "md:order-first"
            }`}
          >
            <div className="text-md rounded-lg bg-alveus-green p-6 text-alveus-tan">
              <p className="mb-4 md:hidden">{item.date}</p>
              {item.content}
            </div>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default Timeline;
