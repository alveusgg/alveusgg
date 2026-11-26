import { beforeEach, describe, expect, test, vi } from "vitest";

import { prisma } from "@alveusgg/database";
import { createFieldEncryption } from "@alveusgg/database/encryption";

import { getAccountByProviderAccountId, updateAccessToken } from "@/db/users";

const config = vi.hoisted(() => ({
  enabled: false,
  keys: "k1:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
}));
vi.mock("@/env", () => ({
  env: {
    DATA_ENCRYPTION_KEYS: config.keys,
    get OAUTH_TOKEN_ENCRYPTION_ENABLED() {
      return config.enabled;
    },
  },
}));
vi.mock("@alveusgg/database", () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: "account" }),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  config.enabled = false;
});
const encryption = createFieldEncryption({ keys: config.keys });
const accessContext = { model: "Account", field: "access_token" };
const refreshContext = { model: "Account", field: "refresh_token" };

describe("staged token encryption", () => {
  test.each([false, true])(
    "reads both formats with encrypted writes %s",
    async (enabled) => {
      config.enabled = enabled;
      for (const encrypted of [false, true]) {
        vi.mocked(prisma.account.findFirst).mockResolvedValueOnce({
          access_token: encrypted
            ? await encryption.encrypt("access", accessContext)
            : "access",
          refresh_token: encrypted
            ? await encryption.encrypt("refresh", refreshContext)
            : "refresh",
          expires_at: null,
          scope: "chat:read",
        } as never);
        expect(
          await getAccountByProviderAccountId({ providerAccountId: "123" }),
        ).toMatchObject({ access_token: "access", refresh_token: "refresh" });
      }
    },
  );
  test.each([false, true])(
    "writes the deployment-compatible format with encryption %s",
    async (enabled) => {
      config.enabled = enabled;
      await updateAccessToken({
        providerAccountId: "123",
        newAccessToken: {
          userId: "123",
          accessToken: "new-access",
          refreshToken: "new-refresh",
          scope: [],
          expiresIn: 3600,
          obtainmentTimestamp: 0,
        },
      });
      const data = vi.mocked(prisma.account.update).mock.calls[0]![0].data;
      if (enabled) {
        expect(
          await encryption.decrypt(data.access_token as string, accessContext),
        ).toBe("new-access");
        expect(
          await encryption.decrypt(
            data.refresh_token as string,
            refreshContext,
          ),
        ).toBe("new-refresh");
      } else {
        expect(data.access_token).toBe("new-access");
        expect(data.refresh_token).toBe("new-refresh");
      }
    },
  );
});
