import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import type { ShortLinks } from "@prisma/client";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";
import { convertToSlug, SLUG_PATTERN } from "@/utils/slugs";

import type { ShortLinkSchema } from "@/server/db/short-links";

import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import { getShortBaseUrl } from "@/utils/short-url";

type ShortLinkFormProps = {
  action: "create" | "edit";
  shortLink?: ShortLinks;
};

export function ShortLinkForm({ action, shortLink }: ShortLinkFormProps) {
  const router = useRouter();
  const submit = trpc.adminShortLinks.createOrEditShortLink.useMutation();

  const [label, setLabel] = useState(shortLink?.label || "");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      // Add https:// if not present
      const link =
        String(formData.get("url")).startsWith("http://") ||
        String(formData.get("url")).startsWith("https://")
          ? String(formData.get("url"))
          : "https://" + String(formData.get("url"));

      const mutationData: ShortLinkSchema = {
        label: String(formData.get("label")),
        slug: convertToSlug(String(formData.get("label"))),
        link: link,
      };

      const slug = formData.has("slug") && String(formData.get("slug"));
      if (slug) {
        mutationData.slug = slug;
      }

      if (action === "edit") {
        if (!shortLink) return;
        submit.mutate({
          action: "edit",
          id: convertToSlug(shortLink.id),
          ...mutationData,
        });
      } else {
        submit.mutate(
          { action: "create", ...mutationData },
          {
            onSuccess: async () => {
              await router.push("/admin/short-links");
            },
          },
        );
      }
    },
    [action, shortLink, router, submit],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {submit.error && (
        <MessageBox variant="failure">
          <ProcedureErrorMessage error={submit.error} />
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Short link updated!</MessageBox>
      )}

      <Fieldset legend="Short link">
        <TextField
          label="Name"
          name="label"
          value={label}
          onChange={setLabel}
          isRequired
        />
        <TextField
          label="Slug (Public URL, alphanumeric, dashes allowed)"
          name="slug"
          inputMode="url"
          pattern={SLUG_PATTERN}
          defaultValue={shortLink?.slug || ""}
          inputClassName="font-mono"
          placeholder={convertToSlug(label)}
          prefix={
            <div className="cursor-default select-none pl-2 font-mono">{`${getShortBaseUrl()}/l/`}</div>
          }
        />
        <TextField
          defaultValue={shortLink?.link || ""}
          label="URL"
          name="url"
          inputMode="url"
          isRequired
          type="url"
          inputClassName="font-mono"
          placeholder="https://twitch.tv/alveussanctuary"
        />
      </Fieldset>

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
