type DiscordTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

const getDiscordTimestamp = (
  date: Date,
  style: DiscordTimestampStyle = "f",
): string => {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${style}>`;
};

export default getDiscordTimestamp;
