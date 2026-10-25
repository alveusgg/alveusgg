import { isLoginProvider, loginProviders } from "@/data/auth";

export function getAccountLabel(account: {
  provider: string;
  providerAccountId: string;
  username: string | null;
  displayName: string | null;
}) {
  const provider = isLoginProvider(account.provider)
    ? loginProviders[account.provider]
    : account.provider;
  const name = account.username
    ? `@${account.username}`
    : account.displayName || `ID ${account.providerAccountId}`;
  return `${provider}: ${name}`;
}
