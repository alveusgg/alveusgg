export const loginProviders = {
  twitch: "Twitch",
  google: "Google",
  discord: "Discord",
} as const;
export type LoginProvider = keyof typeof loginProviders;
export const isLoginProvider = (value: string): value is LoginProvider =>
  Object.hasOwn(loginProviders, value);

export const ACCOUNT_SETTINGS_PATH = "/account/connections";
