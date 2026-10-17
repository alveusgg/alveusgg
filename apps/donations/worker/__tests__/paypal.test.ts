import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/cloudflare";
import { PaypalDonationProvider } from "../src/providers/paypal/paypal";
import { PaypalVerificationURL } from "../src/providers/paypal/const";
import type { DonationStorage } from "../src/providers/storage";

vi.mock("@sentry/cloudflare", () => ({
  captureException: vi.fn(),
  withScope: (
    callback: (scope: { setTag: () => void; setContext: () => void }) => void,
  ) => callback({ setTag: vi.fn(), setContext: vi.fn() }),
}));

const business = "donate@alveussanctuary.org";

const completedIpn = {
  mc_gross: "25.00",
  mc_fee: "1.17",
  payment_status: "Completed",
  charset: "UTF-8",
  first_name: "Ada",
  last_name: "Lovelace",
  custom: "campaign_wolf",
  business,
  payer_email: " Ada@Example.com ",
  txn_id: "9AB12345CD678901E",
  txn_type: "web_accept",
  mc_currency: "USD",
  payer_id: "PAYER123",
  payment_date: "10:22:33 Oct 16, 2026 PDT",
};

const fetchMock = vi.fn<typeof fetch>();
const add = vi.fn<DonationStorage["add"]>(async () => 1);

async function makeProvider() {
  return PaypalDonationProvider.init(
    { add, config: { get: vi.fn(), set: vi.fn() } },
    { SANDBOX: "false", PAYPAL_BUSINESS_EMAIL: business } as Env,
  );
}

function ipn(fields: Record<string, string>) {
  return new Request("https://donations/paypal/live", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockImplementation(async () => new Response("VERIFIED"));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PayPal IPN handling", () => {
  it("verifies and stores completed donations", async () => {
    const provider = await makeProvider();
    const request = ipn(completedIpn);
    const raw = await request.clone().text();

    const response = await provider.handle(request);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      PaypalVerificationURL,
      expect.objectContaining({ body: `cmd=_notify-validate&${raw}` }),
    );
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "paypal",
        providerUniqueId: completedIpn.txn_id,
        amount: 2500,
        donatedBy: expect.objectContaining({ email: "ada@example.com" }),
        tags: { campaign: "wolf" },
      }),
    );
  });

  it("rejects notifications PayPal does not verify", async () => {
    fetchMock.mockImplementation(async () => new Response("INVALID"));
    const provider = await makeProvider();

    const response = await provider.handle(ipn(completedIpn));

    expect(response.status).toBe(400);
    expect(add).not.toHaveBeenCalled();
  });

  it("asks PayPal to retry when verification is unavailable", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network error"));
    fetchMock.mockResolvedValueOnce(new Response("", { status: 502 }));
    const provider = await makeProvider();

    expect((await provider.handle(ipn(completedIpn))).status).toBe(503);
    expect((await provider.handle(ipn(completedIpn))).status).toBe(503);
    expect(add).not.toHaveBeenCalled();
  });

  it("acknowledges pending payments without a fee", async () => {
    const { mc_fee: _, ...pending } = completedIpn;
    const provider = await makeProvider();

    const response = await provider.handle(
      ipn({ ...pending, payment_status: "Pending", pending_reason: "echeck" }),
    );

    expect(response.status).toBe(200);
    expect(add).not.toHaveBeenCalled();
  });

  it("acknowledges subscription notifications without payment fields", async () => {
    const provider = await makeProvider();

    const response = await provider.handle(
      ipn({
        txn_type: "subscr_signup",
        business,
        charset: "UTF-8",
        subscr_id: "I-ABC123",
        payer_email: "ada@example.com",
      }),
    );

    expect(response.status).toBe(200);
    expect(add).not.toHaveBeenCalled();
  });

  it("acknowledges and reports completed payments it cannot parse", async () => {
    const provider = await makeProvider();

    const responses = await Promise.all([
      provider.handle(ipn({ ...completedIpn, mc_currency: "EUR" })),
      provider.handle(ipn({ ...completedIpn, mc_gross: "25" })),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(add).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
  });
});
