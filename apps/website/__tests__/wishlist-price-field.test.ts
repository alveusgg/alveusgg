// @vitest-environment jsdom
import { act, createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { PriceField } from "@/components/wishlist/PriceField";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

const render = (defaultValue?: string, isRequired?: boolean) => {
  act(() => {
    root.render(
      createElement(PriceField, { name: "price", defaultValue, isRequired }),
    );
  });
  const input = container.querySelector("input");
  if (!input) throw new Error("No input rendered");
  return input;
};

const type = (input: HTMLInputElement, value: string) => {
  act(() => {
    input.focus();
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const blur = (input: HTMLInputElement) => {
  act(() => {
    input.blur();
  });
};

const error = () =>
  container.querySelector("p.text-red-700")?.textContent ?? null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("PriceField", () => {
  test("renders a decimal input with a dollar prefix and the form name", () => {
    const input = render();
    expect(input.name).toBe("price");
    expect(input.inputMode).toBe("decimal");
    expect(input.value).toBe("");
    expect(container.textContent).toContain("$");
  });

  test("keeps typed text until blur", () => {
    const input = render();
    type(input, "1,547");
    expect(input.value).toBe("1,547");
    expect(error()).toBeNull();
  });

  test.each([
    ["1,547", "1547.00"],
    ["24.99", "24.99"],
    ["$24.9", "24.90"],
  ])("normalizes %j to %j on blur", (typed, normalized) => {
    const input = render();
    type(input, typed);
    blur(input);
    expect(input.value).toBe(normalized);
    expect(error()).toBeNull();
  });

  test("shows an inline error for an unreadable price", () => {
    const input = render();
    type(input, "20-30");
    blur(input);
    expect(input.value).toBe("20-30");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(error()).toBe("Enter a dollar amount, like 24.99 or 1,547.00");

    type(input, "20");
    blur(input);
    expect(error()).toBeNull();
  });

  test("is required with an accessible hint", () => {
    const input = render();
    expect(input.required).toBe(true);
    const hintId = input.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(hintId)?.textContent).toBe(
      "Required for products",
    );
  });

  test("shows the required error when left blank", () => {
    const input = render();
    type(input, "  ");
    blur(input);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(error()).toBe(
      "Enter a price for this product, like 24.99 or 1,547.00",
    );
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
  });

  test("shows the required error when the form is submitted blank", () => {
    const form = document.createElement("form");
    container.replaceWith(form);
    form.appendChild(container);
    render();
    expect(error()).toBeNull();

    act(() => {
      form.checkValidity();
    });
    expect(error()).toBe(
      "Enter a price for this product, like 24.99 or 1,547.00",
    );
    form.replaceWith(container);
  });

  test("leaves a blank legacy price blank without an error", () => {
    const input = render("", false);
    expect(input.required).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    type(input, "");
    blur(input);
    expect(input.value).toBe("");
    expect(error()).toBeNull();
  });

  test("normalizes a stored price", () => {
    expect(render("$29.99").value).toBe("29.99");
  });
});
