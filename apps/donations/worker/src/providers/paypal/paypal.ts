import type { PaypalDonation, Providers } from "@alveusgg/donations-core";
import * as Sentry from "@sentry/cloudflare";
import type { ZodError } from "zod";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import { PaypalVerificationURL, SandboxPaypalVerificationURL } from "./const";
import { PaypalDonationSchema } from "./schema";

// PayPal retries any non-2xx response for days and eventually disables IPN for
// the account, so verified notifications are always acknowledged. Anything we
// can't handle is reported to Sentry instead of being rejected.
function reportPaypalParseError(
  error: ZodError,
  context: { txnId?: string; txnType?: string; paymentStatus?: string },
) {
  Sentry.withScope((scope) => {
    scope.setTag("integration", "paypal");
    scope.setTag("error.kind", "schema-parse");
    scope.setContext("paypal", context);
    scope.setContext("zod", { issues: error.issues });
    Sentry.captureException(error);
  });
}

interface PaypalDonationProviderOptions {
  sandbox: boolean;
  expectedBusinessEmailAddress: string;
}

export class PaypalDonationProvider implements DonationProvider {
  name: Providers = "paypal";
  constructor(
    private options: PaypalDonationProviderOptions,
    private service: DonationStorage,
  ) {}

  static async init(
    service: DonationStorage,
    env: Env,
  ): Promise<PaypalDonationProvider> {
    const options: PaypalDonationProviderOptions = {
      sandbox: env.SANDBOX === "true",
      expectedBusinessEmailAddress: env.PAYPAL_BUSINESS_EMAIL!,
    };
    return new PaypalDonationProvider(options, service);
  }

  async handle(request: Request): Promise<Response> {
    const raw = await request.text();
    const params = new URLSearchParams(raw);
    // If the incoming request is a test, and we're not in sandbox fail out
    // Reject test IPNs in production
    const isTestIpn = params.get("test_ipn") === "1";
    if (isTestIpn && !this.options.sandbox) {
      return new Response("Test IPN not allowed in production", {
        status: 400,
      });
    }

    // Reject production IPNs in sandbox
    if (!isTestIpn && this.options.sandbox) {
      return new Response("Production IPN not allowed in sandbox", {
        status: 400,
      });
    }

    const verification = await verifyIpn(raw, this.options);
    if (verification === "unavailable") {
      // PayPal will retry later, which is what we want here.
      return new Response("IPN verification unavailable", { status: 503 });
    }
    if (verification !== "VERIFIED") {
      return new Response("Invalid IPN. Rejected.", { status: 400 });
    }

    // Check these before the full schema, since other notification types
    // (pending payments, refunds, subscriptions, ...) don't carry every field.
    if (params.get("business") !== this.options.expectedBusinessEmailAddress) {
      console.warn(`Valid IPN but business email address mismatch.`);
      return new Response(`Valid IPN but business email address mismatch.`, {
        status: 200,
      });
    }

    if (params.get("payment_status") !== "Completed") {
      console.warn(`Valid IPN but payment status is not Completed.`);
      return new Response(`Valid IPN but payment status is not Completed.`, {
        status: 200,
      });
    }

    const payload = PaypalDonationSchema.safeParse(
      Object.fromEntries(params.entries()),
    );
    if (!payload.success) {
      console.warn(`Valid IPN but parsing failed.`, payload.error.issues);
      reportPaypalParseError(payload.error, {
        txnId: params.get("txn_id") ?? undefined,
        txnType: params.get("txn_type") ?? undefined,
        paymentStatus: params.get("payment_status") ?? undefined,
      });
      return new Response(`Valid IPN but ignored.`, {
        status: 200,
      });
    }

    const amount = parseAmount(payload.data.mc_gross, ".", 2);

    const donation = {
      id: crypto.randomUUID(),
      provider: "paypal",
      providerUniqueId: payload.data.txn_id,
      amount: amount,
      donatedAt: payload.data.payment_date,
      receivedAt: new Date(),
      note: payload.data.memo,
      donatedBy: {
        primary: "firstName",
        email: payload.data.payer_email.trim().toLowerCase(),
        firstName: payload.data.first_name,
        lastName: payload.data.last_name,
      },
      tags: payload.data.custom ?? {},
      providerMetadata: {
        payerId: payload.data.payer_id,
      },
    } satisfies PaypalDonation;

    await this.service.add(donation);
    return new Response("OK", { status: 200 });
  }
}

async function verifyIpn(raw: string, { sandbox }: { sandbox: boolean }) {
  const url = sandbox ? SandboxPaypalVerificationURL : PaypalVerificationURL;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "cmd=_notify-validate&" + raw,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.warn(`IPN verification failed with status ${response.status}`);
      return "unavailable";
    }
    return (await response.text()).trim();
  } catch (error) {
    console.warn(`IPN verification request failed`, error);
    return "unavailable";
  }
}

function parseAmount(
  amount: string,
  separator: string,
  expectedDecimals: number,
) {
  const [whole, decimal] = amount.split(separator);
  if (decimal.length !== expectedDecimals) {
    throw new Error(
      `Invalid amount: ${amount} with separator ${separator} and expected decimals ${expectedDecimals}`,
    );
  }
  return parseInt(whole) * 100 + parseInt(decimal);
}
