import { sql } from "drizzle-orm";
import {
  char,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const accountTable = mysqlTable(
  "Account",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: int("expires_at"),
    tokenType: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 191 }),
  },
  (table) => {
    return {
      userId: index("Account_userId").on(table.userId),
      accountId: primaryKey(table.id),
      accountProviderProviderAccountIdKey: unique(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export const channelUpdateEventTable = mysqlTable(
  "ChannelUpdateEvent",
  {
    id: varchar("id", { length: 191 }).notNull(),
    service: varchar("service", { length: 191 }).notNull(),
    channel: varchar("channel", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    categoryId: varchar("category_id", { length: 191 }).notNull(),
    categoryName: varchar("category_name", { length: 191 }).notNull(),
    source: varchar("source", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      channelUpdateEventId: primaryKey(table.id),
    };
  },
);

export const clientAccessTokenTable = mysqlTable(
  "ClientAccessToken",
  {
    service: varchar("service", { length: 191 }).notNull(),
    clientId: varchar("client_id", { length: 191 }).notNull(),
    accessToken: varchar("access_token", { length: 191 }).notNull(),
    refreshToken: varchar("refresh_token", { length: 191 }),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
    expiresAt: datetime("expiresAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      clientAccessTokenServiceClientIdKey: unique(
        "ClientAccessToken_service_client_id_key",
      ).on(table.service, table.clientId),
    };
  },
);

export const fileStorageObjectTable = mysqlTable(
  "FileStorageObject",
  {
    id: varchar("id", { length: 191 }).notNull(),
    key: varchar("key", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    prefix: varchar("prefix", { length: 191 }).notNull(),
    acl: varchar("acl", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    uploadedAt: datetime("uploadedAt", { mode: "string", fsp: 3 }),
    deletedAt: datetime("deletedAt", { mode: "string", fsp: 3 }),
    expiresAt: datetime("expiresAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      fileStorageObjectId: primaryKey(table.id),
      fileStorageObjectKeyKey: unique("FileStorageObject_key_key").on(
        table.key,
      ),
    };
  },
);

export const formTable = mysqlTable(
  "Form",
  {
    id: varchar("id", { length: 191 }).notNull(),
    label: varchar("label", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }),
    active: tinyint("active").default(0).notNull(),
    startAt: datetime("startAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    endAt: datetime("endAt", { mode: "string", fsp: 3 }),
    outgoingWebhookUrl: varchar("outgoingWebhookUrl", { length: 720 }),
    showInLists: tinyint("showInLists").default(1).notNull(),
    config: text("config").notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      formId: primaryKey(table.id),
      formSlugKey: unique("Form_slug_key").on(table.slug),
    };
  },
);

export const formEntryTable = mysqlTable(
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
    salt: char("salt", { length: 32 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
    allowMarketingEmails: tinyint("allowMarketingEmails").default(0).notNull(),
  },
  (table) => {
    return {
      userId: index("FormEntry_userId").on(table.userId),
      formEntryId: primaryKey(table.id),
      formEntryFormIdUserIdKey: unique("FormEntry_formId_userId_key").on(
        table.formId,
        table.userId,
      ),
      formEntryMailingAddressIdKey: unique("FormEntry_mailingAddressId_key").on(
        table.mailingAddressId,
      ),
      formEntryOutgoingWebhookIdKey: unique(
        "FormEntry_outgoingWebhookId_key",
      ).on(table.outgoingWebhookId),
    };
  },
);

export const imageAttachmentTable = mysqlTable(
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
  (table) => {
    return {
      imageAttachmentId: primaryKey(table.id),
      imageAttachmentFileStorageObjectIdKey: unique(
        "ImageAttachment_fileStorageObjectId_key",
      ).on(table.fileStorageObjectId),
    };
  },
);

export const imageMetadataTable = mysqlTable(
  "ImageMetadata",
  {
    mimeType: varchar("mimeType", { length: 191 }).notNull(),
    width: int("width").notNull(),
    height: int("height").notNull(),
    fileStorageObjectId: varchar("fileStorageObjectId", {
      length: 191,
    }).notNull(),
  },
  (table) => {
    return {
      imageMetadataFileStorageObjectIdKey: unique(
        "ImageMetadata_fileStorageObjectId_key",
      ).on(table.fileStorageObjectId),
    };
  },
);

export const linkAttachmentTable = mysqlTable(
  "LinkAttachment",
  {
    id: varchar("id", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    alternativeText: varchar("alternativeText", { length: 191 }).notNull(),
    caption: varchar("caption", { length: 191 }).notNull(),
    description: varchar("description", { length: 191 }).notNull(),
    url: varchar("url", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      linkAttachmentId: primaryKey(table.id),
    };
  },
);

export const mailingAddressTable = mysqlTable(
  "MailingAddress",
  {
    id: varchar("id", { length: 191 }).notNull(),
    country: varchar("country", { length: 191 }).notNull(),
    addressLine1: varchar("addressLine1", { length: 191 }).notNull(),
    addressLine2: varchar("addressLine2", { length: 191 }).notNull(),
    city: varchar("city", { length: 191 }).notNull(),
    state: varchar("state", { length: 191 }).notNull(),
    postalCode: varchar("postalCode", { length: 191 }).notNull(),
    salt: char("salt", { length: 32 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      mailingAddressId: primaryKey(table.id),
    };
  },
);

export const notificationTable = mysqlTable(
  "Notification",
  {
    id: varchar("id", { length: 191 }).notNull(),
    message: varchar("message", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    expiresAt: datetime("expiresAt", { mode: "string", fsp: 3 }).notNull(),
    canceledAt: datetime("canceledAt", { mode: "string", fsp: 3 }),
    scheduledStartAt: datetime("scheduledStartAt", { mode: "string", fsp: 3 }),
    scheduledEndAt: datetime("scheduledEndAt", { mode: "string", fsp: 3 }),
    title: varchar("title", { length: 191 }),
    linkUrl: varchar("linkUrl", { length: 191 }),
    imageUrl: varchar("imageUrl", { length: 191 }),
    tag: varchar("tag", { length: 191 }),
    urgency: mysqlEnum("urgency", ["VERY_LOW", "LOW", "NORMAL", "HIGH"])
      .default("NORMAL")
      .notNull(),
    isPush: tinyint("isPush").default(0).notNull(),
    isDiscord: tinyint("isDiscord").default(0).notNull(),
  },
  (table) => {
    return {
      notificationId: primaryKey(table.id),
    };
  },
);

export const notificationDiscordChannelWebhookTable = mysqlTable(
  "NotificationDiscordChannelWebhook",
  {
    notificationId: varchar("notificationId", { length: 191 }).notNull(),
    outgoingWebhookId: varchar("outgoingWebhookId", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      notificationDiscordChannelWebhookNotificationIdOutgoingWebKey: unique(
        "NotificationDiscordChannelWebhook_notificationId_outgoingWeb_key",
      ).on(table.notificationId, table.outgoingWebhookId),
      notificationDiscordChannelWebhookOutgoingWebhookIdKey: unique(
        "NotificationDiscordChannelWebhook_outgoingWebhookId_key",
      ).on(table.outgoingWebhookId),
    };
  },
);

export const notificationPushTable = mysqlTable(
  "NotificationPush",
  {
    notificationId: varchar("notificationId", { length: 191 }).notNull(),
    subscriptionId: varchar("subscriptionId", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    processingStatus: mysqlEnum("processingStatus", [
      "PENDING",
      "IN_PROGRESS",
      "DONE",
    ])
      .default("PENDING")
      .notNull(),
    attempts: int("attempts"),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    expiresAt: datetime("expiresAt", { mode: "string", fsp: 3 }).notNull(),
    clickedAt: datetime("clickedAt", { mode: "string", fsp: 3 }),
    failedAt: datetime("failedAt", { mode: "string", fsp: 3 }),
    deliveredAt: datetime("deliveredAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      userId: index("NotificationPush_userId").on(table.userId),
      processingStatus: index("NotificationPush_processingStatus").on(
        table.processingStatus,
      ),
      subscriptionId: index("NotificationPush_subscriptionId").on(
        table.subscriptionId,
      ),
      notificationPushNotificationIdSubscriptionIdKey: unique(
        "NotificationPush_notificationId_subscriptionId_key",
      ).on(table.notificationId, table.subscriptionId),
    };
  },
);

export const outgoingWebhookTable = mysqlTable(
  "OutgoingWebhook",
  {
    id: varchar("id", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    url: varchar("url", { length: 720 }).notNull(),
    body: text("body").notNull(),
    userId: varchar("userId", { length: 191 }),
    retry: tinyint("retry").default(0).notNull(),
    attempts: int("attempts"),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    failedAt: datetime("failedAt", { mode: "string", fsp: 3 }),
    deliveredAt: datetime("deliveredAt", { mode: "string", fsp: 3 }),
    expiresAt: datetime("expiresAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      userId: index("OutgoingWebhook_userId").on(table.userId),
      outgoingWebhookId: primaryKey(table.id),
    };
  },
);

export const pushSubscriptionTable = mysqlTable(
  "PushSubscription",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    endpoint: varchar("endpoint", { length: 720 }).notNull(),
    p256Dh: varchar("p256dh", { length: 191 }),
    auth: varchar("auth", { length: 191 }),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
    deletedAt: datetime("deletedAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      userId: index("PushSubscription_userId").on(table.userId),
      pushSubscriptionId: primaryKey(table.id),
      pushSubscriptionEndpointKey: unique("PushSubscription_endpoint_key").on(
        table.endpoint,
      ),
    };
  },
);

export const pushSubscriptionTagTable = mysqlTable(
  "PushSubscriptionTag",
  {
    subscriptionId: varchar("subscriptionId", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    value: varchar("value", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      pushSubscriptionTagSubscriptionIdNameKey: unique(
        "PushSubscriptionTag_subscriptionId_name_key",
      ).on(table.subscriptionId, table.name),
    };
  },
);

export const sessionTable = mysqlTable(
  "Session",
  {
    id: varchar("id", { length: 191 }).notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      userId: index("Session_userId").on(table.userId),
      sessionId: primaryKey(table.id),
      sessionSessionTokenKey: unique("Session_sessionToken_key").on(
        table.sessionToken,
      ),
    };
  },
);

export const showAndTellEntryTable = mysqlTable(
  "ShowAndTellEntry",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }),
    title: varchar("title", { length: 191 }).notNull(),
    text: text("text").notNull(),
    displayName: varchar("displayName", { length: 191 }),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    approvedAt: datetime("approvedAt", { mode: "string", fsp: 3 }),
    seenOnStreamAt: datetime("seenOnStreamAt", { mode: "string", fsp: 3 }),
    seenOnStream: tinyint("seenOnStream").default(0).notNull(),
  },
  (table) => {
    return {
      userId: index("ShowAndTellEntry_userId").on(table.userId),
      showAndTellEntryId: primaryKey(table.id),
    };
  },
);

export const showAndTellEntryAttachmentTable = mysqlTable(
  "ShowAndTellEntryAttachment",
  {
    id: varchar("id", { length: 191 }).notNull(),
    entryId: varchar("entryId", { length: 191 }).notNull(),
    attachmentType: varchar("attachmentType", { length: 191 }).notNull(),
    linkAttachmentId: varchar("linkAttachmentId", { length: 191 }),
    imageAttachmentId: varchar("imageAttachmentId", { length: 191 }),
  },
  (table) => {
    return {
      entryId: index("ShowAndTellEntryAttachment_entryId").on(table.entryId),
      showAndTellEntryAttachmentId: primaryKey(table.id),
      showAndTellEntryAttachmentLinkAttachmentIdKey: unique(
        "ShowAndTellEntryAttachment_linkAttachmentId_key",
      ).on(table.linkAttachmentId),
      showAndTellEntryAttachmentImageAttachmentIdKey: unique(
        "ShowAndTellEntryAttachment_imageAttachmentId_key",
      ).on(table.imageAttachmentId),
    };
  },
);

export const streamStatusEventTable = mysqlTable(
  "StreamStatusEvent",
  {
    id: varchar("id", { length: 191 }).notNull(),
    service: varchar("service", { length: 191 }).notNull(),
    channel: varchar("channel", { length: 191 }).notNull(),
    online: tinyint("online").notNull(),
    source: varchar("source", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    startedAt: datetime("startedAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      streamStatusEventId: primaryKey(table.id),
    };
  },
);

export const taskExecutionEventTable = mysqlTable(
  "TaskExecutionEvent",
  {
    id: varchar("id", { length: 191 }).notNull(),
    task: varchar("task", { length: 191 }).notNull(),
    startedAt: datetime("startedAt", { mode: "string", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    finishedAt: datetime("finishedAt", { mode: "string", fsp: 3 }),
  },
  (table) => {
    return {
      taskExecutionEventId: primaryKey(table.id),
    };
  },
);

export const twitchChannelTable = mysqlTable(
  "TwitchChannel",
  {
    channelId: varchar("channelId", { length: 191 }).notNull(),
    username: varchar("username", { length: 191 }).notNull(),
    label: varchar("label", { length: 191 }).notNull(),
    broadcasterAccountId: varchar("broadcasterAccountId", { length: 191 }),
    moderatorAccountId: varchar("moderatorAccountId", { length: 191 }),
  },
  (table) => {
    return {
      // twitchChannelId: primaryKey(table.id),
      twitchChannelId: primaryKey(table.channelId),
    };
  },
);

export const userTable = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }),
    emailVerified: datetime("emailVerified", { mode: "string", fsp: 3 }),
    image: varchar("image", { length: 191 }),
    name: varchar("name", { length: 191 }),
  },
  (table) => {
    return {
      userId: primaryKey(table.id),
      userEmailKey: unique("User_email_key").on(table.email),
    };
  },
);

export const userRoleTable = mysqlTable(
  "UserRole",
  {
    id: varchar("id", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    role: varchar("role", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      userRoleId: primaryKey(table.id),
      userRoleUserIdRoleKey: unique("UserRole_userId_role_key").on(
        table.userId,
        table.role,
      ),
    };
  },
);

export const verificationTokenTable = mysqlTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      verificationTokenTokenKey: unique("VerificationToken_token_key").on(
        table.token,
      ),
      verificationTokenIdentifierTokenKey: unique(
        "VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
    };
  },
);
