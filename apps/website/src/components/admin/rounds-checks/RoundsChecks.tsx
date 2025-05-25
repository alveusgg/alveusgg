import { useState } from "react";

import type { RoundsCheck } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { ModalDialog } from "@/components/shared/ModalDialog";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowUp from "@/icons/IconArrowUp";
import IconEye from "@/icons/IconEye";
import IconEyeSlash from "@/icons/IconEyeSlash";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

type CheckProps = {
  check: RoundsCheck;
  onError: (error: string) => void;
  onUpdate: () => void;
  first?: boolean;
  last?: boolean;
};

function RoundsCheck({ check, onError, onUpdate, first, last }: CheckProps) {
  const deleteMutation = trpc.adminRoundsChecks.deleteRoundsCheck.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const editMutation = trpc.adminRoundsChecks.editRoundsCheck.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });
  const moveMutation = trpc.adminRoundsChecks.moveRoundsCheck.useMutation({
    onError: (error) => onError(error.message),
    onSettled: () => onUpdate(),
  });

  return (
    <>
      <tr className="border-b border-gray-700">
        <td className={classes(check.hidden && "opacity-50")}>{check.name}</td>
        <td
          className={classes(check.hidden && "opacity-50")}
        >{`!check ${check.command}`}</td>
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

          <Button
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            title="Move up"
            onClick={() =>
              moveMutation.mutate({
                id: check.id,
                direction: "up",
              })
            }
            disabled={first}
          >
            <IconArrowUp className="size-5" />
          </Button>

          <Button
            size="small"
            width="auto"
            className={secondaryButtonClasses}
            title="Move down"
            onClick={() =>
              moveMutation.mutate({
                id: check.id,
                direction: "down",
              })
            }
            disabled={last}
          >
            <IconArrowDown className="size-5" />
          </Button>

          <Button
            size="small"
            width="auto"
            className={classes(
              secondaryButtonClasses,
              check.hidden && "opacity-75",
            )}
            title={`${check.hidden ? "Show" : "Hide"} check`}
            onClick={() =>
              editMutation.mutate({
                id: check.id,
                hidden: !check.hidden,
              })
            }
          >
            {check.hidden ? (
              <IconEyeSlash className="size-5" />
            ) : (
              <IconEye className="size-5" />
            )}
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
            {checks.data?.map((check, idx, arr) => (
              <RoundsCheck
                key={check.id}
                check={check}
                onError={(err) => setErrorMessage(err)}
                onUpdate={() => checks.refetch()}
                first={idx === 0}
                last={idx === arr.length - 1}
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
