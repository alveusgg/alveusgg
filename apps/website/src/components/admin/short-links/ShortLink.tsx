import { useState } from "react";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/utils/trpc";
import {
  Button,
  dangerButtonClasses,
  LinkButton,
} from "@/components/shared/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import type { AppRouter } from "@/server/trpc/router/_app";
type RouterOutput = inferRouterOutputs<AppRouter>;
type FormWithCount = RouterOutput["adminShortLinks"]["getLinks"][number];

type LinkProps = {
  form: FormWithCount;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function ShortLinks({ form, onError, onUpdate }: LinkProps) {
  const deleteMutation = trpc.adminShortLinks.deleteLink.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-1">
          <Button size="small" width="auto">
            {"✅"}
          </Button>
        </td>
        <td className="w-1/2 p-1">
          <div className="flex flex-col gap-0.5">
            <div className="text-xl">{form.label}</div>
            <div className="flex flex-col gap-1">
              <Link
                className="underline"
                href={`/link/${form.slug || form.id}`}
                target="_blank"
              >
                Public Link: {form.slug || form.id}
              </Link>
            </div>
          </div>
        </td>
        <td className="">
          <Link className="underline" href={form.link} target="_blank">
            {form.link}
          </Link>
        </td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/short-links/${form.id}/edit`}
          >
            <IconPencil className="h-4 w-4" />
            Edit
          </LinkButton>

          <Button
            size="small"
            width="auto"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteMutation.mutate(form.id)}
          >
            <IconTrash className="h-4 w-4" />
            Delete
          </Button>
        </td>
      </tr>
    </>
  );
}

export function ShortLink() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const links = trpc.adminShortLinks.getLinks.useQuery();

  return (
    <>
      <Headline>Short links</Headline>

      {errorMessage && (
        <ModalDialog
          title="Could not perform action"
          closeModal={() => setErrorMessage(null)}
        >
          <p>{errorMessage}</p>
        </ModalDialog>
      )}

      <Panel>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left">Active</th>
              <th className="text-left">Name</th>
              <th className="text-left">Redirects to</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.data?.map((link) => (
              <ShortLinks
                key={link.id}
                form={link}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => links.refetch()}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex">
          <LinkButton
            href="/admin/short-links/create"
            size="small"
            width="auto"
          >
            + Create Short link
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
