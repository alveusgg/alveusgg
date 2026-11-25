// @vitest-environment jsdom
import { act, createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { DonationOptions } from "@/utils/wishlist";

import WishlistDonateButton from "@/components/wishlist/WishlistDonateButton";

const { mutateAsync, latest, useQuery } = vi.hoisted(() => {
  // What getDonationOptions returns when the dialog opens
  const latest = {
    data: undefined as DonationOptions | undefined,
    isFetching: false,
  };
  return {
    // Never resolves, so the test never navigates to PayPal
    mutateAsync: vi.fn(() => new Promise(() => {})),
    latest,
    useQuery: vi.fn((_input: unknown, _opts: { enabled: boolean }) => latest),
  };
});

vi.mock("@/utils/trpc", () => ({
  trpc: {
    wishlist: {
      createDonateOrder: {
        useMutation: () => ({ mutateAsync, isPending: false, error: null }),
      },
      getDonationOptions: { useQuery },
    },
  },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

const render = (props: {
  priceCents: number | null;
  remainingCents?: number | null;
}) => {
  act(() => {
    root.render(
      createElement(WishlistDonateButton, {
        itemId: "item-1",
        itemTitle: "Heat lamp",
        ...props,
      }),
    );
  });
};

const button = (name: string | RegExp) => {
  const match = [...document.querySelectorAll("button")].find((el) =>
    typeof name === "string"
      ? el.textContent === name
      : name.test(el.textContent ?? ""),
  );
  if (!match) throw new Error(`No button ${name}`);
  return match;
};

const click = (el: HTMLElement) => {
  act(() => {
    el.click();
  });
};

const submit = async () => {
  const form = document.querySelector("form");
  if (!form) throw new Error("No form rendered");
  await act(async () => {
    form.requestSubmit();
  });
};

const submittedAmount = () =>
  (mutateAsync.mock.calls.at(-1) as unknown as [{ amount: number }])[0].amount;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
  latest.data = undefined;
  latest.isFetching = false;
});

describe("WishlistDonateButton amount", () => {
  test("submits the price shown after a rerender", async () => {
    render({ priceCents: 2_499 });
    render({ priceCents: 3_150 });
    click(button(/Donate with PayPal/));

    expect(document.body.textContent).toContain("Donate $31.50 with PayPal");
    await submit();
    expect(submittedAmount()).toBe(31.5);
  });

  test("submits the new price after closing and reopening", async () => {
    render({ priceCents: 2_499 });
    click(button(/Donate with PayPal/));
    click(button("Cancel"));

    render({ priceCents: 3_150 });
    click(button(/Donate with PayPal/));
    expect(document.body.textContent).toContain("Donate $31.50 with PayPal");
    await submit();
    expect(submittedAmount()).toBe(31.5);
  });

  test("keeps the chip-in amount for partial items", async () => {
    render({ priceCents: 2_499, remainingCents: 2_000 });
    click(button(/Chip in/));
    click(button("$10"));
    await submit();
    expect(submittedAmount()).toBe(10);
  });

  test("keeps the chosen amount for goals", async () => {
    render({ priceCents: null });
    click(button(/Donate with PayPal/));
    click(button("$25.00"));
    await submit();
    expect(submittedAmount()).toBe(25);
  });
});

describe("WishlistDonateButton latest item state", () => {
  const submitButton = () => {
    const el = document.querySelector<HTMLButtonElement>(
      'form button[type="submit"]',
    );
    if (!el) throw new Error("No submit button");
    return el;
  };

  test("checks the item only once the dialog opens", () => {
    render({ priceCents: 2_499 });
    expect(useQuery.mock.lastCall?.[1]).toEqual({ enabled: false });

    click(button(/Donate with PayPal/));
    expect(useQuery.mock.lastCall?.[1]).toEqual({ enabled: true });
  });

  test("uses the balance left when the dialog opens", () => {
    latest.data = { available: true, priceCents: null, remainingCents: 500 };
    render({ priceCents: 2_499, remainingCents: 2_000 });
    click(button(/Chip in/));

    expect(document.body.textContent).toContain("$5 is left to raise");
    expect(button("Fund the rest ($5)")).toBeDefined();
    // The default amount was picked from the page's balance of $20
    expect(submitButton().disabled).toBe(true);
  });

  test("explains when the item stopped taking donations", () => {
    latest.data = {
      available: false,
      reason: "This item is already fully funded",
    };
    render({ priceCents: 2_499, remainingCents: 2_000 });
    click(button(/Chip in/));

    expect(document.body.textContent).toContain(
      "This item is already fully funded.",
    );
    expect(document.querySelector("form")).toBeNull();
  });

  test("waits for the check before submitting", () => {
    latest.isFetching = true;
    render({ priceCents: 2_499 });
    click(button(/Donate with PayPal/));

    expect(submitButton().disabled).toBe(true);
  });
});
