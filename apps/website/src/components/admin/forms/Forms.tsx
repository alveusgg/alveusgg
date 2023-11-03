import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Menu } from "@headlessui/react";

import type { AppRouter } from "@/server/trpc/router/_app";
import { trpc } from "@/utils/trpc";

import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/Button";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import DateTime from "@/components/content/DateTime";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import IconEllipsis from "@/icons/IconEllipsis";
import IconDownload from "@/icons/IconDownload";

type RouterOutput = inferRouterOutputs<AppRouter>;
type FormWithCount = RouterOutput["adminForms"]["getForms"][number];

const nf = new Intl.NumberFormat();

type FormProps = {
  form: FormWithCount;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function Form({ form, onError, onUpdate }: FormProps) {
  const deleteMutation = trpc.adminForms.deleteForm.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const purgeEntriesMutation = trpc.adminForms.purgeFormEntries.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const anonymizeFormEntriesMutation =
    trpc.adminForms.anonymizeFormEntries.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });
  const toggleFormStatus = trpc.adminForms.toggleFormStatus.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  const handleToggle = useCallback(() => {
    toggleFormStatus.mutate({ id: form.id, active: !form.active });
  }, [form.active, form.id, toggleFormStatus]);

  const updateFormOutgoingWebhookUrl =
    trpc.adminForms.updateFormOutgoingWebhookUrl.useMutation({
      onError: (error) => onError(error.message),
      onSettled: () => onUpdate(),
    });

  const handleWebhookUrl = useCallback(() => {
    const oldUrl = form.outgoingWebhookUrl;
    const newUrl = window.prompt("Webhook URL", oldUrl || "");
    if (newUrl !== null && newUrl !== oldUrl) {
      updateFormOutgoingWebhookUrl.mutate({
        id: form.id,
        outgoingWebhookUrl: newUrl,
      });
    }
  }, [form.outgoingWebhookUrl, form.id, updateFormOutgoingWebhookUrl]);

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className="p-1">
          <Button
            size="small"
            width="auto"
            onClick={handleToggle}
            title={form.active ? "close form" : "open form"}
          >
            {form.active ? "✅" : "❌"}
            <span className="sr-only">
              {form.active ? "is open" : "is closed"}
            </span>
          </Button>
        </td>
        <td className="w-1/2 p-1">
          <div className="flex flex-col gap-0.5">
            <div className="text-xl">{form.label}</div>
            <div className="flex flex-col gap-1">
              <Link
                className="underline"
                href={`/forms/${form.slug || form.id}`}
                target="_blank"
              >
                Public Link: {form.slug || form.id}
              </Link>
              <button
                type="button"
                className="text-left"
                onClick={handleWebhookUrl}
              >
                Webhook URL: {form.outgoingWebhookUrl || "-/-"}
              </button>
            </div>
          </div>
        </td>
        <td className="p-1 px-4 text-right tabular-nums">
          {nf.format(form._count.entries)}
        </td>
        <td className="p-1 tabular-nums">
          <DateTime date={form.startAt} format={{ time: "minutes" }} />
          <br />
          {form.endAt ? (
            <DateTime date={form.endAt} format={{ time: "minutes" }} />
          ) : (
            "(open end)"
          )}
        </td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/forms/${form.id}/edit`}
          >
            <IconPencil className="h-4 w-4" />
            Edit
          </LinkButton>
          <LinkButton
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            href={`/api/admin/forms/${form.id}/export-entries`}
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
                  onClick={() => deleteMutation.mutate(form.id)}
                >
                  <IconTrash className="h-4 w-4" />
                  Delete
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm removing all PII from entries!"
                  onClick={() => anonymizeFormEntriesMutation.mutate(form.id)}
                >
                  Remove PII
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm purging all entries!"
                  onClick={() => purgeEntriesMutation.mutate(form.id)}
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

export function Forms() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const forms = trpc.adminForms.getForms.useQuery();

  return (
    <>
      <Headline>Forms</Headline>

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
            {forms.data?.map((form) => (
              <Form
                key={form.id}
                form={form}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => forms.refetch()}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex">
          <LinkButton href="/admin/forms/create" size="small" width="auto">
            + Create Form
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
