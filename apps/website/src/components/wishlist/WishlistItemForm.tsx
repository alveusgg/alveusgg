import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import type { WishlistCategory, WishlistItem } from "@alveusgg/database";

import { WISHLIST_FUNDS_NOTE } from "@/data/wishlist";

import { classes } from "@/utils/classes";
import { getStringFromFormData } from "@/utils/forms";
import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextField } from "@/components/shared/form/TextField";

import IconBox from "@/icons/IconBox";
import IconDollar from "@/icons/IconDollar";
import IconGift from "@/icons/IconGift";

type ItemWithCategory = WishlistItem & { category: WishlistCategory | null };

type WishlistItemFormProps = {
  action: "create" | "edit";
  item?: ItemWithCategory;
  categories: WishlistCategory[];
  onCreate?: () => void;
  className?: string;
};

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUS_OPTIONS = [
  "NEEDED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "OPENED",
  "ARCHIVED",
] as const;

export function WishlistItemForm({
  action,
  item,
  categories,
  onCreate,
  className,
}: WishlistItemFormProps) {
  const router = useRouter();

  // Set at creation and locked on edit, since the two types need different fields
  const [itemType, setItemType] = useState<"PRODUCT" | "GOAL">(
    item?.itemType ?? "PRODUCT",
  );
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [allowPartialDonations, setAllowPartialDonations] = useState(
    item?.allowPartialDonations ?? false,
  );

  const createMutation = trpc.adminWishlist.createItem.useMutation();
  const updateMutation = trpc.adminWishlist.updateItem.useMutation();
  const deleteMutation = trpc.adminWishlist.deleteItem.useMutation();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const shared = {
        title: getStringFromFormData(formData, "title"),
        description:
          getStringFromFormData(formData, "description") || undefined,
        imageUrl: getStringFromFormData(formData, "imageUrl") || undefined,
        priority: getStringFromFormData(
          formData,
          "priority",
        ) as (typeof PRIORITY_OPTIONS)[number],
        status: getStringFromFormData(
          formData,
          "status",
        ) as (typeof STATUS_OPTIONS)[number],
        categoryId: categoryId || undefined,
        notes: getStringFromFormData(formData, "notes") || undefined,
        allowPartialDonations,
      };
      const dollarsToCents = (name: string) =>
        Math.round((Number(getStringFromFormData(formData, name)) || 0) * 100);

      const payload =
        itemType === "PRODUCT"
          ? {
              itemType: "PRODUCT" as const,
              ...shared,
              url: getStringFromFormData(formData, "url") || null,
              price: getStringFromFormData(formData, "price") || undefined,
              quantity:
                Number(getStringFromFormData(formData, "quantity")) || 1,
              quantityFulfilled:
                Number(getStringFromFormData(formData, "quantityFulfilled")) ||
                0,
              // Blank means the target is the price times the quantity
              ...(allowPartialDonations
                ? { goalAmountCents: dollarsToCents("partialTarget") || null }
                : {}),
            }
          : {
              itemType: "GOAL" as const,
              ...shared,
              goalAmountCents:
                Math.round(
                  (Number(getStringFromFormData(formData, "goalAmount")) || 0) *
                    100,
                ) || 100,
            };

      if (action === "edit") {
        if (!item) return;
        const extra =
          itemType === "GOAL" || allowPartialDonations
            ? { raisedAmountCents: dollarsToCents("raisedAmount") }
            : {};
        updateMutation.mutate(
          { id: item.id, ...payload, ...extra },
          { onSuccess: () => void router.push("/admin/wishlist") },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: onCreate ?? (() => void router.push("/admin/wishlist")),
        });
      }
    },
    [
      action,
      item,
      itemType,
      categoryId,
      allowPartialDonations,
      createMutation,
      updateMutation,
      router,
      onCreate,
    ],
  );

  return (
    <form
      className={classes("flex flex-col gap-10", className)}
      onSubmit={handleSubmit}
    >
      {createMutation.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={createMutation.error} />
        </MessageBox>
      )}
      {updateMutation.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={updateMutation.error} />
        </MessageBox>
      )}
      {deleteMutation.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={deleteMutation.error} />
        </MessageBox>
      )}
      {createMutation.isSuccess && (
        <MessageBox variant="success">Wishlist item created!</MessageBox>
      )}
      {updateMutation.isSuccess && (
        <MessageBox variant="success">Wishlist item updated!</MessageBox>
      )}

      {action === "create" && (
        <FieldGroup>
          <Button
            type="button"
            width="full"
            className={
              itemType === "PRODUCT"
                ? defaultButtonClasses
                : secondaryButtonClasses
            }
            aria-pressed={itemType === "PRODUCT"}
            onClick={() => setItemType("PRODUCT")}
          >
            <IconBox className="size-4" />
            Product
          </Button>
          <Button
            type="button"
            width="full"
            className={
              itemType === "GOAL"
                ? defaultButtonClasses
                : secondaryButtonClasses
            }
            aria-pressed={itemType === "GOAL"}
            onClick={() => setItemType("GOAL")}
          >
            <IconGift className="size-4" />
            Funding Goal
          </Button>
        </FieldGroup>
      )}

      <Fieldset
        legend={`${action === "create" ? "Create" : "Update"} Wishlist ${itemType === "GOAL" ? "Goal" : "Item"}`}
      >
        <TextField
          label="Title"
          name="title"
          defaultValue={item?.title ?? ""}
          isRequired
        />

        <TextField
          label="Description"
          name="description"
          defaultValue={item?.description ?? ""}
        />

        <TextField
          label="Image URL"
          name="imageUrl"
          inputMode="url"
          type="url"
          defaultValue={item?.imageUrl ?? ""}
        />

        {itemType === "PRODUCT" ? (
          <>
            <TextField
              label="Product URL (optional, shown to donors as a reference link)"
              name="url"
              inputMode="url"
              type="url"
              defaultValue={item?.url ?? ""}
            />
            <FieldGroup>
              <TextField
                label="Price"
                name="price"
                placeholder="$29.99"
                defaultValue={item?.price ?? ""}
              />
            </FieldGroup>
            <FieldGroup>
              <TextField
                label="Quantity needed"
                name="quantity"
                type="number"
                inputMode="numeric"
                defaultValue={String(item?.quantity ?? 1)}
              />
              <TextField
                label="Quantity fulfilled"
                name="quantityFulfilled"
                type="number"
                inputMode="numeric"
                defaultValue={String(item?.quantityFulfilled ?? 0)}
              />
            </FieldGroup>
            {allowPartialDonations && (
              <FieldGroup>
                <TextField
                  label="Funding target (USD, blank for price x quantity)"
                  name="partialTarget"
                  type="number"
                  inputMode="decimal"
                  prefix={<IconDollar className="ml-2 size-4 text-gray-500" />}
                  defaultValue={
                    item?.goalAmountCents != null
                      ? String(item.goalAmountCents / 100)
                      : ""
                  }
                />
                {action === "edit" && (
                  <TextField
                    label="Raised so far (USD)"
                    name="raisedAmount"
                    type="number"
                    inputMode="decimal"
                    prefix={
                      <IconDollar className="ml-2 size-4 text-gray-500" />
                    }
                    defaultValue={String((item?.raisedAmountCents ?? 0) / 100)}
                  />
                )}
              </FieldGroup>
            )}
          </>
        ) : (
          <FieldGroup>
            <TextField
              label="Goal amount (USD)"
              name="goalAmount"
              type="number"
              inputMode="decimal"
              prefix={<IconDollar className="ml-2 size-4 text-gray-500" />}
              defaultValue={
                item?.goalAmountCents != null
                  ? String(item.goalAmountCents / 100)
                  : "500"
              }
              isRequired
            />
            {action === "edit" && (
              <TextField
                label="Raised so far (USD)"
                name="raisedAmount"
                type="number"
                inputMode="decimal"
                prefix={<IconDollar className="ml-2 size-4 text-gray-500" />}
                defaultValue={
                  item?.raisedAmountCents != null
                    ? String(item.raisedAmountCents / 100)
                    : "0"
                }
              />
            )}
          </FieldGroup>
        )}

        <CheckboxField
          isSelected={allowPartialDonations}
          onChange={setAllowPartialDonations}
        >
          Allow partial donations, so donors can chip in any amount (minimum $5)
          until the target is reached
        </CheckboxField>
        {allowPartialDonations && (
          <p className="text-sm text-gray-400">{WISHLIST_FUNDS_NOTE}</p>
        )}
      </Fieldset>

      <Fieldset legend="Organization">
        <FieldGroup>
          <SelectBoxField
            label="Priority"
            name="priority"
            defaultValue={item?.priority ?? "MEDIUM"}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </SelectBoxField>

          <SelectBoxField
            label="Status"
            name="status"
            defaultValue={item?.status ?? "NEEDED"}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "PARTIALLY_FULFILLED"
                  ? "Partially Fulfilled"
                  : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </SelectBoxField>
        </FieldGroup>

        <SelectBoxField
          label="Category"
          name="categoryId"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
              {cat.archivedAt ? " (archived)" : ""}
            </option>
          ))}
        </SelectBoxField>

        <TextField
          label="Internal notes (not shown publicly)"
          name="notes"
          defaultValue={item?.notes ?? ""}
        />
      </Fieldset>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          className={defaultButtonClasses}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : action === "create" ? "Create" : "Update"}
        </Button>

        {item && (
          <Button
            type="button"
            className={dangerButtonClasses}
            confirmationMessage="Permanently delete this wishlist item?"
            onClick={() =>
              deleteMutation.mutate(
                { id: item.id, permanent: true },
                { onSuccess: () => void router.push("/admin/wishlist") },
              )
            }
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
