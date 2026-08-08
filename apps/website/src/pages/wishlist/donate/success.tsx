/**
 * apps/website/src/pages/wishlist/donate/success.tsx
 *
 * Landing page after PayPal redirects the donor back.
 * Captures the payment and shows a thank-you message.
 */

import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../../utils/trpc";
import Section from "../../../components/content/Section";

type State = "loading" | "success" | "error";

const DonatSuccessPage: NextPage = () => {
  const router = useRouter();
  const { orderId, itemId } = router.query as { orderId?: string; itemId?: string };

  const [state, setState] = useState<State>("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = trpc.wishlist.captureDonation.useMutation();

  useEffect(() => {
    if (!orderId || !itemId || !router.isReady) return;

    capture
      .mutateAsync({ paypalOrderId: orderId, wishlistItemId: itemId })
      .then((result) => {
        setAmount(result.amount ?? null);
        setState("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setState("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, itemId, router.isReady]);

  return (
    <>
      <Head>
        <title>Thank You | Alveus Sanctuary</title>
      </Head>
      <Section>
        <div className="max-w-md mx-auto text-center py-16">
          {state === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Processing your donation…</p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
              {amount && (
                <p className="text-lg text-gray-600 mb-1">
                  Your ${amount.toFixed(2)} donation was received.
                </p>
              )}
              <p className="text-gray-500 mb-6">
                Your contribution goes directly toward caring for the animal
                ambassadors at Alveus Sanctuary. You&rsquo;re the best! 🐢
              </p>
              <p className="text-sm text-gray-400 mb-8">
                A confirmation and tax receipt has been sent to your email.
              </p>
              <Link
                href="/wishlist"
                className="inline-block px-6 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
              >
                Back to wishlist
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-500 mb-4 text-sm">{error}</p>
              <p className="text-gray-400 text-sm mb-8">
                If you were charged, please{" "}
                <Link href="/about#contact" className="text-green-700 underline">
                  contact us
                </Link>{" "}
                and we&rsquo;ll sort it out.
              </p>
              <Link
                href="/wishlist"
                className="inline-block px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back to wishlist
              </Link>
            </>
          )}
        </div>
      </Section>
    </>
  );
};

export default DonatSuccessPage;
