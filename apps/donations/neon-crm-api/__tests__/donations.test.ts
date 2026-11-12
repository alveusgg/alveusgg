import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PAYPAL_TENDER_TYPE,
  createDonation,
  findOrCreateAccount,
} from "../index";

const options = {
  organizationId: "example",
  apiKey: "example",
  baseUrl: "https://api.example.com/",
  localTimezone: "America/Chicago",
};

const searchResponse = (rows: Array<Record<string, string | number>>) =>
  Response.json({
    pagination: {
      currentPage: 0,
      pageSize: 1,
      totalPages: rows.length ? 1 : 0,
      totalResults: rows.length,
    },
    searchResults: rows,
  });

const requestBody = (fetch: ReturnType<typeof vi.fn>, call: number) =>
  JSON.parse(String(fetch.mock.calls[call]?.[1]?.body));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("findOrCreateAccount", () => {
  it("searches by email and reuses an existing account", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(searchResponse([{ "Account ID": 123 }]));
    vi.stubGlobal("fetch", fetch);

    const result = await findOrCreateAccount(options, {
      email: "donor@example.com",
      name: "Jane Donor",
    });

    expect(result).toEqual({ ok: true, data: { id: "123", created: false } });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/accounts/search",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "NEON-API-VERSION": "2.11" }),
      }),
    );
    expect(requestBody(fetch, 0)).toEqual({
      searchFields: [
        { field: "Email", operator: "EQUAL", value: "donor@example.com" },
      ],
      outputFields: ["Account ID"],
      pagination: { currentPage: 0, pageSize: 1 },
    });
  });

  it("creates an individual account when no account matches", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(Response.json({ id: "456" }));
    vi.stubGlobal("fetch", fetch);

    const result = await findOrCreateAccount(options, {
      email: "donor@example.com",
      name: "Jane Q Donor",
    });

    expect(result).toEqual({ ok: true, data: { id: "456", created: true } });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]?.[0]).toBe("https://api.example.com/accounts");
    expect(fetch.mock.calls[1]?.[1]?.method).toBe("POST");
    expect(requestBody(fetch, 1)).toEqual({
      individualAccount: {
        primaryContact: {
          firstName: "Jane Q",
          lastName: "Donor",
          email1: "donor@example.com",
        },
      },
    });
  });

  it("does not create an account when the search fails", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetch);

    const result = await findOrCreateAccount(options, {
      email: "donor@example.com",
    });

    expect(result.ok).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("createDonation", () => {
  it("posts a succeeded PayPal donation for the account", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json({ id: "789", accountId: "123", status: "Succeeded" }),
      );
    vi.stubGlobal("fetch", fetch);

    const result = await createDonation(options, {
      accountId: "123",
      amount: 25,
      date: "2026-11-07",
      payments: [
        {
          amount: 25,
          tenderType: PAYPAL_TENDER_TYPE,
          paymentStatus: "Succeeded",
          receivedDate: "2026-11-07",
          note: "PayPal capture ID: CAPTURE-1",
        },
      ],
    });

    expect(result).toEqual({ ok: true, data: { id: "789" } });
    expect(fetch.mock.calls[0]?.[0]).toBe("https://api.example.com/donations");
    expect(fetch.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(requestBody(fetch, 0)).toEqual({
      accountId: "123",
      amount: 25,
      date: "2026-11-07",
      payments: [
        {
          amount: 25,
          tenderType: 17,
          paymentStatus: "Succeeded",
          receivedDate: "2026-11-07",
          note: "PayPal capture ID: CAPTURE-1",
        },
      ],
    });
  });

  it("rejects a payment received date that is not a plain date", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = await createDonation(options, {
      accountId: "123",
      amount: 25,
      date: "2026-11-07",
      payments: [
        {
          amount: 25,
          tenderType: PAYPAL_TENDER_TYPE,
          paymentStatus: "Succeeded",
          receivedDate: "2026-11-07T12:00:00Z",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid input without calling Neon", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = await createDonation(options, {
      accountId: "123",
      amount: -1,
      date: "2026-11-07",
      payments: [],
    });

    expect(result.ok).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
