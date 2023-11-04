import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { bingoLiveDataSchema } from "@/utils/bingo";
import { trpc } from "@/utils/trpc";

import IconLoading from "@/icons/IconLoading";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { Button } from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { BingoCard, useBingoLocalState } from "@/components/bingo/BingoCard";

function PlayGame({ bingoId }: { bingoId: string }) {
  const { data, error } = trpc.bingos.enterBingo.useQuery(
    {
      bingoId,
    },
    {
      retry: 1,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 60_000,
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
    refetchInterval: 4000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [state, dispatch] = useBingoLocalState(bingoId);
  const selectableValues = bingoLiveDataQuery.data?.calledValues;
  useEffect(() => {
    if (selectableValues) {
      dispatch({
        type: "UPDATE_SELECTABLE",
        selectableValues,
      });
    }
  }, [dispatch, selectableValues]);

  const claimBingoMutation = trpc.bingos.claimBingo.useMutation();
  const hasClaimed = useRef(false);

  // Reset the claim state when the card or bingo id changes
  useEffect(() => {
    hasClaimed.current = false;
  }, [data?.bingo.config]);

  if (error) {
    return (
      <MessageBox variant="warning">
        <strong>Bingo not found!</strong>
        <p>
          The bingo you are trying to play does not exist or has been ended.
        </p>
      </MessageBox>
    );
  }

  if (!data) {
    return (
      <MessageBox variant="default" className="flex items-center">
        <IconLoading className="mr-2 h-5 w-5 animate-spin" />
        Checking your entry…
      </MessageBox>
    );
  }

  const { bingo, entry } = data;
  const card = bingo.config.cards[entry.permutation];
  if (!card) {
    return (
      <MessageBox variant="failure">
        Cannot load bingo card (Invalid permutation)!
      </MessageBox>
    );
  }

  return (
    <div className="flex flex-col">
      <BingoCard
        card={card}
        selectedValues={state.selectedValues}
        selectableValues={selectableValues ?? []}
        onSelect={(value) => {
          dispatch({ type: "SELECT", value });
        }}
        onDeselect={(value) => {
          dispatch({ type: "DESELECT", value });
        }}
        onBingo={() => {
          if (!hasClaimed.current) {
            hasClaimed.current = true;
            claimBingoMutation.mutate({ bingoId });
          }
        }}
      />

      <div className="mt-4 flex flex-row gap-2">
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
