import { type NextPage } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import Heading from "@/components/content/Heading";

import { classes } from "@/utils/classes";
import foundAnimal, {
  type FoundAnimalFlow,
  type FoundAnimalOption,
} from "@/data/found-animal";

type Log = {
  message: string;
  type: "prompt" | "option";
};

const FoundAnimalPage: NextPage = () => {
  const [flow, setFlow] = useState<FoundAnimalFlow>(foundAnimal);
  const [log, setLog] = useState<Log[]>(
    foundAnimal.prompt.map((message) => ({ message, type: "prompt" }))
  );
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const container = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback(() => {
    if (!container.current) return;
    console.log(container.current.textContent);
    container.current.scrollTop = container.current.scrollHeight;
  }, []);

  const click = useCallback(
    (option: FoundAnimalOption) => {
      if (loading) return;
      setLoading(true);
      setLog((prev) => [...prev, { message: option.name, type: "option" }]);

      // Completely artificial delay to make it feel more natural
      timer.current = setTimeout(() => {
        setLoading(false);
        setLog((prev) => [
          ...prev,
          ...option.flow.prompt.map<Log>((message) => ({
            message,
            type: "prompt",
          })),
        ]);
        setFlow(option.flow);
      }, 250);
    },
    [loading]
  );

  const reset = useCallback(() => {
    setFlow(foundAnimal);
    setLog(foundAnimal.prompt.map((message) => ({ message, type: "prompt" })));
  }, []);

  // Scroll to the bottom whenever the log changes
  useEffect(() => {
    scroll();
  }, [scroll, log]);

  // Clean up any timers when the component unmounts
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <>
      <Meta
        title="Found an Animal?"
        description="Walk through a step-by-step guide to understand how to help an animal in need."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex flex-grow items-center py-4">
        <div className="mx-auto flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-alveus-green bg-alveus-tan/75 shadow-lg">
          <div className="shrink-0 grow-0 border-b border-alveus-green bg-alveus-green-50/75 p-4 text-alveus-green-800">
            <Heading>Found an Animal?</Heading>
            <p>
              Use this interactive tool to get guidance on how to help an animal
              in need that you&apos;ve found.
            </p>
          </div>

          <div
            ref={container}
            className="flex shrink grow flex-col gap-2 overflow-y-auto p-4"
          >
            <div className="shrink grow" />

            {log.map((log, index) => (
              <p
                key={index}
                className={classes(
                  log.type === "prompt"
                    ? "self-start bg-alveus-tan-50"
                    : "self-end bg-alveus-green-50",
                  "rounded px-2 py-1 text-alveus-green-700"
                )}
              >
                {log.message}
              </p>
            ))}

            {loading && (
              <p className="self-start rounded bg-alveus-tan-50 px-2 py-1 text-alveus-green-700">
                . . .
              </p>
            )}

            <ul className="mt-2 flex flex-wrap items-center justify-end gap-4">
              {flow.options &&
                flow.options.map((option, index) => (
                  <li key={index}>
                    <button
                      className="rounded-2xl border border-alveus-green bg-alveus-green px-4 py-1 text-lg text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => click(option)}
                      disabled={loading}
                      type="button"
                    >
                      {option.name}
                    </button>
                  </li>
                ))}

              <li className={flow.options ? "order-first mr-auto" : "mx-auto"}>
                <button
                  className={classes(
                    !flow.options && "mt-2 self-center py-1",
                    "px-2 text-alveus-green-400 transition-colors hover:text-alveus-green-800"
                  )}
                  onClick={reset}
                  type="button"
                >
                  Reset
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
};

export default FoundAnimalPage;
