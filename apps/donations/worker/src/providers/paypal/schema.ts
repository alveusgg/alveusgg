import { z } from "zod";

// key_value+key2_value2
const Tags = z.string().transform((val) => {
  const keyValuePairs = val.split("+");
  return keyValuePairs.reduce(
    (output, pair) => {
      const [key, value] = pair.split("_");
      output[key] = value;
      return output;
    },
    {} as Record<string, string>,
  );
});

export const PaypalDonationSchema = ({
  expectedBusinessEmailAddress,
}: {
  expectedBusinessEmailAddress: string;
}) =>
  z.object({
    mc_gross: z.string(),
    mc_fee: z.string(),
    payment_status: z.literal("Completed"),
    charset: z.literal("UTF-8"),

    first_name: z.string(),
    last_name: z.string(),
    custom: Tags.optional(),
    business: z.literal(expectedBusinessEmailAddress),
    payer_email: z.string(),
    memo: z.string().optional(),
    txn_id: z.string(),
    mc_currency: z.literal("USD"),
    payer_id: z.string(),
    payment_date: z.coerce.date(),
  });
