import { useState } from "react";

import type { RoundsCheck } from "@alveusgg/database";

import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { ModalDialog } from "@/components/shared/ModalDialog";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
} from "@/components/shared/form/Button";

import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

type CheckProps = {
  check: RoundsCheck;
  onError: (error: string) => void;
  onUpdate: () => void;
};

function RoundsCheck({ check, onError, onUpdate }: CheckProps) {
  const deleteMutation = trpc.adminRoundsChecks.deleteRoundsCheck.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  return (
    <>
      <tr className="border-b border-gray-700">
        <td>{check.name}</td>
        <td>{`!check ${check.command}`}</td>
        <td className="flex flex-row flex-wrap gap-2 p-1">
          <LinkButton
            size="small"
            width="auto"
            href={`/admin/rounds-checks/${check.id}/edit`}
          >
            <IconPencil className="size-4" />
            Edit
          </LinkButton>

          <Button
            size="small"
            width="auto"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteMutation.mutate(check.id)}
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </td>
      </tr>
    </>
  );
}

export function RoundsChecks() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checks = trpc.adminRoundsChecks.getRoundsChecks.useQuery();

  return (
    <>
      <Headline>Rounds Checks</Headline>

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
              <th className="text-left">Command</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checks.data?.map((check) => (
              <RoundsCheck
                key={check.id}
                check={check}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => checks.refetch()}
              />
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex">
          <LinkButton
            href="/admin/rounds-checks/create"
            size="small"
            width="auto"
          >
            + Create rounds check
          </LinkButton>
        </div>
      </Panel>
    </>
  );
}
