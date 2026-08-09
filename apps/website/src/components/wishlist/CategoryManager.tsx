import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import type { WishlistCategory } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import { getStringFromFormData } from "@/utils/forms";
import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  defaultButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";

import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

type CategoryWithCount = WishlistCategory & { _count: { items: number } };

type CategoryManagerProps = {
  categories: CategoryWithCount[];
  onRefresh: () => void;
  className?: string;
};

const toSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function CategoryManager({
  categories,
  onRefresh,
  className,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");

  const createMutation = trpc.wishlist.createCategory.useMutation();
  const updateMutation = trpc.wishlist.updateCategory.useMutation();
  const deleteMutation = trpc.wishlist.deleteCategory.useMutation();

  const editingCategory = editingId
    ? categories.find((c) => c.id === editingId)
    : undefined;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const name = getStringFromFormData(formData, "name");
      const slugValue = getStringFromFormData(formData, "slug") || toSlug(name);
      const sortOrder = Number(getStringFromFormData(formData, "sortOrder")) || 0;

      if (editingId) {
        updateMutation.mutate(
          { id: editingId, name, slug: slugValue, sortOrder },
          {
            onSuccess: () => {
              setEditingId(null);
              setSlug("");
              onRefresh();
            },
          },
        );
      } else {
        createMutation.mutate(
          { name, slug: slugValue, sortOrder },
          {
            onSuccess: () => {
              setSlug("");
              onRefresh();
            },
          },
        );
      }
    },
    [editingId, createMutation, updateMutation, onRefresh],
  );

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setSlug(cat.slug);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSlug("");
  };

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className={classes("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      <div>
        {createMutation.error && (
          <MessageBox variant="failure" className="mb-3">
            <pre>{createMutation.error.message}</pre>
          </MessageBox>
        )}
        {updateMutation.error && (
          <MessageBox variant="failure" className="mb-3">
            <pre>{updateMutation.error.message}</pre>
          </MessageBox>
        )}

        <form
          key={editingId ?? "create"}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Fieldset legend={editingId ? "Edit Category" : "Add Category"}>
            <TextField
              label="Name"
              name="name"
              defaultValue={editingCategory?.name ?? ""}
              placeholder="e.g. Food & Enrichment"
              isRequired
            />
            <TextField
              label="Slug"
              name="slug"
              inputClassName="font-mono"
              value={slug}
              onChange={(value) => setSlug(toSlug(value))}
              placeholder="food-enrichment"
              isRequired
            />
            <FieldGroup>
              <TextField
                label="Sort order"
                name="sortOrder"
                type="number"
                inputMode="numeric"
                defaultValue={String(editingCategory?.sortOrder ?? 0)}
              />
            </FieldGroup>
          </Fieldset>

          <div className="flex gap-2">
            <Button type="submit" className={defaultButtonClasses} disabled={isSaving}>
              {isSaving ? "Saving…" : editingId ? "Save" : "Add Category"}
            </Button>
            {editingId && (
              <Button type="button" className={secondaryButtonClasses} onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No categories yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">
                    {cat.slug} · {cat._count.items} items
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="small"
                    width="auto"
                    className="bg-transparent text-gray-400 hover:text-blue-600"
                    onClick={() => startEdit(cat)}
                  >
                    <IconPencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    width="auto"
                    className="bg-transparent text-gray-400 hover:text-red-500"
                    confirmationMessage={
                      cat._count.items > 0
                        ? `Delete this category? The ${cat._count.items} item(s) in it will become uncategorized.`
                        : "Delete this category?"
                    }
                    onClick={() => deleteMutation.mutate({ id: cat.id }, { onSuccess: onRefresh })}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
