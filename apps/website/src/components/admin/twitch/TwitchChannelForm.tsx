import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useCallback } from "react";

import type { TwitchChannel } from "@/server/db/client";

import { trpc } from "@/utils/trpc";

import { MessageBox } from "@/components/shared/MessageBox";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";

type TwitchChannelFormProps = {
  action: "create" | "edit";
  data?: TwitchChannel;
};

export function TwitchChannelForm({ action, data }: TwitchChannelFormProps) {
  const router = useRouter();
  const submit = trpc.adminTwitch.createOrEditChannel.useMutation();

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const label = String(formData.get("label"));

      if (action === "edit") {
        if (!data) return;
        submit.mutate({
          action: "edit",
          channelId: data.channelId,
          label,
        });
      } else {
        submit.mutate(
          {
            action: "create",
            label,
            username: String(formData.get("username")),
          },
          {
            onSuccess: async () => {
              await router.push(`/admin/twitch`);
            },
          },
        );
      }
    },
    [action, data, router, submit],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {submit.error && (
        <MessageBox variant="failure">
          <pre>{submit.error.message}</pre>
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Twitch channel updated!</MessageBox>
      )}

      <Fieldset legend="Twitch Channel">
        <TextField
          label="Username"
          name="username"
          defaultValue={data?.username}
          isReadOnly={action === "edit"}
          isRequired
        />

        {action === "edit" ? (
          <TextField
            label="Channel-ID"
            name="channelId"
            defaultValue={data?.channelId}
            isReadOnly
            isRequired
          />
        ) : null}

        <TextField
          label="Internal label (optional)"
          name="label"
          defaultValue={data?.label}
        />
      </Fieldset>

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
