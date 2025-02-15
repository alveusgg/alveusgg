import type { FormEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import type { Bingo } from "@prisma/client";
import { useRouter } from "next/router";

import { env } from "@/env";

import { trpc } from "@/utils/trpc";
import type { BingoType } from "@/utils/bingo";
import {
  bingoCardsSchema,
  bingoTypeDefs,
  bingoTypes,
  isBingoType,
  generateBingoCards,
  calcBingoConfig,
} from "@/utils/bingo";
import { convertToSlug, SLUG_PATTERN } from "@/utils/slugs";
import {
  inputValueDatetimeLocalToUtc,
  utcToInputValueDatetimeLocal,
} from "@/utils/local-datetime";

import { type BingoSchema } from "@/server/db/bingos";

import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";
import { MessageBox } from "@/components/shared/MessageBox";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { NumberField } from "@/components/shared/form/NumberField";

type BingoFormProps = {
  action: "create" | "edit";
  bingo?: Bingo;
};

const size = 5; // TODO: Make this editable

export function BingoForm({ action, bingo }: BingoFormProps) {
  const router = useRouter();
  const submit = trpc.adminBingos.createOrEditBingo.useMutation();

  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<BingoType>(
    (bingo?.type || "75-ball") as BingoType,
  );

  const config = useMemo(() => bingo && calcBingoConfig(bingo.config), [bingo]);
  const [numberOfCards, setNumberOfCards] = useState(
    config?.numberOfCards || 10,
  );
  const [label, setLabel] = useState(bingo?.label || "");
  const initialCardsFormatted = useMemo(() => {
    if (!config) return "";
    return JSON.stringify(config.cards, null, 2);
  }, [config]);

  const cardsInputRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateCards = useCallback(() => {
    const freeSpace = Math.floor((size * size) / 2);
    const cards = generateBingoCards(type, numberOfCards, size, freeSpace);
    const inputElement = cardsInputRef.current;
    if (inputElement) inputElement.value = JSON.stringify(cards, null, 2);
  }, [numberOfCards, type]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      try {
        const parsedCardsData = bingoCardsSchema.safeParse(
          JSON.parse(String(formData.get("cards"))),
        );

        if (!parsedCardsData.success) {
          setError("Invalid cards: " + parsedCardsData.error.message);
          return;
        }

        if (parsedCardsData.data.length !== numberOfCards) {
          setError(
            `Invalid number of cards. Expected ${numberOfCards}, got ${parsedCardsData.data.length}.`,
          );
          return;
        }

        const mutationData: BingoSchema = {
          type,
          label: String(formData.get("label")),
          config: {
            size,
            numberOfCards,
            cards: parsedCardsData.data,
          },
        };

        const slug = formData.has("slug") && String(formData.get("slug"));
        if (slug && slug !== "") {
          mutationData.slug = slug;
        }

        const startAt =
          formData.has("startAt") && String(formData.get("startAt"));
        if (startAt && startAt !== "") {
          mutationData.startAt = inputValueDatetimeLocalToUtc(startAt);
        }

        const endAt = formData.has("endAt") && String(formData.get("endAt"));
        if (endAt && endAt !== "") {
          mutationData.endAt = inputValueDatetimeLocalToUtc(endAt);
        }

        if (action === "edit") {
          if (!bingo) return;
          submit.mutate({ action: "edit", id: bingo.id, ...mutationData });
        } else {
          submit.mutate(
            { action: "create", ...mutationData },
            {
              onSuccess: async () => {
                await router.push(`/admin/bingo`);
              },
            },
          );
        }
        setError(null);
      } catch (_) {
        setError("Failed to parse cards JSON");
      }
    },
    [action, bingo, numberOfCards, router, submit, type],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {(submit.error || error) && (
        <MessageBox variant="failure">
          {submit.error?.message && <pre>{submit.error.message}</pre>}
          {error && <pre>{error}</pre>}
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Bingo updated!</MessageBox>
      )}

      <Fieldset legend="Bingo">
        <TextField
          label="Name"
          name="label"
          value={label}
          onChange={setLabel}
        />
        <TextField
          label="Slug (Public URL, alphanumeric, dashes allowed)"
          name="slug"
          pattern={SLUG_PATTERN}
          inputMode="url"
          defaultValue={bingo?.slug || ""}
          inputClassName="font-mono"
          placeholder={convertToSlug(label)}
          prefix={
            <div className="cursor-default pl-2 font-mono select-none">{`${env.NEXT_PUBLIC_BASE_URL}/bingo/`}</div>
          }
        />
      </Fieldset>

      <Fieldset legend="Bingo settings">
        <FieldGroup>
          <SelectBoxField
            label="Game type"
            name="type"
            value={type}
            onChange={(event) => {
              const type = event?.target.value;
              if (!type || !isBingoType(type)) {
                setError("Invalid bingo type");
                return;
              }
              setType(type);
            }}
          >
            {bingoTypes.map((type) => (
              <option key={type} value={type}>
                {bingoTypeDefs[type].label}
              </option>
            ))}
          </SelectBoxField>
          <NumberField
            label="Number of cards"
            name="numberOfCards"
            className="max-w-[200px]"
            minValue={1}
            maxValue={99999}
            step={1}
            value={numberOfCards}
            onChange={(value) => {
              setNumberOfCards(value);
            }}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset legend={`Cards (${bingoTypeDefs[type].label})`}>
        <TextAreaField
          label="Card Data (JSON)"
          ref={cardsInputRef}
          name="cards"
          defaultValue={initialCardsFormatted ?? ""}
        />

        <Button
          width="auto"
          className={defaultButtonClasses}
          onClick={handleGenerateCards}
        >
          Generate cards
        </Button>
      </Fieldset>

      <Fieldset legend="Time and date">
        <FieldGroup>
          <LocalDateTimeField
            label="Start (Central Time)"
            name="startAt"
            defaultValue={utcToInputValueDatetimeLocal(bingo?.startAt)}
          />
          <LocalDateTimeField
            label="End (Central Time)"
            name="endAt"
            defaultValue={utcToInputValueDatetimeLocal(bingo?.endAt)}
          />
        </FieldGroup>
      </Fieldset>

      {action === "edit" && (
        <MessageBox variant="warning">
          Changing the bingo config will invalidate all claimed bingos!
          <br />
          If you change the amount of cards, you will need to purge all entries
          so users get assigned valid cards!
        </MessageBox>
      )}

      <Button
        type="submit"
        className={defaultButtonClasses}
        confirmationMessage={
          action === "edit"
            ? "Confirm invalidating claimed bingos! See note about changes to the number of cards too!"
            : undefined
        }
      >
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
