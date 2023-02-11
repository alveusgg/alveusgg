import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useCallback } from "react";

import type { AppRouter } from "../../server/trpc/router/_app";
import { trpc } from "../../utils/trpc";

import { Headline } from "../shared/Headline";

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
    const newUrl = window.prompt("Webhook URL", String(oldUrl));
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
            <button type="button" onClick={handleWebhookUrl}>
              Webhook URL: {giveaway.outgoingWebhookUrl}
            </button>
          </div>
        </div>
      </td>
      <td className="p-1 text-right tabular-nums">
        {nf.format(giveaway._count.entries)}
      </td>
      <td className="p-1">
        <button
          className="mx-0.5 inline-block rounded-full bg-gray-600 py-0.5 px-2 text-white"
          onClick={handleToggle}
        >
          {giveaway.active ? "Close" : "Open"}
        </button>
        <Link
          href={`/api/giveaways/${giveaway.id}/export-entries`}
          className="mx-0.5 inline-block rounded-full bg-gray-600 py-0.5 px-2 text-white"
        >
          &dArr; CSV
        </Link>
      </td>
    </tr>
  );
};

export const Giveaways: React.FC = () => {
  const giveaways = trpc.adminGiveaways.getGiveaways.useQuery();

  return (
    <>
      <Headline>Giveaways</Headline>

      <div className="my-4 rounded-lg border bg-white p-4 shadow-xl">
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
      </div>
    </>
  );
};
