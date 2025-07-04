export const DATETIME_ALVEUS_ZONE = "America/Chicago";

export const getShortTimezoneName = ({
  locale,
  timeZone,
}: Partial<{ locale: string; timeZone: string }>) =>
  Intl.DateTimeFormat(locale, {
    timeZoneName: "short",
    timeZone,
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;

export const DATETIME_ALVEUS_ZONE_SHORT = getShortTimezoneName({
  locale: "en-US",
  timeZone: DATETIME_ALVEUS_ZONE,
});
