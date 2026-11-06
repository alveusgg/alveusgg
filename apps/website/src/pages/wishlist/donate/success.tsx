import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { trpc } from "@/utils/trpc";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconCheckCircle from "@/icons/IconCheckCircle";
import IconLoading from "@/icons/IconLoading";
import IconXCircle from "@/icons/IconXCircle";

type State = "loading" | "success" | "error";

const DonateSuccessPage: NextPage = () => {
  const router = useRouter();
  const { orderId, itemId } = router.query as {
    orderId?: string;
    itemId?: string;
  };

  const [state, setState] = useState<State>("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // mutateAsync keeps the same identity across renders, so the effect below
  // runs once per order and never double-submits the capture
  const { mutateAsync: captureDonation } =
    trpc.wishlist.captureDonation.useMutation();

  useEffect(() => {
    if (!router.isReady) return;
    if (!orderId || !itemId) {
      setError("This link is missing the PayPal order details.");
      setState("error");
      return;
    }

    captureDonation({ paypalOrderId: orderId, wishlistItemId: itemId })
      .then((result) => {
        setAmount(result.amount ?? null);
        setState("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setState("error");
      });
  }, [orderId, itemId, router.isReady, captureDonation]);

  return (
    <>
      <Meta title="Thank You" noindex />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex grow"
        containerClassName="flex flex-col items-center text-center"
      >
        <div className="my-auto flex max-w-md flex-col items-center gap-3 py-8">
          {state === "loading" && (
            <>
              <IconLoading className="size-12" />
              <p className="text-lg">Processing your donation …</p>
            </>
          )}

          {state === "success" && (
            <>
              <IconCheckCircle className="size-16" />
              <Heading className="my-0">Thank you!</Heading>
              {amount && (
                <p className="text-xl font-semibold">
                  {`Your $${amount.toFixed(2)} donation was received.`}
                </p>
              )}
              <p>
                Your contribution goes directly toward caring for the animal
                ambassadors at Alveus Sanctuary. You&rsquo;re the best!
              </p>
              <p className="text-sm">
                PayPal will email you a receipt for your donation.
              </p>
              <Button href="/wishlist" filled className="mt-4">
                Back to wishlist
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <IconXCircle className="size-16 text-red-700" />
              <Heading className="my-0">Something went wrong</Heading>
              {error && <p className="text-sm">{error}</p>}
              <p>
                If you were charged, please{" "}
                <Link href="/contact-us">contact us</Link> and we&rsquo;ll sort
                it out.
              </p>
              <Button href="/wishlist" className="mt-4">
                Back to wishlist
              </Button>
            </>
          )}
        </div>
      </Section>
    </>
  );
};

export default DonateSuccessPage;
