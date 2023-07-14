import type { InferModel } from "drizzle-orm";
import {
  customType,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

// TODO: what else can we do with this?
const cuid = customType<{ data: string; notNull: true }>({
  dataType() {
    return "varchar(191)";
  },
});

// TODO: update chatbot code to not await getDatabase()

// TODO: add primary keys

export type ClientAccessToken = InferModel<
  typeof clientAccessTokenTable,
  "select"
>;

export const clientAccessTokenTable = mysqlTable(
  "ClientAccessToken",
  {
    service: varchar("service", { length: 191 }).notNull(),
    client_id: varchar("client_id", { length: 191 }).notNull(),
    access_token: varchar("access_token", { length: 191 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 191 }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
    expiresAt: timestamp("expiresAt"),
  },
  (clientAccessTokenTable) => ({
    serviceClientIdIndex: uniqueIndex("service_client_id_key").on(
      clientAccessTokenTable.service,
      clientAccessTokenTable.client_id
    ),
  })
);

export type TaskExecutionEvent = InferModel<
  typeof taskExecutionEventTable,
  "select"
>;

export const taskExecutionEventTable = mysqlTable("TaskExecutionEvent", {
  id: cuid("id").notNull(),
  task: varchar("task", { length: 191 }).notNull(),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  finishedAt: timestamp("finishedAt"),
});

export type ChannelUpdateEvent = InferModel<
  typeof channelUpdateEventTable,
  "select"
>;

export const channelUpdateEventTable = mysqlTable("ChannelUpdateEvent", {
  id: cuid("id").notNull(),
  service: varchar("service", { length: 191 }).notNull(),
  channel: varchar("channel", { length: 191 }).notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  category_id: varchar("category_id", { length: 191 }).notNull(),
  category_name: varchar("category_name", { length: 191 }).notNull(),
  source: varchar("source", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type StreamStatusEvent = InferModel<
  typeof streamStatusEventTable,
  "select"
>;

export const streamStatusEventTable = mysqlTable("StreamStatusEvent", {
  id: cuid("id").notNull(),
  service: varchar("service", { length: 191 }).notNull(),
  channel: varchar("channel", { length: 191 }).notNull(),
  online: int("online").notNull(),
  source: varchar("source", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  startedAt: timestamp("startedAt"),
});

// Necessary for Next auth
export type Account = InferModel<typeof accountTable, "select">;

export const accountTable = mysqlTable(
  "Account",
  {
    id: cuid("id").notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 191 }),
  },
  (accountTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(accountTable.id),
    providerProviderAccountIndex: uniqueIndex(
      "Account_provider_providerAccountId_key"
    ).on(accountTable.provider, accountTable.providerAccountId),
    userIdIndex: uniqueIndex("Account_userId_key").on(accountTable.userId),
  })
);

export type Session = InferModel<typeof sessionTable, "select">;

export const sessionTable = mysqlTable(
  "Session",
  {
    id: cuid("id").notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull().unique(),
    userId: varchar("userId", { length: 191 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (sessionTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(sessionTable.id),
    sessionTokenIndex: uniqueIndex("Session_sessionToken_key").on(
      sessionTable.sessionToken
    ),
    userIdIndex: uniqueIndex("Session_userId_key").on(sessionTable.userId),
  })
);

export type User = InferModel<typeof userTable, "select">;

export const userTable = mysqlTable(
  "User",
  {
    id: cuid("id").notNull(),
    name: varchar("name", { length: 191 }).unique(),
    email: varchar("email", { length: 191 }),
    emailVerified: timestamp("emailVerified"),
    image: varchar("image", { length: 191 }),
  },
  (userTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(userTable.id),
    emailIndex: uniqueIndex("User_email_key").on(userTable.email),
  })
);

export type VerificationToken = InferModel<
  typeof verificationTokenTable,
  "select"
>;

export const verificationTokenTable = mysqlTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (verificationTokenTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      verificationTokenTable.identifier,
      verificationTokenTable.token
    ),
  })
);

export type UserRole = InferModel<typeof userRoleTable, "select">;

export const userRoleTable = mysqlTable(
  "UserRole",
  {
    id: cuid("id").notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    role: varchar("role", { length: 191 }).notNull(),
  },
  (userRoleTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(userRoleTable.id),
    userIdRoleIndex: uniqueIndex("UserRole_userId_role_key").on(
      userRoleTable.userId,
      userRoleTable.role
    ),
  })
);

// TODO: how to extract type for this?
// export type NotificationUrgency = InferModel<typeof notificationUrgencyEnum, "insert">;

// TODO: look into drizzle-zod?
export const notificationUrgencyEnum = mysqlEnum("urgency", [
  "VERY_LOW",
  "LOW",
  "NORMAL",
  "HIGH",
]);

export type Notification = InferModel<typeof notificationTable, "select">;

export const notificationTable = mysqlTable("Notification", {
  id: cuid("id").notNull(),
  message: varchar("message", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(),
  canceledAt: timestamp("canceledAt"),
  scheduledStartAt: timestamp("scheduledStartAt"),
  scheduledEndAt: timestamp("scheduledEndAt"),
  title: varchar("title", { length: 191 }),
  linkUrl: varchar("linkUrl", { length: 191 }),
  imageUrl: varchar("imageUrl", { length: 191 }),
  tag: varchar("tag", { length: 191 }),
  urgency: notificationUrgencyEnum.notNull().default("NORMAL"),
  isPush: int("isPush").notNull().default(0),
  isDiscord: int("isDiscord").notNull().default(0),
});

// TODO: how to extract type for this?
// export type NotificationPushProcessingStatus = InferModel<typeof notificationPushProcessingStatusEnum, "insert">;

// TODO: look into drizzle-zod?
export const notificationPushProcessingStatusEnum = mysqlEnum(
  "processingStatus",
  ["PENDING", "IN_PROGRESS", "DONE"]
);

export type NotificationPush = InferModel<
  typeof notificationPushTable,
  "select"
>;

export const notificationPushTable = mysqlTable(
  "NotificationPush",
  {
    notificationId: varchar("notificationId", { length: 191 }).notNull(),
    subscriptionId: varchar("subscriptionId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    processingStatus: notificationPushProcessingStatusEnum
      .notNull()
      .default("PENDING"),
    attempts: int("attempts"),
    createdAt: timestamp("createdAt").defaultNow(),
    expiresAt: timestamp("expiresAt").notNull(),
    clickedAt: timestamp("clickedAt"),
    failedAt: timestamp("failedAt"),
    deliveredAt: timestamp("deliveredAt"),
  },
  (notificationPushTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      notificationPushTable.notificationId,
      notificationPushTable.subscriptionId
    ),
    userIdIndex: uniqueIndex("NotificationPush_userId_key").on(
      notificationPushTable.userId
    ),
    processingStatusIndex: uniqueIndex(
      "NotificationPush_processingStatus_key"
    ).on(notificationPushTable.processingStatus),
    subscriptionIdIndex: uniqueIndex("NotificationPush_subscriptionId_key").on(
      notificationPushTable.subscriptionId
    ),
  })
);

// FIXME: Endpoint URLs could be up to 2048 chars, which would be 8192 bytes with utf8mb4 (4 bytes per char),
//        but innodb unique index keys may only be up to 3072 bytes which would be 768 characters so we round
//        down to 720. So far Endpoint URLS have been less than 256 chars. So that _should_ not collide.
export type PushSubscription = InferModel<
  typeof pushSubscriptionTable,
  "select"
>;

export const pushSubscriptionTable = mysqlTable(
  "PushSubscription",
  {
    id: cuid("id").notNull(),
    userId: varchar("userId", { length: 191 }),
    endpoint: varchar("endpoint", { length: 720 }).notNull(), // ^ see FIXME above
    p256dh: varchar("p256dh", { length: 191 }),
    auth: varchar("auth", { length: 191 }),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
    deletedAt: timestamp("deletedAt"),
  },
  (pushSubscriptionTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(pushSubscriptionTable.id),
    endpointIndex: uniqueIndex("PushSubscription_endpoint_key").on(
      pushSubscriptionTable.endpoint
    ),
    userIdIndex: uniqueIndex("PushSubscription_userId_key").on(
      pushSubscriptionTable.userId
    ),
  })
);

export type PushSubscriptionTag = InferModel<
  typeof pushSubscriptionTagTable,
  "select"
>;

export const pushSubscriptionTagTable = mysqlTable(
  "PushSubscriptionTag",
  {
    subscriptionId: varchar("subscriptionId", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    value: varchar("value", { length: 191 }).notNull(),
  },
  (pushSubscriptionTagTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      pushSubscriptionTagTable.subscriptionId,
      pushSubscriptionTagTable.name
    ),
  })
);

export type NotificationDiscordChannelWebhook = InferModel<
  typeof notificationDiscordChannelWebhookTable,
  "select"
>;

export const notificationDiscordChannelWebhookTable = mysqlTable(
  "NotificationDiscordChannelWebhook",
  {
    notificationId: varchar("notificationId", { length: 191 }).notNull(),
    outgoingWebhookId: varchar("outgoingWebhookId", { length: 191 }).notNull(),
  },
  (notificationDiscordChannelWebhookTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      notificationDiscordChannelWebhookTable.notificationId,
      notificationDiscordChannelWebhookTable.outgoingWebhookId
    ),
    outgoingWebhookIdIndex: uniqueIndex(
      "NotificationDiscordChannelWebhook_outgoingWebhookId_key"
    ).on(notificationDiscordChannelWebhookTable.outgoingWebhookId),
  })
);

export type MailingAddress = InferModel<typeof mailingAddressTable, "select">;

export const mailingAddressTable = mysqlTable("MailingAddress", {
  id: cuid("id").notNull(),
  country: varchar("country", { length: 191 }).notNull(),
  addressLine1: varchar("addressLine1", { length: 191 }).notNull(),
  addressLine2: varchar("addressLine2", { length: 191 }).notNull(),
  city: varchar("city", { length: 191 }).notNull(),
  state: varchar("state", { length: 191 }).notNull(),
  postalCode: varchar("postalCode", { length: 191 }).notNull(),
  salt: varchar("salt", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Form = InferModel<typeof formTable, "select">;

export const formTable = mysqlTable(
  "Form",
  {
    id: cuid("id").notNull(),
    label: varchar("label", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }),
    active: int("active").default(0),
    startAt: timestamp("startAt").defaultNow(),
    endAt: timestamp("endAt"),
    outgoingWebhookUrl: varchar("outgoingWebhookUrl", { length: 720 }),
    showInLists: int("showInLists").default(1),
    config: text("config").default(""),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (formTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(formTable.id),
    slugIndex: uniqueIndex("Form_slug_key").on(formTable.slug),
  })
);

export type FormEntry = InferModel<typeof formEntryTable, "select">;

export const formEntryTable = mysqlTable(
  "FormEntry",
  {
    id: cuid("id").notNull(),
    formId: varchar("formId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    mailingAddressId: varchar("mailingAddressId", { length: 191 }).unique(),
    outgoingWebhookId: varchar("outgoingWebhookId", { length: 191 }).unique(),
    email: varchar("email", { length: 191 }),
    givenName: varchar("givenName", { length: 191 }).notNull(),
    familyName: varchar("familyName", { length: 191 }).notNull(),
    salt: varchar("salt", { length: 32 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (formEntryTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(formEntryTable.id),
    formIdUserIdIndex: uniqueIndex("FormEntry_formId_userId_key").on(
      formEntryTable.formId,
      formEntryTable.userId
    ),
    userIdIndex: uniqueIndex("FormEntry_userId_key").on(formEntryTable.userId),
  })
);

export type OutgoingWebhook = InferModel<typeof outgoingWebhookTable, "select">;

export const outgoingWebhookTable = mysqlTable(
  "OutgoingWebhook",
  {
    id: cuid("id").notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    url: varchar("url", { length: 720 }).notNull(),
    body: text("body").notNull(),
    userId: varchar("userId", { length: 191 }),
    retry: int("retry").default(0),
    attempts: int("attempts"),
    createdAt: timestamp("createdAt").defaultNow(),
    failedAt: timestamp("failedAt"),
    deliveredAt: timestamp("deliveredAt"),
    expiresAt: timestamp("expiresAt"),
  },
  (outgoingWebhookTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(outgoingWebhookTable.id),
    userIdIndex: uniqueIndex("OutgoingWebhook_userId_key").on(
      outgoingWebhookTable.userId
    ),
  })
);

export type LinkAttachment = InferModel<typeof linkAttachmentTable, "select">;

export const linkAttachmentTable = mysqlTable("LinkAttachment", {
  id: cuid("id").notNull(),
  type: varchar("type", { length: 191 }).notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  alternativeText: varchar("alternativeText", { length: 191 }).notNull(),
  caption: varchar("caption", { length: 191 }).notNull(),
  description: varchar("description", { length: 191 }).notNull(),
  url: varchar("url", { length: 191 }).notNull(),
});

export type ShowAndTellEntry = InferModel<
  typeof showAndTellEntryTable,
  "select"
>;

export const showAndTellEntryTable = mysqlTable(
  "ShowAndTellEntry",
  {
    // id: cuid("id").notNull(),
    id: cuid("id").notNull(),
    userId: varchar("userId", { length: 191 }),
    title: varchar("title", { length: 191 }).notNull(),
    text: text("text").notNull(),
    displayName: varchar("displayName", { length: 191 }),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
    approvedAt: timestamp("approvedAt"),
    seenOnStreamAt: timestamp("seenOnStreamAt"),
    seenOnStream: int("seenOnStream").default(0),
  },
  (showAndTellEntryTable) => ({
    // primaryIndex: uniqueIndex("PRIMARY").on(showAndTellEntryTable.id),
    userIdIndex: uniqueIndex("ShowAndTellEntry_userId_key").on(
      showAndTellEntryTable.userId
    ),
  })
);

export type ShowAndTellEntryAttachment = InferModel<
  typeof showAndTellEntryAttachmentTable,
  "select"
>;

export const showAndTellEntryAttachmentTable = mysqlTable(
  "ShowAndTellEntryAttachment",
  {
    // id: varchar("id", { length: 191 }).notNull(),
    id: cuid("id").notNull(),
    entryId: varchar("entryId", { length: 191 }).notNull(),
    attachmentType: varchar("attachmentType", { length: 191 }).notNull(),
    linkAttachmentId: varchar("linkAttachmentId", { length: 191 }).unique(),
    imageAttachmentId: varchar("imageAttachmentId", { length: 191 }).unique(),
  },
  (showAndTellEntryAttachmentTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(showAndTellEntryAttachmentTable.id),
    entryIdIndex: uniqueIndex("ShowAndTellEntryAttachment_entryId_key").on(
      showAndTellEntryAttachmentTable.entryId
    ),
  })
);

export type FileStorageObject = InferModel<
  typeof fileStorageObjectTable,
  "select"
>;

export const fileStorageObjectTable = mysqlTable(
  "FileStorageObject",
  {
    id: cuid("id").notNull(),
    key: varchar("key", { length: 191 }).notNull().unique(),
    name: varchar("name", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    prefix: varchar("prefix", { length: 191 }).notNull(),
    acl: varchar("acl", { length: 191 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    uploadedAt: timestamp("uploadedAt"),
    deletedAt: timestamp("deletedAt"),
    expiresAt: timestamp("expiresAt"),
  },
  (fileStorageObjectTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(fileStorageObjectTable.id),
    keyIndex: uniqueIndex("FileStorageObject_key_key").on(
      fileStorageObjectTable.key
    ),
  })
);

export type ImageMetadata = InferModel<typeof imageMetadataTable, "select">;

export const imageMetadataTable = mysqlTable(
  "ImageMetadata",
  {
    mimeType: varchar("mimeType", { length: 191 }).notNull(),
    width: int("width").notNull(),
    height: int("height").notNull(),
    fileStorageObjectId: varchar("fileStorageObjectId", {
      length: 191,
    })
      .notNull()
      .unique(),
  },
  (imageMetadataTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      imageMetadataTable.fileStorageObjectId
    ),
  })
);

export type ImageAttachment = InferModel<typeof imageAttachmentTable, "select">;

export const imageAttachmentTable = mysqlTable(
  "ImageAttachment",
  {
    id: cuid("id").notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    alternativeText: varchar("alternativeText", { length: 191 }).notNull(),
    caption: varchar("caption", { length: 191 }).notNull(),
    description: varchar("description", { length: 191 }).notNull(),
    url: varchar("url", { length: 191 }).notNull(),
    fileStorageObjectId: varchar("fileStorageObjectId", {
      length: 191,
    })
      .notNull()
      .unique(),
  },
  (imageAttachmentTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(imageAttachmentTable.id),
    fileStorageObjectIdIndex: uniqueIndex(
      "ImageAttachment_fileStorageObjectId_key"
    ).on(imageAttachmentTable.fileStorageObjectId),
  })
);
