import { useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";
import {
  PARTIAL_DONATION_MIN_CENTS,
  PARTIAL_DONATION_QUICK_PICKS,
  formatPrice,
  formatPriceExact,
  partialDonationAmount,
} from "@/utils/wishlist";

import Button from "@/components/content/Button";
import { MessageBox } from "@/components/shared/MessageBox";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button as FormButton,
  approveButtonClasses,
} from "@/components/shared/form/Button";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { TextField } from "@/components/shared/form/TextField";

import IconPayPal from "@/icons/IconPayPal";

import WishlistFundsNote from "./WishlistFundsNote";

interface Props {
  itemId: string;
  itemTitle: string;
  // Set for products donated at their full price
  priceCents: number | null;
  // Set for items that allow partial donations (chip in)
  remainingCents?: number | null;
}

const MESSAGE_MAX_LENGTH = 500;

export default function WishlistDonateButton({
  itemId,
  itemTitle,
  priceCents: pagePriceCents,
  remainingCents: pageRemainingCents = null,
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    pageRemainingCents != null
      ? (
          Math.min(PARTIAL_DONATION_MIN_CENTS * 2, pageRemainingCents) / 100
        ).toFixed(2)
      : "10.00",
  );

  // The page may have been open for a while, so the dialog checks the item
  // again, falling back to the page's values until (or unless) that succeeds
  const latest = trpc.wishlist.getDonationOptions.useQuery(
    { id: itemId },
    { enabled: open },
  );
  const options = latest.data;
  const priceCents = options?.available ? options.priceCents : pagePriceCents;
  const remainingCents = options?.available
    ? options.remainingCents
    : pageRemainingCents;

  const isPartial = remainingCents != null;
  const isFixed = !isPartial && priceCents != null;
  const remainingDollars = isPartial ? (remainingCents / 100).toFixed(2) : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const createOrder = trpc.wishlist.createDonateOrder.useMutation();

  const validateEmail = (val: string) => {
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleDonate = async () => {
    if (emailError) return;
    try {
      const result = await createOrder.mutateAsync({
        wishlistItemId: itemId,
        amount: isFixed ? priceCents / 100 : parseFloat(amount),
        donorName: name || undefined,
        donorEmail: email || undefined,
        donorMessage: message || undefined,
      });
      window.location.href = result.approvalUrl;
    } catch (err) {
      console.error("Failed to create PayPal order:", err);
    }
  };

  const amountNum = parseFloat(amount);
  const partialCheck = isPartial
    ? partialDonationAmount(remainingCents).safeParse(amountNum)
    : null;
  const amountError =
    partialCheck && !partialCheck.success && amount !== ""
      ? (partialCheck.error.issues[0]?.message ?? "Enter a valid amount")
      : "";
  const isValidAmount =
    isFixed ||
    (partialCheck ? partialCheck.success : !isNaN(amountNum) && amountNum >= 1);
  const presets = isPartial
    ? PARTIAL_DONATION_QUICK_PICKS.filter(
        (dollars) => dollars * 100 < remainingCents,
      )
        .sort((a, b) => a - b)
        .map((dollars) => dollars.toFixed(2))
    : ["5.00", "10.00", "25.00", "50.00"];
  const presetLabel = (preset: string) =>
    isPartial ? formatPrice(Math.round(Number(preset) * 100)) : `$${preset}`;
  const presetClasses = (selected: boolean) =>
    classes(
      "rounded-full border-2 border-alveus-green px-3 py-1 text-sm font-semibold transition-colors",
      selected
        ? "bg-alveus-green text-alveus-tan"
        : "text-alveus-green hover:bg-alveus-green hover:text-alveus-tan",
    );

  return (
    <>
      <Button
        as="button"
        type="button"
        filled
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 text-base"
        aria-label={
          isPartial
            ? `Chip in toward ${itemTitle} with PayPal`
            : `Donate toward ${itemTitle} with PayPal`
        }
      >
        <IconPayPal className="size-5" />
        {isPartial ? "Chip in" : "Donate with PayPal"}
      </Button>

      <ModalDialog
        title={
          isPartial
            ? `Chip in toward ${itemTitle}`
            : `Donate toward ${itemTitle}`
        }
        isOpen={open}
        closeModal={() => setOpen(false)}
        closeLabel="Cancel"
      >
        {options && !options.available ? (
          <MessageBox variant="warning">
            <p>{options.reason}.</p>
            <p>Reload the page to see the latest wishlist.</p>
          </MessageBox>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleDonate();
            }}
          >
            <p className="text-sm text-gray-600">
              {isPartial
                ? `Chip in any amount from ${formatPrice(Math.min(PARTIAL_DONATION_MIN_CENTS, remainingCents))} through PayPal. ${formatPrice(remainingCents)} is left to raise.`
                : "Your donation goes to Alveus through PayPal."}
            </p>

            {isFixed ? (
              <div>
                <p>Amount (USD)</p>
                <p className="text-xl font-semibold">
                  {formatPriceExact(priceCents)}
                </p>
              </div>
            ) : (
              <>
                <TextField
                  label="Amount (USD)"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(value) => setAmount(value)}
                  prefix={<span className="pl-2 text-sm text-gray-500">$</span>}
                  isRequired
                  isInvalid={!!amountError}
                  aria-describedby={
                    amountError ? "wishlist-amount-error" : undefined
                  }
                />
                {amountError && (
                  <p
                    id="wishlist-amount-error"
                    className="-mt-2 text-sm text-red-700"
                  >
                    {amountError}
                  </p>
                )}

                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Suggested amounts"
                >
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={amount === preset}
                      onClick={() => setAmount(preset)}
                      className={presetClasses(amount === preset)}
                    >
                      {presetLabel(preset)}
                    </button>
                  ))}
                  {isPartial && (
                    <button
                      type="button"
                      aria-pressed={amount === remainingDollars}
                      onClick={() => setAmount(remainingDollars)}
                      className={presetClasses(amount === remainingDollars)}
                    >
                      {`Fund the rest (${formatPrice(remainingCents)})`}
                    </button>
                  )}
                </div>
              </>
            )}

            <TextField
              label="Your name (optional, may be shown on stream)"
              name="name"
              value={name}
              onChange={(value) => setName(value)}
              maxLength={100}
            />

            <div>
              <TextField
                label="Email for receipt (optional)"
                name="email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  validateEmail(value);
                }}
                isInvalid={!!emailError}
                aria-describedby={
                  emailError ? "wishlist-email-error" : undefined
                }
              />
              {emailError && (
                <p
                  id="wishlist-email-error"
                  className="mt-1 text-sm text-red-700"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <TextAreaField
                label="Leave a message (optional, may be read on stream)"
                name="message"
                value={message}
                onChange={(value) =>
                  setMessage(value.slice(0, MESSAGE_MAX_LENGTH))
                }
                maxLength={MESSAGE_MAX_LENGTH}
                inputClassName="min-h-20"
              />
              <p className="text-right text-sm text-gray-500">
                {message.length}/{MESSAGE_MAX_LENGTH}
              </p>
            </div>

            {createOrder.error && (
              <MessageBox variant="failure">
                <p>Failed to start the payment. Please try again.</p>
                <ProcedureErrorMessage error={createOrder.error} />
              </MessageBox>
            )}

            <FormButton
              type="submit"
              className={approveButtonClasses}
              disabled={
                !isValidAmount ||
                !!emailError ||
                createOrder.isPending ||
                latest.isFetching
              }
            >
              <IconPayPal className="size-4" />
              {createOrder.isPending
                ? "Redirecting to PayPal …"
                : isFixed
                  ? `Donate ${formatPriceExact(priceCents)} with PayPal`
                  : isValidAmount
                    ? `Donate ${isPartial ? formatPriceExact(Math.round(amountNum * 100)) : `$${amountNum.toFixed(2)}`} with PayPal`
                    : "Donate with PayPal"}
            </FormButton>
            <WishlistFundsNote className="border-t border-gray-200 pt-3 text-gray-600" />
          </form>
        )}
      </ModalDialog>
    </>
  );
}
