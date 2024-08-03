import type { inferRouterOutputs } from "@trpc/server";
import { useCallback, useState } from "react";
import { Menu } from "@headlessui/react";

import type { AppRouter } from "@/server/trpc/router/_app";

import { trpc } from "@/utils/trpc";
import { getShortBaseUrl } from "@/utils/short-url";

import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import IconEllipsis from "@/icons/IconEllipsis";
import IconDownload from "@/icons/IconDownload";

import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import DateTime from "@/components/content/DateTime";
import Link from "@/components/content/Link";

type RouterOutput = inferRouterOutputs<AppRouter>;
type BingoWithCount = RouterOutput["adminBingos"]["getBingos"][number];

const nf = new Intl.NumberFormat();

type BingoProps = {
  bingo: BingoWithCount;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function Bingo({ bingo, onError, onUpdate }: BingoProps) {
  const deleteMutation = trpc.adminBingos.deleteBingo.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const purgeEntriesMutation = trpc.adminBingos.purgeBingoEntries.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const toggleBingoStatus = trpc.adminBingos.toggleBingoStatus.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  const handleToggle = useCallback(() => {
    toggleBingoStatus.mutate({ id: bingo.id, active: !bingo.active });
  }, [bingo.active, bingo.id, toggleBingoStatus]);

  const updateBingoOutgoingWebhookUrl =
    trpc.adminBingos.updateBingoOutgoingWebhookUrl.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });

  const handleWebhookUrl = useCallback(() => {
    const oldUrl = bingo.outgoingWebhookUrl;
    const newUrl = window.prompt("Webhook URL", oldUrl || "");
    if (newUrl !== null && newUrl !== oldUrl) {
      updateBingoOutgoingWebhookUrl.mutate({
        id: bingo.id,
        outgoingWebhookUrl: newUrl,
      });
    }
  }, [bingo.outgoingWebhookUrl, bingo.id, updateBingoOutgoingWebhookUrl]);

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-1">
          <Button
            size="small"
            width="auto"
            onClick={handleToggle}
            title={bingo.active ? "close bingo" : "open bingo"}
          >
            {bingo.active ? "✅" : "❌"}
            <span className="sr-only">
              {bingo.active ? "is open" : "is closed"}
            </span>
          </Button>
        </td>
        <td className="w-1/2 p-1">
          <div className="flex flex-col gap-0.5">
            <div className="text-xl">
              <Link href={`/admin/bingo/${bingo.id}/live`}>{bingo.label}</Link>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                Public Link:
                <Link
                  href={`${getShortBaseUrl()}/bingo/play/${
                    bingo.slug || bingo.id
                  }`}
                  external
                >
                  {`${getShortBaseUrl()}/bingo/play/${bingo.slug || bingo.id}`}
                </Link>
              </div>
              <button
                type="button"
                className="text-left"
                onClick={handleWebhookUrl}
              >
                Webhook URL: {bingo.outgoingWebhookUrl || "-/-"}
              </button>
            </div>
          </div>
        </td>
        <td className="p-1 px-4 text-right tabular-nums">
          {nf.format(bingo._count.entries)}
        </td>
        <td className="p-1 tabular-nums">
          <DateTime date={bingo.startAt} format={{ time: "minutes" }} />
          <br />
          {bingo.endAt ? (
            <DateTime date={bingo.endAt} format={{ time: "minutes" }} />
          ) : (
            "(open end)"
          )}
        </td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/bingo/${bingo.id}/edit`}
          >
            <IconPencil className="h-4 w-4" />
            Edit
          </LinkButton>
          <LinkButton
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            href={`/api/admin/bingo/${bingo.id}/winners`}
            target="_blank"
          >
            Winners (all)
          </LinkButton>
          <LinkButton
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            href={`/api/admin/bingo/${bingo.id}/winners?claimed=true`}
            target="_blank"
          >
            Winners (claimed)
          </LinkButton>
          <LinkButton
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            href={`/api/admin/bingo/${bingo.id}/export-entries`}
          >
            <IconDownload className="h-4 w-4" />
            CSV
          </LinkButton>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button as={Button}>
              <IconEllipsis className="h-4 w-4" />
              <span className="sr-only">Open menu with more options</span>
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-20 mt-2 flex w-56 origin-top-right flex-col gap-2 rounded-md border border-white/50 bg-gray-800 p-4 shadow-xl">
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm deletion!"
                  onClick={() => deleteMutation.mutate(bingo.id)}
                >
                  <IconTrash className="h-4 w-4" />
                  Delete
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm purging all entries!"
                  onClick={() => purgeEntriesMutation.mutate(bingo.id)}
                >
                  Purge entries
                </Button>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </td>
      </tr>
    </>
  );
}

export function BingoList() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const bingos = trpc.adminBingos.getBingos.useQuery();

  return (
    <>
      <Headline>Bingos</Headline>

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
              <th className="text-left">#</th>
              <th className="text-left">Start/End</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bingos.data?.map((bingo) => (
              <Bingo
                key={bingo.id}
                bingo={bingo}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => bingos.refetch()}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex">
          <LinkButton href="/admin/bingo/create" size="small" width="auto">
            + Create Bingo
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
