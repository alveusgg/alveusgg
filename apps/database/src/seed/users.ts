import { prisma } from "../index";

// Role names must match apps/website/src/data/user-roles.ts
const allRoles = [
  "dashboard",
  "showAndTell",
  "notifications",
  "forms",
  "bingos",
  "twitchApi",
  "shortLinks",
  "calendarEvents",
  "ptzControl",
  "roundsChecks",
  "donations",
];

type SeedUser = {
  email: string;
  name: string;
  roles: string[];
};

// Seeded users cannot be signed in to (auth is Twitch OAuth), they act as
// example content authors and role holders for the admin user list.
const users: SeedUser[] = [
  { email: "seed-admin@example.com", name: "SeedAdmin", roles: allRoles },
  {
    email: "seed-moderator@example.com",
    name: "SeedModerator",
    roles: ["dashboard", "showAndTell"],
  },
  {
    email: "seed-forms-manager@example.com",
    name: "SeedFormsManager",
    roles: ["dashboard", "forms"],
  },
  { email: "seed-alice@example.com", name: "SeedAlice", roles: [] },
  { email: "seed-bob@example.com", name: "SeedBob", roles: [] },
  { email: "seed-carol@example.com", name: "SeedCarol", roles: [] },
];

export async function seedUsers() {
  const usersByEmail: Record<string, { id: string }> = {};

  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      create: { email: user.email, name: user.name },
      update: { name: user.name },
    });
    usersByEmail[user.email] = record;

    for (const role of user.roles) {
      await prisma.userRole.upsert({
        where: { userId_role: { userId: record.id, role } },
        create: { userId: record.id, role },
        update: {},
      });
    }
  }

  console.log(`Seeded ${users.length} users`);
  return usersByEmail;
}
