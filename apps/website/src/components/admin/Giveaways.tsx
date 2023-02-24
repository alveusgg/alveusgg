import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useCallback } from "react";

import type { AppRouter } from "../../server/trpc/router/_app";
import { trpc } from "../../utils/trpc";
import { Button, LinkButton } from "../shared/Button";

import { Headline } from "./Headline";
import { Panel } from "./Panel";

type RouterOutput = inferRouterOutputs<AppRouter>;
type GiveawayWithCount = RouterOutput["adminGiveaways"]["getGiveaways"][number];

const nf = new Intl.NumberFormat();

const Giveaway: React.FC<{ giveaway: GiveawayWithCount }> = ({ giveaway }) => {
  const utils = trpc.useContext();
  const toggleGiveawayStatus =
    trpc.adminGiveaways.toggleGiveawayStatus.useMutation({
      onSuccess: async () => {
        await utils.adminGiveaways.getGiveaways.invalidate();
      },
    });

  const handleToggle = useCallback(() => {
    toggleGiveawayStatus.mutate({ id: giveaway.id, active: !giveaway.active });
  }, [giveaway.active, giveaway.id, toggleGiveawayStatus]);

  const updateGiveawayOutgoingWebhookUrl =
    trpc.adminGiveaways.updateGiveawayOutgoingWebhookUrl.useMutation({
      onSuccess: async () => {
        await utils.adminGiveaways.getGiveaways.invalidate();
      },
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
    <tr className="border-b border-gray-700">
      <td className="p-1">{giveaway.active ? "✅" : "❌"}</td>
      <td className="p-1">
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
      <td className="p-1 text-right tabular-nums">
        {nf.format(giveaway._count.entries)}
      </td>
      <td className="flex w-[40px] flex-row flex-wrap gap-2 p-1">
        <Button size="small" width="auto" onClick={handleToggle}>
          {giveaway.active ? "Close" : "Open"}
        </Button>
        <LinkButton
          size="small"
          width="auto"
          href={`/api/giveaways/${giveaway.id}/export-entries`}
        >
          &dArr;&nbsp;CSV
        </LinkButton>
      </td>
    </tr>
  );
};

export const Giveaways: React.FC = () => {
  const giveaways = trpc.adminGiveaways.getGiveaways.useQuery();

  return (
    <>
      <Headline>Giveaways</Headline>

      <Panel>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left">Active</th>
              <th className="text-left">Name</th>
              <th className="text-left">No. Entries</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {giveaways.data?.map((giveaway) => (
              <Giveaway key={giveaway.id} giveaway={giveaway} />
            ))}
          </tbody>
        </table>

        <form className="mt-10">TODO: Add new giveaways …</form>
      </Panel>
    </>
  );
};
