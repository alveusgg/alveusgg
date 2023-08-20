import { int, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { relations, type InferModel } from "drizzle-orm";

export type TwitchChannel = InferModel<typeof twitchChannels, "select">;

export const twitchChannels = mysqlTable("TwitchChannel", {
  channelId: varchar("channelId", { length: 191 }).notNull(),
  username: varchar("username", { length: 191 }).notNull(),
  label: varchar("label", { length: 191 }).notNull(),
  broadcasterAccountId: varchar("broadcasterAccountId", { length: 191 }),
  moderatorAccountId: varchar("moderatorAccountId", { length: 191 }),
});

export type Account = InferModel<typeof accounts, "select">;

export const accounts = mysqlTable(
  "Account",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 191 }),
    access_token: varchar("access_token", { length: 191 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    id_token: varchar("id_token", { length: 191 }),
    session_state: varchar("session_state", { length: 191 }),
  },
  (accounts) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(accounts.id),
    providerProviderAccountIndex: uniqueIndex(
      "Account_provider_providerAccountId_key",
    ).on(accounts.provider, accounts.providerAccountId),
  }),
);

export type User = InferModel<typeof users, "select">;

export const users = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }),
    email: varchar("email", { length: 191 }),
  },
  (users) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(accounts.id),
    userEmailIndex: uniqueIndex("User_email_key").on(users.email),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}));

export type UserRole = InferModel<typeof userRoles, "select">;

export const userRoles = mysqlTable(
  "UserRole",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    role: varchar("role", { length: 191 }).notNull(),
  },
  (userRoles) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(accounts.id),
    userRoleUserIdRoleIndex: uniqueIndex("UserRole_userId_role_key").on(
      userRoles.userId,
      userRoles.role,
    ),
  }),
);

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));
