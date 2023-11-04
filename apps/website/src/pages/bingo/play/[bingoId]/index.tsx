import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { bingoLiveDataSchema } from "@/utils/bingo";
import { trpc } from "@/utils/trpc";
import { classes } from "@/utils/classes";

import IconLoading from "@/icons/IconLoading";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import { TwitchEmbed } from "@/components/content/TwitchEmbed";
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

function smoothScrollTo(selector: string, offset: number) {
  try {
    const bingoEl = document.querySelector(selector);
    if (bingoEl) {
      const scrollPos =
        bingoEl.getBoundingClientRect().top +
        document.documentElement.scrollTop;
      window.scrollTo({
        top: scrollPos + offset,
        behavior: "smooth",
      });
      return true;
    }
  } catch (e) {}

  return false;
}

const PlayBingoPage = () => {
  const session = useSession();
  const router = useRouter();
  const bingoId = String(router.query.bingoId);

  const [embedStream, setEmbedStream] = useState(false);

  return (
    <>
      <Meta title="Alveus Bingo" description="Alveus Bingo" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <nav
        className="sticky left-0 right-0 top-0 z-20 flex flex-row items-center justify-center py-4"
        aria-label="Scroll navigation"
      >
        <ul className="flex flex-row rounded-2xl bg-white/90 shadow-lg backdrop-blur-md lg:text-lg">
          <li className="border-l first:border-l-0">
            <a
              className="block p-2 px-4"
              href="#bingo"
              onClick={(e) => {
                if (smoothScrollTo("#bingo", -100)) e.preventDefault();
              }}
            >
              Bingo
            </a>
          </li>
          <li className="border-l first:border-l-0">
            <a
              className="block p-2 px-4"
              href="#livestream"
              onClick={(e) => {
                if (smoothScrollTo("#livestream", embedStream ? 100 : -100))
                  e.preventDefault();
              }}
            >
              Livestream & Chat
            </a>
          </li>
        </ul>
      </nav>

      <Section className="flex min-h-[70vh] flex-grow items-center">
        <Heading className="mb-10" id="bingo" link>
          Alveus Bingo
        </Heading>

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

      <div className="bg-alveus-green">
        <Section>
          <Heading id="livestream">Livestream</Heading>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <div
                className={classes(
                  embedStream ? "bg-alveus-green" : "bg-alveus-green-300",
                  "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full shadow-inner outline-blue-500 transition-colors peer-focus:outline",
                )}
              >
                <span
                  className={classes(
                    embedStream ? "translate-x-6" : "translate-x-1",
                    "inline-block h-4 w-4 rounded-full bg-alveus-tan shadow transition-transform",
                  )}
                />
              </div>

              <div className="flex-grow">
                <p>Embed Twitch</p>
              </div>

              <input
                type="checkbox"
                checked={embedStream}
                onChange={(e) => setEmbedStream(e.target.checked)}
                className="peer sr-only"
              />
            </label>
            <span className="italic">or</span>

            <Link href={`https://www.twitch.tv/alveussanctuary`} external>
              Open in new tab
            </Link>
          </div>
        </Section>
        {embedStream && <TwitchEmbed channel="alveussanctuary" />}
      </div>
    </>
  );
};

export default PlayBingoPage;
