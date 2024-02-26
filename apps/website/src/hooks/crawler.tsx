import { useMemo } from "react";

const useCrawler = () =>
  useMemo(
    () =>
      typeof navigator !== "undefined" &&
      ["googlebot", "google-inspectiontool", "bingbot", "linkedinbot"].some(
        (bot) => navigator.userAgent.toLowerCase().includes(bot),
      ),
    [],
  );

export default useCrawler;
