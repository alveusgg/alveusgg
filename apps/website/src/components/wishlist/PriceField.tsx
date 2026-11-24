import { useEffect, useId, useRef, useState } from "react";

import { normalizePrice, parsePriceCents } from "@/utils/wishlist";

import { TextField } from "@/components/shared/form/TextField";

interface PriceFieldProps {
  name: string;
  defaultValue?: string;
  label?: string;
  // Off only when editing a legacy item that was saved without a price
  isRequired?: boolean;
}

export function PriceField({
  name,
  defaultValue = "",
  label = "Price",
  isRequired = true,
}: PriceFieldProps) {
  const hintId = useId();
  const errorId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(() => {
    const cents = parsePriceCents(defaultValue);
    return cents != null ? normalizePrice(cents) : defaultValue;
  });
  const [touched, setTouched] = useState(false);

  // The browser fires `invalid` on submit when the required field is blank
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handleInvalid = () => setTouched(true);
    wrapper.addEventListener("invalid", handleInvalid, true);
    return () => wrapper.removeEventListener("invalid", handleInvalid, true);
  }, []);

  const isBlank = value.trim() === "";
  const isInvalid =
    touched && (isBlank ? isRequired : parsePriceCents(value) == null);

  return (
    <div ref={wrapperRef} className="flex-1">
      <TextField
        label={label}
        name={name}
        inputMode="decimal"
        placeholder="29.99"
        value={value}
        onChange={setValue}
        onBlur={() => {
          setTouched(true);
          const cents = parsePriceCents(value);
          if (cents != null) setValue(normalizePrice(cents));
        }}
        prefix={<span className="pl-2 text-sm text-gray-500">$</span>}
        isRequired={isRequired}
        isInvalid={isInvalid}
        aria-describedby={
          [isRequired && hintId, isInvalid && errorId]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {isRequired && (
        <p id={hintId} className="mt-1 text-sm text-gray-400">
          Required for products
        </p>
      )}
      {isInvalid && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {isBlank
            ? "Enter a price for this product, like 24.99 or 1,547.00"
            : "Enter a dollar amount, like 24.99 or 1,547.00"}
        </p>
      )}
    </div>
  );
}
