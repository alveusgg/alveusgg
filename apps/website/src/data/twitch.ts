export const defaultScope =
  "openid user:read:email user:read:follows user:read:subscriptions";
export const botScope =
  "chat:edit chat:read moderator:read:followers channel:read:charity channel:read:subscriptions channel:read:vips";

export const scopeLabels: Record<string, string> = {
  // User
  openid: "OpenID",
  "user:read:email": "User Email (Read)",
  "user:read:follows": "User Follows (Read)",
  "user:read:subscriptions": "User Subscriptions (Read)",
  // Chat
  "chat:edit": "Chat (Edit)",
  "chat:read": "Chat (Read)",
  // Moderator
  "moderator:read:followers": "Moderator Followers (Read)",
  // Channel
  "channel:read:charity": "Channel Charity (Read)",
  "channel:read:subscriptions": "Channel Subscriptions (Read)",
  "channel:read:vips": "Channel VIPs (Read)",
};
