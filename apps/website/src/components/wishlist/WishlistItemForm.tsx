import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

import type { WishlistCategory } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import {
  type ImageMimeType,
  imageMimeTypes,
  maxImageUploadSize,
} from "@/utils/files";
import { getStringFromFormData } from "@/utils/forms";
import { createImageUrl } from "@/utils/image";
import { extractColorFromImage } from "@/utils/process-image";
import { type RouterOutputs, trpc } from "@/utils/trpc";
import { getWishlistArchiveConfirmation } from "@/utils/wishlist";

import useFileUpload from "@/hooks/files/upload";

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
import { ImageUploadAttachment } from "@/components/shared/form/ImageUploadAttachment";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextField } from "@/components/shared/form/TextField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "@/components/shared/form/UploadAttachmentsField";

import IconBox from "@/icons/IconBox";
import IconDollar from "@/icons/IconDollar";
import IconGift from "@/icons/IconGift";
import IconTrash from "@/icons/IconTrash";

import WishlistFundsNote from "./WishlistFundsNote";

type AdminWishlistItem =
  RouterOutputs["adminWishlist"]["adminGetAllItems"][number];

type WishlistItemFormProps = {
  action: "create" | "edit";
  item?: AdminWishlistItem;
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

const resizeImageOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 90,
};

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
  const createFileUpload = trpc.adminWishlist.createFileUpload.useMutation();

  const [imageError, setImageError] = useState<string | null>(null);

  const upload = useFileUpload<ImageMimeType>(
    (signature) => createFileUpload.mutateAsync(signature),
    { allowedFileTypes: imageMimeTypes },
  );

  const imageAttachmentData = useUploadAttachmentsData(
    useMemo(() => {
      const { fileStorageObjectId, fileStorageObjectUrl } = item || {};
      if (!fileStorageObjectId || !fileStorageObjectUrl) {
        return [];
      }

      return [
        {
          status: "saved",
          id: createId(),
          url: fileStorageObjectUrl,
          fileStorageObjectId,
          extractColor: async () =>
            await extractColorFromImage(
              createImageUrl({
                src: fileStorageObjectUrl,
                width: 512,
                quality: 100,
              }),
            ),
        },
      ];
    }, [item]),
  );
  const imageFile = imageAttachmentData.files[0];

  // Items created before uploads may still have an external image URL. It is
  // shown read-only until it is cleared, and an uploaded image replaces it.
  const [legacyImageUrl, setLegacyImageUrl] = useState(item?.imageUrl ?? null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setImageError(null);
      const formData = new FormData(event.currentTarget);

      if (imageFile?.status === "upload.pending") {
        setImageError("Please wait for the image upload to finish.");
        return;
      }
      if (imageFile?.status === "upload.failed") {
        setImageError("The image upload failed, remove it and try again.");
        return;
      }

      const shared = {
        title: getStringFromFormData(formData, "title"),
        // null, not undefined, so clearing a field on edit saves the change
        description: getStringFromFormData(formData, "description") || null,
        fileStorageObjectId:
          imageFile?.status === "upload.done" || imageFile?.status === "saved"
            ? imageFile.fileStorageObjectId
            : null,
        priority: getStringFromFormData(
          formData,
          "priority",
        ) as (typeof PRIORITY_OPTIONS)[number],
        status: getStringFromFormData(
          formData,
          "status",
        ) as (typeof STATUS_OPTIONS)[number],
        categoryId: categoryId || null,
        notes: getStringFromFormData(formData, "notes") || null,
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
              price: getStringFromFormData(formData, "price") || null,
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
        const raisedAmount = getStringFromFormData(formData, "raisedAmount");
        const { itemType: _itemType, ...fields } = payload;
        if (
          fields.status === "ARCHIVED" &&
          item.status !== "ARCHIVED" &&
          item.raisedAmountCents > 0 &&
          !confirm(getWishlistArchiveConfirmation(item.raisedAmountCents))
        ) {
          return;
        }
        updateMutation.mutate(
          {
            id: item.id,
            ...fields,
            ...(item.imageUrl && !legacyImageUrl ? { imageUrl: null } : {}),
            ...(raisedAmount !== "" && {
              raisedAmountCents: Math.round(Number(raisedAmount) * 100),
            }),
          },
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
      imageFile,
      legacyImageUrl,
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
      {imageError && <MessageBox variant="failure">{imageError}</MessageBox>}
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

        <UploadAttachmentsField
          label="Image"
          {...imageAttachmentData}
          maxNumber={1}
          multiple={false}
          upload={upload}
          allowedFileTypes={imageMimeTypes}
          maxFileSize={maxImageUploadSize}
          resizeImageOptions={resizeImageOptions}
          renderAttachment={(props) => (
            <ImageUploadAttachment {...props}>
              <div className="flex h-full flex-col items-start justify-center">
                <Button
                  size="small"
                  width="auto"
                  onClick={() =>
                    imageAttachmentData.dispatch({
                      type: "remove",
                      id: props.fileReference.id,
                    })
                  }
                  disabled={props.disabled}
                >
                  <IconTrash className="size-5" />
                  Remove
                </Button>
              </div>
            </ImageUploadAttachment>
          )}
        />

        {legacyImageUrl && (
          <div>
            <TextField
              label="Legacy image URL"
              value={legacyImageUrl}
              isReadOnly
              inputClassName="text-gray-500"
              suffix={
                <Button
                  size="small"
                  width="auto"
                  className={secondaryButtonClasses}
                  onClick={() => setLegacyImageUrl(null)}
                >
                  Clear
                </Button>
              }
            />
            <p className="mt-1 text-sm text-gray-400">
              {imageFile
                ? "Not shown, the uploaded image is used instead."
                : "Shown until an image is uploaded. Upload a copy of it, then clear this URL."}
            </p>
          </div>
        )}

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
                    placeholder={((item?.raisedAmountCents ?? 0) / 100).toFixed(
                      2,
                    )}
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
                placeholder={((item?.raisedAmountCents ?? 0) / 100).toFixed(2)}
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
          <WishlistFundsNote className="text-gray-400" />
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
