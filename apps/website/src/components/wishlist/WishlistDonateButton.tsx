/**
 * apps/website/src/components/wishlist/WishlistDonateButton.tsx
 *
 * "Donate monetary value" button shown on each wishlist card.
 * v2: now includes an optional personal message field — shown to staff
 * in the admin donor-message dashboard and optionally read aloud on stream.
 */

import { useState } from "react";
import { trpc } from "../../utils/trpc";

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white transition-colors"
        style={{ background: "#003087" }}
        aria-label={`Donate the value of ${itemTitle} via PayPal`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
        </svg>
        Donate with PayPal
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">Donate toward this item</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 -mt-0.5 ml-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Can&rsquo;t ship it directly? Donate the monetary value and we&rsquo;ll
              purchase <span className="font-medium text-gray-700">{itemTitle}</span> ourselves.
            </p>

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Donation amount (USD)
            </label>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {["5.00", "10.00", parseDollars(suggestedAmount) || "25.00", "50.00"]
                .filter((v, i, arr) => v && arr.indexOf(v) === i)
                .map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      amount === preset
                        ? "bg-blue-900 text-white border-blue-900"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
            </div>

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Your name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name here"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
            />

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email for receipt <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              onBlur={(e) => validateEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-1 ${
                emailError ? "border-red-400" : "border-gray-300"
              }`}
            />
            {emailError && <p className="text-xs text-red-500 mb-2">{emailError}</p>}

            <label className="block text-xs font-medium text-gray-700 mb-1">
              Leave a message for the sanctuary <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="A note for the animals or the team — may be read aloud on stream!"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-1 resize-none"
            />
            <p className="text-xs text-gray-400 mb-3 text-right">{message.length}/500</p>

            <p className="text-xs text-gray-400 mb-4">
              Donations are logged to Neon CRM. A tax receipt will be emailed if you provide your address.
            </p>

            <button
              onClick={() => void handleDonate()}
              disabled={!isValidAmount || !!emailError || createOrder.isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all"
              style={{ background: "#003087" }}
            >
              {createOrder.isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting to PayPal…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                  </svg>
                  Donate ${isValidAmount ? parseFloat(amount).toFixed(2) : "—"} with PayPal
                </>
              )}
            </button>

            {createOrder.isError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Failed to start payment. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
