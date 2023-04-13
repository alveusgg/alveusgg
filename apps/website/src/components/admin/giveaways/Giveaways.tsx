import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import React, { useCallback, useState } from "react";

import {
  TrashIcon,
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import type { AppRouter } from "@/server/trpc/router/_app";
import { trpc } from "@/utils/trpc";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/Button";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { LocalDateTime } from "@/components/shared/LocalDateTime";
import { ModalDialog } from "@/components/shared/ModalDialog";

type RouterOutput = inferRouterOutputs<AppRouter>;
type GiveawayWithCount = RouterOutput["adminGiveaways"]["getGiveaways"][number];

const nf = new Intl.NumberFormat();

type GiveawayProps = {
  giveaway: GiveawayWithCount;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function Giveaway({ giveaway, onError, onUpdate }: GiveawayProps) {
  const deleteMutation = trpc.adminGiveaways.deleteGiveaway.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const purgeEntriesMutation =
    trpc.adminGiveaways.purgeGiveawayEntries.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });
  const anonymizeGiveawayEntriesMutation =
    trpc.adminGiveaways.anonymizeGiveawayEntries.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });
  const toggleGiveawayStatus =
    trpc.adminGiveaways.toggleGiveawayStatus.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });

  const handleToggle = useCallback(() => {
    toggleGiveawayStatus.mutate({ id: giveaway.id, active: !giveaway.active });
  }, [giveaway.active, giveaway.id, toggleGiveawayStatus]);

  const updateGiveawayOutgoingWebhookUrl =
    trpc.adminGiveaways.updateGiveawayOutgoingWebhookUrl.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });

  const handleWebhookUrl = useCallback(() => {
    const oldUrl = giveaway.outgoingWebhookUrl;
    const newUrl = window.prompt("Webhook URL", oldUrl || "");
    if (newUrl !== null && newUrl !== oldUrl) {
      updateGiveawayOutgoingWebhookUrl.mutate({
        id: giveaway.id,
        outgoingWebhookUrl: newUrl,
      });
    }
  }, [
    giveaway.outgoingWebhookUrl,
    giveaway.id,
    updateGiveawayOutgoingWebhookUrl,
  ]);

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-1">
          <Button
            size="small"
            width="auto"
            onClick={handleToggle}
            title={giveaway.active ? "close giveaway" : "open giveaway"}
          >
            {giveaway.active ? "✅" : "❌"}
            <span className="sr-only">
              {giveaway.active ? "is open" : "is closed"}
            </span>
          </Button>
        </td>
        <td className="w-1/2 p-1">
          <div className="flex flex-col gap-0.5">
            <div className="text-xl">{giveaway.label}</div>
            <div className="flex flex-col gap-1">
              <Link
                className="underline"
                href={`/giveaways/${giveaway.slug || giveaway.id}`}
                target="_blank"
              >
                Public Link: {giveaway.slug || giveaway.id}
              </Link>
              <button
                type="button"
                className="text-left"
                onClick={handleWebhookUrl}
              >
                Webhook URL: {giveaway.outgoingWebhookUrl || "-/-"}
              </button>
            </div>
          </div>
        </td>
        <td className="p-1 px-4 text-right tabular-nums">
          {nf.format(giveaway._count.entries)}
        </td>
        <td className="p-1 tabular-nums">
          <LocalDateTime dateTime={giveaway.startAt} />
          <br />
          {giveaway.endAt ? (
            <LocalDateTime dateTime={giveaway.endAt} />
          ) : (
            "(open end)"
          )}
        </td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/giveaways/${giveaway.id}/edit`}
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </LinkButton>
          <LinkButton
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            href={`/api/giveaways/${giveaway.id}/export-entries`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            CSV
          </LinkButton>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button as={Button}>
              <EllipsisHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu with more options</span>
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-20 mt-2 flex w-56 origin-top-right flex-col gap-2 rounded-md border border-white/50 bg-gray-800 p-4 shadow-xl">
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm deletion!"
                  onClick={() => deleteMutation.mutate(giveaway.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm removing all PII from entries!"
                  onClick={() =>
                    anonymizeGiveawayEntriesMutation.mutate(giveaway.id)
                  }
                >
                  Remove PII
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm purging all entries!"
                  onClick={() => purgeEntriesMutation.mutate(giveaway.id)}
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

export function Giveaways() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const giveaways = trpc.adminGiveaways.getGiveaways.useQuery();

  return (
    <>
      <Headline>Giveaways</Headline>

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
            {giveaways.data?.map((giveaway) => (
              <Giveaway
                key={giveaway.id}
                giveaway={giveaway}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => giveaways.refetch()}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex">
          <LinkButton href="/admin/giveaways/create" size="small" width="auto">
            + Create Giveaway
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
