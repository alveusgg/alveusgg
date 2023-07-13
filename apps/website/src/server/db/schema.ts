import { sql, type InferModel } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export type ClientAccessToken = InferModel<typeof clientAccessTokens, "select">;

export const clientAccessTokens = mysqlTable(
  "ClientAccessToken",
  {
    service: varchar("service", { length: 191 }).notNull(),
    client_id: varchar("client_id", { length: 191 }).notNull(),
    access_token: varchar("access_token", { length: 191 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 191 }),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
    expiresAt: datetime("expiresAt"),
  },
  (clientAccessTokenTable) => ({
    serviceClientIdIndex: uniqueIndex("service_client_id_key").on(
      clientAccessTokenTable.service,
      clientAccessTokenTable.client_id
    ),
  })
);

export type TaskExecutionEvent = InferModel<
  typeof taskExecutionEvents,
  "select"
>;

export const taskExecutionEvents = mysqlTable("TaskExecutionEvent", {
  id: varchar("id", { length: 191 }).notNull(),
  task: varchar("task", { length: 191 }).notNull(),
  startedAt: datetime("startedAt").default(sql`CURRENT_TIMESTAMP`),
  finishedAt: datetime("finishedAt"),
});

export type ChannelUpdateEvent = InferModel<
  typeof channelUpdateEvents,
  "select"
>;

export const channelUpdateEvents = mysqlTable("ChannelUpdateEvent", {
  id: varchar("id", { length: 191 }).notNull(),
  service: varchar("service", { length: 191 }).notNull(),
  channel: varchar("channel", { length: 191 }).notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  category_id: varchar("category_id", { length: 191 }).notNull(),
  category_name: varchar("category_name", { length: 191 }).notNull(),
  source: varchar("source", { length: 191 }).notNull(),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

export type StreamStatusEvent = InferModel<typeof streamStatusEvents, "select">;

export const streamStatusEvents = mysqlTable("StreamStatusEvent", {
  id: varchar("id", { length: 191 }).notNull(),
  service: varchar("service", { length: 191 }).notNull(),
  channel: varchar("channel", { length: 191 }).notNull(),
  online: int("online").notNull(),
  source: varchar("source", { length: 191 }).notNull(),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  startedAt: datetime("startedAt"),
});

// Necessary for Next auth
export type Account = InferModel<typeof accounts, "select">;

export const accounts = mysqlTable(
  "Account",
  {
    id: varchar("id", { length: 191 }).notNull(),
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

export type Session = InferModel<typeof sessions, "select">;

export const sessions = mysqlTable(
  "Session",
  {
    id: varchar("id", { length: 191 }).notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    expires: datetime("expires").notNull(),
  },
  (sessionTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(sessionTable.id),
    sessionTokenIndex: uniqueIndex("Session_sessionToken_key").on(
      sessionTable.sessionToken
    ),
    userIdIndex: uniqueIndex("Session_userId_key").on(sessionTable.userId),
  })
);

export type User = InferModel<typeof users, "select">;

export const users = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }),
    email: varchar("email", { length: 191 }),
    emailVerified: datetime("emailVerified"),
    image: varchar("image", { length: 191 }),
  },
  (userTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(userTable.id),
    emailIndex: uniqueIndex("User_email_key").on(userTable.email),
  })
);

export type VerificationToken = InferModel<typeof verificationTokens, "select">;

export const verificationTokens = mysqlTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull(),
    expires: datetime("expires").notNull(),
  },
  (verificationTokenTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      verificationTokenTable.identifier,
      verificationTokenTable.token
    ),
  })
);

export type UserRole = InferModel<typeof userRoles, "select">;

export const userRoles = mysqlTable(
  "UserRole",
  {
    id: varchar("id", { length: 191 }).notNull(),
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

export type Notification = InferModel<typeof notifications, "select">;

export const notifications = mysqlTable("Notification", {
  id: varchar("id", { length: 191 }).notNull(),
  message: varchar("message", { length: 191 }).notNull(),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: datetime("expiresAt").notNull(),
  canceledAt: datetime("canceledAt"),
  scheduledStartAt: datetime("scheduledStartAt"),
  scheduledEndAt: datetime("scheduledEndAt"),
  title: varchar("title", { length: 191 }),
  linkUrl: varchar("linkUrl", { length: 191 }),
  imageUrl: varchar("imageUrl", { length: 191 }),
  tag: varchar("tag", { length: 191 }),
  urgency: varchar("urgency", { length: 191 }).default("NORMAL"),
  isPush: int("isPush").default(0),
  isDiscord: int("isDiscord").default(0),
});

export type NotificationPush = InferModel<typeof notificationPushes, "select">;

export const notificationPushes = mysqlTable(
  "NotificationPush",
  {
    notificationId: varchar("notificationId", { length: 191 }).notNull(),
    subscriptionId: varchar("subscriptionId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    processingStatus: varchar("processingStatus", { length: 191 }).default(
      "PENDING"
    ),
    attempts: int("attempts"),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    expiresAt: datetime("expiresAt").notNull(),
    clickedAt: datetime("clickedAt"),
    failedAt: datetime("failedAt"),
    deliveredAt: datetime("deliveredAt"),
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
export type PushSubscription = InferModel<typeof pushSubscriptions, "select">;

export const pushSubscriptions = mysqlTable(
  "PushSubscription",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    endpoint: varchar("endpoint", { length: 720 }).notNull(), // ^ see FIXME above
    p256dh: varchar("p256dh", { length: 191 }),
    auth: varchar("auth", { length: 191 }),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
    deletedAt: datetime("deletedAt"),
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
  typeof pushSubscriptionTags,
  "select"
>;

export const pushSubscriptionTags = mysqlTable(
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
  typeof notificationDiscordChannelWebhooks,
  "select"
>;

export const notificationDiscordChannelWebhooks = mysqlTable(
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

export type MailingAddress = InferModel<typeof mailingAddresses, "select">;

export const mailingAddresses = mysqlTable("MailingAddress", {
  id: varchar("id", { length: 191 }).notNull(),
  country: varchar("country", { length: 191 }).notNull(),
  addressLine1: varchar("addressLine1", { length: 191 }).notNull(),
  addressLine2: varchar("addressLine2", { length: 191 }).notNull(),
  city: varchar("city", { length: 191 }).notNull(),
  state: varchar("state", { length: 191 }).notNull(),
  postalCode: varchar("postalCode", { length: 191 }).notNull(),
  salt: varchar("salt", { length: 32 }).notNull(),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type Form = InferModel<typeof forms, "select">;

export const forms = mysqlTable(
  "Form",
  {
    id: varchar("id", { length: 191 }).notNull(),
    label: varchar("label", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }),
    active: int("active").default(0),
    startAt: datetime("startAt").default(sql`CURRENT_TIMESTAMP`),
    endAt: datetime("endAt"),
    outgoingWebhookUrl: varchar("outgoingWebhookUrl", { length: 720 }),
    showInLists: int("showInLists").default(1),
    config: text("config").default(""),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
  },
  (formTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(formTable.id),
    slugIndex: uniqueIndex("Form_slug_key").on(formTable.slug),
  })
);

export type FormEntry = InferModel<typeof formEntries, "select">;

export const formEntries = mysqlTable(
  "FormEntry",
  {
    id: varchar("id", { length: 191 }).notNull(),
    formId: varchar("formId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    mailingAddressId: varchar("mailingAddressId", { length: 191 }),
    outgoingWebhookId: varchar("outgoingWebhookId", { length: 191 }),
    email: varchar("email", { length: 191 }),
    givenName: varchar("givenName", { length: 191 }).notNull(),
    familyName: varchar("familyName", { length: 191 }).notNull(),
    salt: varchar("salt", { length: 32 }).notNull(),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
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

export type OutgoingWebhook = InferModel<typeof outgoingWebhooks, "select">;

export const outgoingWebhooks = mysqlTable(
  "OutgoingWebhook",
  {
    id: varchar("id", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    url: varchar("url", { length: 720 }).notNull(),
    body: text("body").notNull(),
    userId: varchar("userId", { length: 191 }),
    retry: int("retry").default(0),
    attempts: int("attempts"),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    failedAt: datetime("failedAt"),
    deliveredAt: datetime("deliveredAt"),
    expiresAt: datetime("expiresAt"),
  },
  (outgoingWebhookTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(outgoingWebhookTable.id),
    userIdIndex: uniqueIndex("OutgoingWebhook_userId_key").on(
      outgoingWebhookTable.userId
    ),
  })
);

export type LinkAttachment = InferModel<typeof linkAttachments, "select">;

export const linkAttachments = mysqlTable("LinkAttachment", {
  id: varchar("id", { length: 191 }).notNull(),
  type: varchar("type", { length: 191 }).notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  alternativeText: varchar("alternativeText", { length: 191 }).notNull(),
  caption: varchar("caption", { length: 191 }).notNull(),
  description: varchar("description", { length: 191 }).notNull(),
  url: varchar("url", { length: 191 }).notNull(),
});

export type ShowAndTellEntry = InferModel<typeof showAndTellEntries, "select">;

export const showAndTellEntries = mysqlTable(
  "ShowAndTellEntry",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    title: varchar("title", { length: 191 }).notNull(),
    text: text("text").notNull(),
    displayName: varchar("displayName", { length: 191 }),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`),
    approvedAt: datetime("approvedAt"),
    seenOnStreamAt: datetime("seenOnStreamAt"),
    seenOnStream: int("seenOnStream").default(0),
  },
  (showAndTellEntryTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(showAndTellEntryTable.id),
    userIdIndex: uniqueIndex("ShowAndTellEntry_userId_key").on(
      showAndTellEntryTable.userId
    ),
  })
);

export type ShowAndTellEntryAttachment = InferModel<
  typeof showAndTellEntryAttachments,
  "select"
>;

export const showAndTellEntryAttachments = mysqlTable(
  "ShowAndTellEntryAttachment",
  {
    id: varchar("id", { length: 191 }).notNull(),
    entryId: varchar("entryId", { length: 191 }).notNull(),
    attachmentType: varchar("attachmentType", { length: 191 }).notNull(),
    linkAttachmentId: varchar("linkAttachmentId", { length: 191 }),
    imageAttachmentId: varchar("imageAttachmentId", { length: 191 }),
  },
  (showAndTellEntryAttachmentTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(showAndTellEntryAttachmentTable.id),
    entryIdIndex: uniqueIndex("ShowAndTellEntryAttachment_entryId_key").on(
      showAndTellEntryAttachmentTable.entryId
    ),
  })
);

export type FileStorageObject = InferModel<typeof fileStorageObjects, "select">;

export const fileStorageObjects = mysqlTable(
  "FileStorageObject",
  {
    id: varchar("id", { length: 191 }).notNull(),
    key: varchar("key", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    prefix: varchar("prefix", { length: 191 }).notNull(),
    acl: varchar("acl", { length: 191 }).notNull(),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    uploadedAt: datetime("uploadedAt"),
    deletedAt: datetime("deletedAt"),
    expiresAt: datetime("expiresAt"),
  },
  (fileStorageObjectTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(fileStorageObjectTable.id),
    keyIndex: uniqueIndex("FileStorageObject_key_key").on(
      fileStorageObjectTable.key
    ),
  })
);

export type ImageMetadata = InferModel<typeof imageMetadata, "select">;

export const imageMetadata = mysqlTable(
  "ImageMetadata",
  {
    mimeType: varchar("mimeType", { length: 191 }).notNull(),
    width: int("width").notNull(),
    height: int("height").notNull(),
    fileStorageObjectId: varchar("fileStorageObjectId", {
      length: 191,
    }).notNull(),
  },
  (imageMetadataTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(
      imageMetadataTable.fileStorageObjectId
    ),
  })
);

export type ImageAttachment = InferModel<typeof imageAttachments, "select">;

export const imageAttachments = mysqlTable(
  "ImageAttachment",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    alternativeText: varchar("alternativeText", { length: 191 }).notNull(),
    caption: varchar("caption", { length: 191 }).notNull(),
    description: varchar("description", { length: 191 }).notNull(),
    url: varchar("url", { length: 191 }).notNull(),
    fileStorageObjectId: varchar("fileStorageObjectId", {
      length: 191,
    }).notNull(),
  },
  (imageAttachmentTable) => ({
    primaryIndex: uniqueIndex("PRIMARY").on(imageAttachmentTable.id),
    fileStorageObjectIdIndex: uniqueIndex(
      "ImageAttachment_fileStorageObjectId_key"
    ).on(imageAttachmentTable.fileStorageObjectId),
  })
);
