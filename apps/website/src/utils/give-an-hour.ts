import { extractInfoFromMapFeatures } from "./locations";

export type GiveAnHourEntry = {
  id: string;
  userId: string | null;
  displayName: string | null;
  location: string | null;
  volunteeringMinutes: number | null;
};

export type GiveAnHourPreviousEntry = Pick<
  GiveAnHourEntry,
  "userId" | "displayName"
>;

export type GiveAnHourStats = {
  minutes: number;
  hours: number;
  posts: number;
  participants: number;
  firstTimeParticipants: number;
  averageHoursPerParticipant: number;
  locations: number;
  countries: number;
};

const participantKey = ({ userId, displayName }: GiveAnHourPreviousEntry) => {
  if (userId) return `user:${userId}`;
  if (displayName) return `name:${displayName}`;
  return null;
};

export function summarizeGiveAnHourEntries(
  entries: GiveAnHourEntry[],
  previousEntries: GiveAnHourPreviousEntry[],
): GiveAnHourStats {
  const previousUserIds = new Set(
    previousEntries.flatMap(({ userId }) => (userId ? [userId] : [])),
  );
  const previousDisplayNames = new Set(
    previousEntries.flatMap(({ displayName }) =>
      displayName ? [displayName] : [],
    ),
  );

  const participants = new Set<string>();
  const returningParticipants = new Set<string>();

  for (const entry of entries) {
    const key = participantKey(entry);
    if (!key) continue;

    participants.add(key);
    if (
      (entry.userId && previousUserIds.has(entry.userId)) ||
      (entry.displayName && previousDisplayNames.has(entry.displayName))
    ) {
      returningParticipants.add(key);
    }
  }

  const mapFeatures = entries.flatMap(({ id, location }) =>
    location ? [{ id, location }] : [],
  );
  const { locations, countries } = extractInfoFromMapFeatures(mapFeatures);
  const minutes = entries.reduce(
    (total, { volunteeringMinutes }) => total + (volunteeringMinutes ?? 0),
    0,
  );
  const firstTimeParticipants = participants.size - returningParticipants.size;

  return {
    minutes,
    hours: Math.round(minutes / 60),
    posts: entries.length,
    participants: participants.size,
    firstTimeParticipants,
    averageHoursPerParticipant:
      participants.size === 0
        ? 0
        : Math.round(minutes / 60 / participants.size),
    locations: locations.size,
    countries: countries.size,
  };
}
