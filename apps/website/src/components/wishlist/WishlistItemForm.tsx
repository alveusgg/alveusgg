import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import type { WishlistCategory, WishlistItem } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import { getStringFromFormData } from "@/utils/forms";
import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
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

  // Item type is chosen once at creation and locked during edits, since
  // Product and Goal items have fundamentally different required fields.
  const [itemType, setItemType] = useState<"PRODUCT" | "GOAL">(
    item?.itemType ?? "PRODUCT",
  );
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");

  const createMutation = trpc.wishlist.createItem.useMutation();
  const updateMutation = trpc.wishlist.updateItem.useMutation();
  const deleteMutation = trpc.wishlist.deleteItem.useMutation();

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const shared = {
        title: getStringFromFormData(formData, "title"),
        description: getStringFromFormData(formData, "description") || undefined,
        imageUrl: getStringFromFormData(formData, "imageUrl") || undefined,
        priority: getStringFromFormData(formData, "priority") as (typeof PRIORITY_OPTIONS)[number],
        status: getStringFromFormData(formData, "status") as (typeof STATUS_OPTIONS)[number],
        categoryId: categoryId || undefined,
        notes: getStringFromFormData(formData, "notes") || undefined,
      };

      const payload =
        itemType === "PRODUCT"
          ? {
              itemType: "PRODUCT" as const,
              ...shared,
              url: getStringFromFormData(formData, "url"),
              price: getStringFromFormData(formData, "price") || undefined,
              quantity: Number(getStringFromFormData(formData, "quantity")) || 1,
              quantityFulfilled: Number(getStringFromFormData(formData, "quantityFulfilled")) || 0,
            }
          : {
              itemType: "GOAL" as const,
              ...shared,
              goalAmountCents:
                Math.round(
                  (Number(getStringFromFormData(formData, "goalAmount")) || 0) * 100,
                ) || 100,
            };

      if (action === "edit") {
        if (!item) return;
        const extra =
          itemType === "GOAL"
            ? {
                raisedAmountCents: Math.round(
                  (Number(getStringFromFormData(formData, "raisedAmount")) || 0) * 100,
                ),
              }
            : {};
        updateMutation.mutate(
          { id: item.id, ...payload, ...extra },
          { onSuccess: () => void router.push("/admin/wishlist") },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess:
            onCreate ?? (() => void router.push("/admin/wishlist")),
        });
      }
    },
    [action, item, itemType, categoryId, createMutation, updateMutation, router, onCreate],
  );

  return (
    <form className={classes("flex flex-col gap-10", className)} onSubmit={handleSubmit}>
      {createMutation.error && (
        <MessageBox variant="failure">
          <pre>{createMutation.error.message}</pre>
        </MessageBox>
      )}
      {updateMutation.error && (
        <MessageBox variant="failure">
          <pre>{updateMutation.error.message}</pre>
        </MessageBox>
      )}
      {deleteMutation.error && (
        <MessageBox variant="failure">
          <pre>{deleteMutation.error.message}</pre>
        </MessageBox>
      )}
      {createMutation.isSuccess && (
        <MessageBox variant="success">Wishlist item created!</MessageBox>
      )}
      {updateMutation.isSuccess && (
        <MessageBox variant="success">Wishlist item updated!</MessageBox>
      )}

      {/* Item type toggle — only shown when creating, locked during edit */}
      {action === "create" && (
        <FieldGroup>
          <Button
            type="button"
            width="full"
            className={itemType === "PRODUCT" ? defaultButtonClasses : "bg-gray-300 text-gray-900"}
            onClick={() => setItemType("PRODUCT")}
          >
            <IconBox className="size-4" />
            Product
          </Button>
          <Button
            type="button"
            width="full"
            className={itemType === "GOAL" ? defaultButtonClasses : "bg-gray-300 text-gray-900"}
            onClick={() => setItemType("GOAL")}
          >
            <IconGift className="size-4" />
            Funding Goal
          </Button>
        </FieldGroup>
      )}

      <Fieldset legend={`${action === "create" ? "Create" : "Update"} Wishlist ${itemType === "GOAL" ? "Goal" : "Item"}`}>
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
              label="Product URL"
              name="url"
              inputMode="url"
              type="url"
              isRequired
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
          </>
        ) : (
          <FieldGroup>
            <TextField
              label="Goal amount (USD)"
              name="goalAmount"
              type="number"
              inputMode="decimal"
              prefix={<IconDollar className="ml-2 size-4 text-gray-500" />}
              defaultValue={item?.goalAmountCents != null ? String(item.goalAmountCents / 100) : "500"}
              isRequired
            />
            {action === "edit" && (
              <TextField
                label="Raised so far (USD)"
                name="raisedAmount"
                type="number"
                inputMode="decimal"
                prefix={<IconDollar className="ml-2 size-4 text-gray-500" />}
                defaultValue={item?.raisedAmountCents != null ? String(item.raisedAmountCents / 100) : "0"}
              />
            )}
          </FieldGroup>
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
                {s === "PARTIALLY_FULFILLED" ? "Partially Fulfilled" : s.charAt(0) + s.slice(1).toLowerCase()}
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
        <Button type="submit" className={defaultButtonClasses} disabled={isSaving}>
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
