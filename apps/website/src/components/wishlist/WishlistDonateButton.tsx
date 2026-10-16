import { useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { ModalDialog } from "@/components/shared/ModalDialog";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";

import IconPayPal from "@/icons/IconPayPal";

interface Props {
  itemId: string;
  itemTitle: string;
  suggestedAmount: string | null; // e.g. "$29.99"
}

function parseDollars(raw: string | null): string {
  if (!raw) return "";
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? "" : n.toFixed(2);
}

export default function WishlistDonateButton({ itemId, itemTitle, suggestedAmount }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(parseDollars(suggestedAmount) || "10.00");
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
  const isValidAmount = !isNaN(amountNum) && amountNum >= 1;
  const presets = [...new Set(["5.00", "10.00", parseDollars(suggestedAmount) || "25.00", "50.00"])];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white transition-colors"
        style={{ background: "#003087" }}
        aria-label={`Donate the value of ${itemTitle} via PayPal`}
      >
        <IconPayPal className="size-4" />
        Donate with PayPal
      </button>

      <ModalDialog
        title="Donate toward this item"
        isOpen={open}
        closeModal={() => setOpen(false)}
        closeLabel="Cancel"
      >
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Can&rsquo;t ship it? Donate the value and we&rsquo;ll purchase{" "}
          <span className="font-medium text-gray-700">{itemTitle}</span> ourselves.
        </p>

        <TextField
          label="Amount (USD)"
          name="amount"
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(value) => setAmount(value)}
          prefix={<span className="pl-2 text-gray-500 text-sm">$</span>}
        />

        <div className="flex gap-2 my-3 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={classes(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                amount === preset
                  ? "bg-blue-900 text-white border-blue-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50",
              )}
            >
              ${preset}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <TextField
            label="Your name (optional)"
            name="name"
            value={name}
            onChange={(value) => setName(value)}
            placeholder="Your name here"
          />
        </div>

        <div className="mb-1">
          <TextField
            label="Email for receipt (optional)"
            name="email"
            type="email"
            value={email}
            onChange={(value) => { setEmail(value); validateEmail(value); }}
            placeholder="you@example.com"
          />
        </div>
        {emailError && <p className="text-xs text-red-500 mb-2">{emailError}</p>}

        <div className="mb-3 mt-2">
          <label className="block text-sm text-gray-700 mb-1">
            Leave a message <span className="text-gray-400 font-normal">(optional — may be read on stream!)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="A note for the animals or the team..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Donations are logged to Neon CRM. A tax receipt will be emailed if you provide your address.
        </p>

        <Button
          type="button"
          className={defaultButtonClasses}
          disabled={!isValidAmount || !!emailError || createOrder.isLoading}
          onClick={() => void handleDonate()}
        >
          <IconPayPal className="size-4" />
          {createOrder.isLoading
            ? "Redirecting to PayPal…"
            : `Donate $${isValidAmount ? amountNum.toFixed(2) : "—"} with PayPal`}
        </Button>

        {createOrder.isError && (
          <p className="text-xs text-red-500 mt-2 text-center">Failed to start payment. Please try again.</p>
        )}
      </ModalDialog>
    </>
  );
}
