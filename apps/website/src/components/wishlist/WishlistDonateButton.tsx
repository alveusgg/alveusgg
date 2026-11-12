import { useState } from "react";

import {
  PARTIAL_DONATION_MIN_CENTS,
  PARTIAL_DONATION_QUICK_PICKS,
  WISHLIST_FUNDS_NOTE,
  partialDonationAmount,
} from "@/data/wishlist";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

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

interface Props {
  itemId: string;
  itemTitle: string;
  suggestedAmount: string | null; // e.g. "$29.99"
  // Set for items that allow partial donations (chip in)
  remainingCents?: number | null;
}

function parseDollars(raw: string | null): string {
  if (!raw) return "";
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? "" : n.toFixed(2);
}

const MESSAGE_MAX_LENGTH = 500;

export default function WishlistDonateButton({
  itemId,
  itemTitle,
  suggestedAmount,
  remainingCents = null,
}: Props) {
  const isPartial = remainingCents != null;
  const remainingDollars = isPartial ? (remainingCents / 100).toFixed(2) : "";
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    isPartial
      ? (
          Math.min(PARTIAL_DONATION_MIN_CENTS * 2, remainingCents) / 100
        ).toFixed(2)
      : parseDollars(suggestedAmount) || "10.00",
  );
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
        amount: parseFloat(amount),
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
  const isValidAmount = partialCheck
    ? partialCheck.success
    : !isNaN(amountNum) && amountNum >= 1;
  const presets = isPartial
    ? PARTIAL_DONATION_QUICK_PICKS.filter(
        (dollars) => dollars * 100 < remainingCents,
      ).map((dollars) => dollars.toFixed(2))
    : [
        ...new Set([
          "5.00",
          "10.00",
          parseDollars(suggestedAmount) || "25.00",
          "50.00",
        ]),
      ];
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
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleDonate();
          }}
        >
          <p className="text-sm text-gray-600">
            {isPartial
              ? `Chip in any amount from $${(Math.min(PARTIAL_DONATION_MIN_CENTS, remainingCents) / 100).toFixed(2)} through PayPal. $${remainingDollars} is left to raise, and Alveus buys the item once it is fully funded.`
              : "Your donation goes to Alveus through PayPal. Alveus buys the item and has it shipped to the sanctuary."}
          </p>

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
            aria-describedby={amountError ? "wishlist-amount-error" : undefined}
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
                ${preset}
              </button>
            ))}
            {isPartial && (
              <button
                type="button"
                aria-pressed={amount === remainingDollars}
                onClick={() => setAmount(remainingDollars)}
                className={presetClasses(amount === remainingDollars)}
              >
                {`Fund the rest ($${remainingDollars})`}
              </button>
            )}
          </div>

          {isPartial && (
            <p className="text-sm text-gray-600">{WISHLIST_FUNDS_NOTE}</p>
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
              aria-describedby={emailError ? "wishlist-email-error" : undefined}
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
            disabled={!isValidAmount || !!emailError || createOrder.isPending}
          >
            <IconPayPal className="size-4" />
            {createOrder.isPending
              ? "Redirecting to PayPal …"
              : isValidAmount
                ? `Donate $${amountNum.toFixed(2)} with PayPal`
                : "Donate with PayPal"}
          </FormButton>
        </form>
      </ModalDialog>
    </>
  );
}
