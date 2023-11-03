import { useSession } from "next-auth/react";
import { useEffect, useReducer } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { z } from "zod";

import { transposeMatrix } from "@/utils/math";
import {
  type BingoValue,
  bingoLiveDataSchema,
  bingoValueSchema,
} from "@/utils/bingo";
import { trpc } from "@/utils/trpc";

import IconLoading from "@/icons/IconLoading";

import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { Button } from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { BingoCard } from "@/components/bingo/BingoCard";
import Heading from "@/components/content/Heading";

type BingoLocalState = z.infer<typeof bingoLocalStateSchema>;

const bingoLocalStateSchema = z.object({
  selectedValues: z.array(bingoValueSchema),
});

type BingoAction =
  | {
      type: "SELECT" | "DESELECT";
      value: BingoValue;
    }
  | {
      type: "SET";
      values: BingoValue[];
    }
  | {
      type: "UPDATE_SELECTABLE";
      selectableValues: BingoValue[];
    }
  | {
      type: "RESET";
    };

const bingoStateReducer = (state: BingoLocalState, action: BingoAction) => {
  switch (action.type) {
    case "SELECT":
      return {
        ...state,
        selectedValues: [...state.selectedValues, action.value],
      };
    case "DESELECT":
      return {
        ...state,
        selectedValues: state.selectedValues.filter(
          (cell) => cell !== action.value,
        ),
      };
    case "UPDATE_SELECTABLE":
      return {
        ...state,
        selectedValues: state.selectedValues.filter((value) =>
          action.selectableValues.includes(value),
        ),
      };
    case "RESET":
      return {
        ...state,
        selectedValues: [],
      };
    case "SET":
      return {
        ...state,
        selectedValues: action.values,
      };
    default:
      return state;
  }
};

function PlayGame({ bingoId }: { bingoId: string }) {
  const entryQuery = trpc.bingos.enterBingo.useQuery(
    {
      bingoId,
    },
    {
      retry: 1,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 20_000,
    },
  );

  const bingoLiveDataQuery = useQuery({
    queryKey: ["bingo", bingoId],
    queryFn: async () => {
      const res = await fetch(`/api/bingo/${encodeURIComponent(bingoId)}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await res.json();

      return bingoLiveDataSchema.parseAsync(json);
    },
    refetchInterval: 2000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const bingoData = bingoLiveDataQuery.data;

  const localStorageKey = `bingo-${bingoId}`;

  const [state, dispatch] = useReducer(bingoStateReducer, {
    selectedValues: [],
  });

  useEffect(() => {
    const localState = localStorage.getItem(localStorageKey);
    if (localState) {
      try {
        const restoredState = bingoLocalStateSchema.parse(
          JSON.parse(localState),
        );
        dispatch({ type: "SET", values: restoredState.selectedValues });
      } catch (e) {
        console.error(e);
      }
    }
  }, [localStorageKey]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [bingoId, localStorageKey, state]);

  const selectableValues = bingoData?.calledValues;
  useEffect(() => {
    if (selectableValues) {
      dispatch({
        type: "UPDATE_SELECTABLE",
        selectableValues,
      });
    }
  }, [selectableValues]);

  if (entryQuery.error) {
    return (
      <MessageBox variant="warning">
        <strong>Bingo not found!</strong>
        <p>
          The bingo you are trying to play does not exist or has been ended.
        </p>
      </MessageBox>
    );
  }

  if (!entryQuery.data) {
    return (
      <MessageBox variant="default" className="flex items-center">
        <IconLoading className="mr-2 h-5 w-5 animate-spin" />
        Checking your entry…
      </MessageBox>
    );
  }

  const permutation = entryQuery.data?.entry.permutation;
  const config = entryQuery.data.bingo.config;
  const cells = config.cards[permutation];
  if (!cells) {
    return (
      <MessageBox variant="failure">
        Cannot load bingo card (Invalid permutation)!
      </MessageBox>
    );
  }

  const size = cells.length;
  const transposedCells = transposeMatrix(cells);

  return (
    <div className="flex flex-col items-center">
      <BingoCard
        size={size}
        card={transposedCells}
        selectedValues={state.selectedValues}
        selectableValues={selectableValues ?? []}
        onSelect={(value) => {
          dispatch({ type: "SELECT", value });
        }}
        onDeselect={(value) => {
          dispatch({ type: "DESELECT", value });
        }}
      />

      <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
        <p>
          You have card {permutation + 1} / {config.numberOfCards}
        </p>
        <Button
          size="small"
          width="auto"
          onClick={() => {
            dispatch({ type: "RESET" });
          }}
        >
          Reset card
        </Button>
      </div>
    </div>
  );
}

const PlayBingoPage = () => {
  const session = useSession();
  const router = useRouter();
  const bingoId = String(router.query.bingoId);

  return (
    <>
      <Meta title="Alveus Bingo" description="Alveus Bingo" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section>
        <Heading className="mb-10">Alveus Bingo</Heading>
        {session.status !== "authenticated" && (
          <>
            <MessageBox>
              <p className="mb-4">Log in with Twitch to play Bingo.</p>

              <LoginWithTwitchButton />
            </MessageBox>
          </>
        )}

        {session.status === "authenticated" && session.data && (
          <PlayGame bingoId={bingoId} />
        )}
      </Section>
    </>
  );
};

export default PlayBingoPage;
