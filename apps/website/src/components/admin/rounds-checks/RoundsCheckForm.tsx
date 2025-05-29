import { useRouter } from "next/router";
import { type FormEvent, useCallback, useState } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";

import type { RoundsCheck } from "@alveusgg/database";

import type { RoundsCheckSchema } from "@/server/db/rounds-checks";

import { typeSafeObjectEntries } from "@/utils/helpers";
import { SLUG_PATTERN, convertToSlug } from "@/utils/slugs";
import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextField } from "@/components/shared/form/TextField";

type RoundsCheckFormProps = {
  action: "create" | "edit";
  check?: RoundsCheck;
};

export function RoundsCheckForm({ action, check }: RoundsCheckFormProps) {
  const router = useRouter();
  const submit = trpc.adminRoundsChecks.createOrEditRoundsCheck.useMutation();

  const [name, setName] = useState(check?.name || "");
  const [ambassador, setAmbassador] = useState(check?.ambassador || "");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      const mutationData: RoundsCheckSchema = {
        name: String(formData.get("name")),
        command: convertToSlug(String(formData.get("name"))),
        ambassador: String(formData.get("ambassador")),
        hidden: check?.hidden ?? false,
      };

      const command =
        formData.has("command") && String(formData.get("command"));
      if (command) {
        mutationData.command = command;
      }

      if (action === "edit") {
        if (!check) return;
        submit.mutate({
          action: "edit",
          id: check.id,
          ...mutationData,
        });
      } else {
        submit.mutate(
          { action: "create", ...mutationData },
          {
            onSuccess: async () => {
              await router.push("/admin/rounds-checks");
            },
          },
        );
      }
    },
    [action, check, router, submit],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {submit.error && (
        <MessageBox variant="failure">
          <pre>{submit.error.message}</pre>
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Rounds check updated!</MessageBox>
      )}

      <Fieldset legend="Rounds check">
        <TextField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          isRequired
        />

        <TextField
          label="Command (alphanumeric, dashes allowed)"
          name="command"
          defaultValue={check?.command || ""}
          pattern={SLUG_PATTERN}
          inputClassName="font-mono"
          placeholder={convertToSlug(name)}
          prefix={
            <div className="cursor-default pl-2 font-mono select-none">
              !check
            </div>
          }
        />

        <SelectBoxField
          label="Ambassador (image)"
          name="ambassador"
          required
          value={ambassador}
          onChange={(event) => setAmbassador(event.target.value)}
        >
          {typeSafeObjectEntries(ambassadors)
            .filter(isActiveAmbassadorEntry)
            .map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
        </SelectBoxField>
      </Fieldset>

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
