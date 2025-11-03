import type { PaypalDonation, Providers } from "@alveusgg/donations-core";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import { PaypalVerificationURL, SandboxPaypalVerificationURL } from "./const";
import { PaypalDonationSchema } from "./schema";

interface PaypalDonationProviderOptions {
  sandbox: boolean;
  schema: ReturnType<typeof PaypalDonationSchema>;
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
    const options = {
      sandbox: env.SANDBOX === "true",
      schema: PaypalDonationSchema({
        expectedBusinessEmailAddress: env.PAYPAL_BUSINESS_EMAIL,
      }),
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

    if (!(await isValidIpn(raw, this.options))) {
      return new Response("Invalid IPN. Rejected.", { status: 400 });
    }

    const payload = this.options.schema.safeParse(
      Object.fromEntries(params.entries()),
    );
    if (!payload.success) {
      return new Response(`Invalid IPN. Rejected. ${payload.error.message}`, {
        status: 400,
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

async function isValidIpn(raw: string, { sandbox }: { sandbox: boolean }) {
  const url = sandbox ? SandboxPaypalVerificationURL : PaypalVerificationURL;
  const request = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: raw + "&cmd=_notify-validate",
  });
  const text = await request.text();
  return text.trim() === "VERIFIED";
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
