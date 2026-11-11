import { describe, expect, test, vi } from "vitest";

import {
  decryptFormEntryFields,
  decryptMailingAddressFields,
  encryptFormEntryFields,
  encryptMailingAddressFields,
  reencryptFormEntry,
  reencryptMailingAddress,
} from "@/server/db/form-entry-encryption";
import {
  getRedactUndeliveredBefore,
  getRedactedOutgoingWebhookBody,
  isRedactedOutgoingWebhookBody,
} from "@/server/outgoing-webhook-redaction";

vi.mock("@/env", () => ({
  env: {
    DATA_ENCRYPTION_KEYS: "k1:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    DATA_BLIND_INDEX_KEY: "YmxpbmQtaW5kZXgta2V5LWZvci10ZXN0cy0xMjM0NTY=",
    DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
  },
}));

const entry = {
  givenName: "Ada",
  familyName: "Lovelace",
  email: "ada@example.com",
};
const address = {
  addressLine1: "1 Main St",
  addressLine2: "",
  postalCode: "12345",
  city: "Town",
  state: "",
  country: "US",
};

// A value written by the v1 helpers (server/utils/encryption.ts) with this salt
const v1Salt = "tZyLgCOOYjRw4p3cjQQJXw==";
const v1Value = "jPNJft+LPw8ykfjEVdB7NAzCgKN/jx0d8gtoCV86yipx9gL4";

describe("form entry encryption", () => {
  test("writes v2 values without a salt", async () => {
    const data = await encryptFormEntryFields(entry);
    expect(data.salt).toBeNull();
    for (const key of ["givenName", "familyName", "email"] as const) {
      expect(data[key]).toMatch(/^v2\.k1\./);
    }
    expect(await decryptFormEntryFields(data)).toEqual({ ...data, ...entry });

    const addr = await encryptMailingAddressFields(address);
    expect(addr.salt).toBeNull();
    expect(addr.addressLine1).toMatch(/^v2\.k1\./);
    expect(await decryptMailingAddressFields(addr)).toEqual({
      ...addr,
      ...address,
    });
  });

  test("reads and re-encrypts v1 rows", async () => {
    const row = {
      givenName: v1Value,
      familyName: v1Value,
      email: "plain@example.com",
      salt: v1Salt,
    };
    expect(await decryptFormEntryFields(row)).toEqual({
      ...row,
      givenName: "John Doe",
      familyName: "John Doe",
    });
    const data = await reencryptFormEntry(row);
    expect(data?.salt).toBeNull();
    expect(data?.givenName).toMatch(/^v2\.k1\./);
    expect(await decryptFormEntryFields({ ...row, ...data })).toEqual({
      ...row,
      ...data,
      givenName: "John Doe",
      familyName: "John Doe",
      email: "plain@example.com",
    });

    const addr = {
      addressLine1: v1Value,
      addressLine2: v1Value,
      postalCode: v1Value,
      city: v1Value,
      state: v1Value,
      country: v1Value,
      salt: v1Salt,
    };
    const addrData = await reencryptMailingAddress(addr);
    expect(addrData?.salt).toBeNull();
    expect(addrData?.addressLine1).toMatch(/^v2\.k1\./);
    expect(
      (await decryptMailingAddressFields({ ...addr, ...addrData }))
        .addressLine1,
    ).toBe("John Doe");
  });

  test("binds values to their field", async () => {
    const data = await encryptFormEntryFields(entry);
    await expect(
      decryptFormEntryFields({
        ...data,
        givenName: data.familyName,
      }),
    ).rejects.toThrow();
  });

  test("reads a plaintext email next to v1/v2 names", async () => {
    const data = await encryptFormEntryFields(entry);
    const row = { ...data, email: "plain@example.com" };
    expect((await decryptFormEntryFields(row)).email).toBe("plain@example.com");
    const reencrypted = await reencryptFormEntry(row);
    expect(reencrypted?.email).toMatch(/^v2\.k1\./);
    expect(
      (await decryptFormEntryFields({ ...row, ...reencrypted })).email,
    ).toBe("plain@example.com");
  });

  test("keeps anonymized and missing values", async () => {
    const anonymized = {
      givenName: "",
      familyName: "",
      email: "",
      salt: "0123456789abcdef0123456789abcdef",
    };
    expect(await decryptFormEntryFields(anonymized)).toEqual(anonymized);
    expect(await reencryptFormEntry(anonymized)).toEqual({
      ...anonymized,
      salt: null,
    });
    expect(await reencryptFormEntry({ ...anonymized, email: null })).toEqual({
      ...anonymized,
      email: null,
      salt: null,
    });
    const blankAddress = {
      ...Object.fromEntries(Object.keys(address).map((field) => [field, ""])),
      salt: v1Salt,
    } as typeof address & { salt: string | null };
    expect(await reencryptMailingAddress(blankAddress)).toEqual({
      ...blankAddress,
      salt: null,
    });
    expect(
      await decryptFormEntryFields({ ...anonymized, email: null }),
    ).toEqual({ ...anonymized, email: null });
  });

  test("skips rows that are already v2", async () => {
    expect(
      await reencryptFormEntry(await encryptFormEntryFields(entry)),
    ).toBeNull();
    expect(
      await reencryptMailingAddress(await encryptMailingAddressFields(address)),
    ).toBeNull();
  });

  test("rejects a v1 looking row without a salt", async () => {
    await expect(
      decryptFormEntryFields({
        givenName: "not-encrypted",
        familyName: "",
        email: null,
        salt: null,
      }),
    ).rejects.toThrow();
  });
});

describe("webhook redaction", () => {
  test("redacts form entries only", () => {
    expect(JSON.parse(getRedactedOutgoingWebhookBody("form-entry")!)).toEqual({
      type: "form-entry",
      redacted: true,
    });
    expect(getRedactedOutgoingWebhookBody("discordChannel")).toBeUndefined();
  });
});

describe("webhook retention", () => {
  test("recognizes redacted bodies, so they aren't sent again", () => {
    const redacted = getRedactedOutgoingWebhookBody("form-entry")!;
    expect(isRedactedOutgoingWebhookBody("form-entry", redacted)).toBe(true);
    expect(
      isRedactedOutgoingWebhookBody("form-entry", '{"type":"form-entry"}'),
    ).toBe(false);
    expect(isRedactedOutgoingWebhookBody("unknown", redacted)).toBe(false);
  });

  test("undelivered webhooks are redacted after 30 days", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    expect(getRedactUndeliveredBefore(now)).toEqual(
      new Date("2026-10-01T12:00:00Z"),
    );
  });
});
