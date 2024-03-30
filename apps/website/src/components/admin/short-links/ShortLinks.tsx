import { useState } from "react";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/utils/trpc";
import {
  Button,
  dangerButtonClasses,
  LinkButton,
} from "@/components/shared/form/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import type { AppRouter } from "@/server/trpc/router/_app";
import { getShortBaseUrl } from "@/utils/short-url";
type RouterOutput = inferRouterOutputs<AppRouter>;
type ShortLink = RouterOutput["adminShortLinks"]["getShortLinks"][number];

type LinkProps = {
  shortLink: ShortLink;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function ShortLink({ shortLink, onError, onUpdate }: LinkProps) {
  const deleteMutation = trpc.adminShortLinks.deleteShortLink.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const clicks = trpc.adminShortLinks.getShortLinkClicks.useQuery();
  const clicksMap = new Map(clicks.data?.map((c) => [c.id, c.clicks]));

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="w-1/2 p-1">
          <div className="flex flex-col gap-0.5">
            <div className="text-xl">{shortLink.label}</div>
            <div className="flex flex-col gap-1">
              <Link
                href={`/l/${shortLink.slug}`}
                target="_blank"
                className="flex"
              >
                <div className="mr-1.5">Public Link:</div>
                <div className="underline">
                  {getShortBaseUrl() + "/l/" + shortLink.slug}
                </div>
              </Link>
            </div>
          </div>
        </td>
        <td>
          <Link className="underline" href={shortLink.link} target="_blank">
            {shortLink.link}
          </Link>
        </td>
        <td>{clicksMap.get(shortLink.id)}</td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/short-links/${shortLink.id}/edit`}
          >
            <IconPencil className="h-4 w-4" />
            Edit
          </LinkButton>

          <Button
            size="small"
            width="auto"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteMutation.mutate(shortLink.id)}
          >
            <IconTrash className="h-4 w-4" />
            Delete
          </Button>
        </td>
      </tr>
    </>
  );
}

export function ShortLinks() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const links = trpc.adminShortLinks.getShortLinks.useQuery();

  return (
    <>
      <Headline>Short Links</Headline>

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
              <th className="text-left">Name</th>
              <th className="text-left">Redirects to</th>
              <th className="text-left">Clicks</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.data?.map((link) => (
              <ShortLink
                key={link.id}
                shortLink={link}
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
            + Create short link
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
