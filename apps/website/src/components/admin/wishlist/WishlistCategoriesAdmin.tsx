import type { inferRouterOutputs } from "@trpc/server";
import { type FormEvent, useCallback, useState } from "react";

import type { AppRouter } from "@/server/trpc/router/_app";

import { SLUG_PATTERN, convertToSlug } from "@/utils/slugs";
import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  defaultButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";

import IconArchive from "@/icons/IconArchive";
import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowUp from "@/icons/IconArrowUp";
import IconPencil from "@/icons/IconPencil";
import IconSync from "@/icons/IconSync";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Category = RouterOutput["adminWishlist"]["adminGetAllCategories"][number];

function RenameForm({
  category,
  onDone,
}: {
  category: Category;
  onDone: () => void;
}) {
  const [name, setName] = useState(category.name);
  const update = trpc.adminWishlist.updateCategory.useMutation({
    onSuccess: onDone,
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        update.mutate({ id: category.id, name, sortOrder: category.sortOrder });
      }}
    >
      {update.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={update.error} />
        </MessageBox>
      )}
      <TextField
        label={`Rename ${category.name}`}
        labelClassName="sr-only"
        name="name"
        value={name}
        onChange={setName}
        autoFocus
        isRequired
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="small"
          width="auto"
          disabled={update.isPending}
        >
          Save
        </Button>
        <Button
          type="button"
          size="small"
          width="auto"
          className={secondaryButtonClasses}
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function CreateCategoryForm({ onCreate }: { onCreate: () => void }) {
  const [name, setName] = useState("");
  const create = trpc.adminWishlist.createCategory.useMutation();

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const slug = String(formData.get("slug") || "") || convertToSlug(name);

      create.mutate(
        { name, slug },
        {
          onSuccess: () => {
            form.reset();
            setName("");
            onCreate();
          },
        },
      );
    },
    [create, name, onCreate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {create.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={create.error} />
        </MessageBox>
      )}

      <Fieldset legend="Add category">
        <TextField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          isRequired
        />
        <TextField
          label="Slug (used in links, can't be changed later)"
          name="slug"
          inputMode="url"
          pattern={SLUG_PATTERN}
          inputClassName="font-mono"
          placeholder={convertToSlug(name)}
        />
      </Fieldset>

      <Button
        type="submit"
        className={defaultButtonClasses}
        disabled={create.isPending}
      >
        Add category
      </Button>
    </form>
  );
}

export function WishlistCategoriesAdmin() {
  const categories = trpc.adminWishlist.adminGetAllCategories.useQuery();
  const [editingId, setEditingId] = useState<string | null>(null);

  const refetch = () => void categories.refetch();
  const reorder = trpc.adminWishlist.reorderCategories.useMutation({
    onSettled: refetch,
  });
  const archive = trpc.adminWishlist.archiveCategory.useMutation({
    onSettled: refetch,
  });
  const unarchive = trpc.adminWishlist.unarchiveCategory.useMutation({
    onSettled: refetch,
  });
  const error = reorder.error ?? archive.error ?? unarchive.error;

  const list = categories.data ?? [];
  const move = (index: number, offset: number) => {
    const ids = list.map((category) => category.id);
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(index + offset, 0, moved);
    reorder.mutate({ orderedIds: ids });
  };

  return (
    <>
      <Headline>Wishlist categories</Headline>

      <Panel>
        <p className="mb-4 text-sm text-gray-400">
          The public wishlist shows active categories that have at least one
          item. Archived categories are hidden from the wishlist and the item
          form, and their items keep their category.
        </p>

        {error && (
          <MessageBox variant="failure" className="mb-4">
            <ProcedureErrorMessage error={error} />
          </MessageBox>
        )}

        {categories.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : list.length === 0 ? (
          <MessageBox>No categories yet. Add one below.</MessageBox>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left">Name</th>
                <th className="text-left">Slug</th>
                <th className="text-left">Items</th>
                <th className="text-left">Status</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((category, index) => (
                <tr key={category.id} className="border-b border-gray-700">
                  <td className="p-1">
                    {editingId === category.id ? (
                      <RenameForm
                        category={category}
                        onDone={() => {
                          setEditingId(null);
                          refetch();
                        }}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="p-1 font-mono">{category.slug}</td>
                  <td className="p-1">{category._count.items}</td>
                  <td className="p-1">
                    {category.archivedAt ? "Archived" : "Active"}
                  </td>
                  <td className="flex flex-row flex-wrap gap-2 p-1">
                    <Button
                      size="small"
                      width="auto"
                      aria-label={`Move ${category.name} up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                    >
                      <IconArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="small"
                      width="auto"
                      aria-label={`Move ${category.name} down`}
                      disabled={index === list.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                    >
                      <IconArrowDown className="size-4" />
                    </Button>
                    <Button
                      size="small"
                      width="auto"
                      onClick={() => setEditingId(category.id)}
                    >
                      <IconPencil className="size-4" />
                      Rename
                    </Button>
                    {category.archivedAt ? (
                      <Button
                        size="small"
                        width="auto"
                        disabled={unarchive.isPending}
                        onClick={() => unarchive.mutate({ id: category.id })}
                      >
                        <IconSync className="size-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        width="auto"
                        className={secondaryButtonClasses}
                        confirmationMessage={`Archive ${category.name}? It will be hidden from the wishlist and the item form.`}
                        disabled={archive.isPending}
                        onClick={() => archive.mutate({ id: category.id })}
                      >
                        <IconArchive className="size-4" />
                        Archive
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel>
        <CreateCategoryForm onCreate={refetch} />
      </Panel>
    </>
  );
}
