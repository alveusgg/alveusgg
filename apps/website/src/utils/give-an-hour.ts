export type GiveAnHourParticipant = {
  userId: string | null;
  displayName: string | null;
};

const participantKey = ({ userId, displayName }: GiveAnHourParticipant) => {
  if (userId) return `user:${userId}`;
  if (displayName) return `name:${displayName}`;
  return null;
};

export function countFirstTimeGiveAnHourParticipants(
  entries: GiveAnHourParticipant[],
  previousEntries: GiveAnHourParticipant[],
) {
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

  return participants.size - returningParticipants.size;
}
