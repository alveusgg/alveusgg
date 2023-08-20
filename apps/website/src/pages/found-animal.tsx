import { type NextPage } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import Heading from "@/components/content/Heading";

import { classes } from "@/utils/classes";
import foundAnimal, {
  type FoundAnimalFlow,
  type FoundAnimalOption,
} from "@/data/found-animal";
import Link from "@/components/content/Link";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";

type Log = {
  message: string;
  type: "prompt" | "option";
};

const FoundAnimalPage: NextPage = () => {
  // Track the current flow state and log of messages
  const [flow, setFlow] = useState<FoundAnimalFlow>(foundAnimal);
  const [log, setLog] = useState<Log[]>(
    foundAnimal.prompt.map((message) => ({ message, type: "prompt" })),
  );

  // Track the current queue of messages to display and the option being loaded
  const [queue, setQueue] = useState<Log[]>([]);
  const [loading, setLoading] = useState<FoundAnimalOption | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Scroll to the bottom whenever the log changes
  const container = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!container.current) return;
    container.current.scrollTop = container.current.scrollHeight;
  }, [log]);

  // When the user selects an option, queue up the messages to be displayed
  const click = useCallback(
    (option: FoundAnimalOption) => {
      if (loading) return;
      setLoading(option);
      setLog((prev) => [...prev, { message: option.name, type: "option" }]);
      setQueue(
        option.flow.prompt.map((message) => ({ message, type: "prompt" })),
      );
    },
    [loading],
  );

  // Implement an artificial delay for each message, to make it "natural"
  useEffect(() => {
    const next = queue[0];
    const remaining = queue.slice(1);
    if (!next) return;

    timer.current = setTimeout(() => {
      if (!remaining.length) {
        setLoading((prev) => {
          if (prev) setFlow(prev.flow);
          return null;
        });
      }
      setLog((prev) => [...prev, next]);
      setQueue(remaining);
    }, 500);
  }, [queue]);

  // Allow the user to reset the flow at any time
  const reset = useCallback(() => {
    // Clear the current queue
    setLoading(null);
    setQueue([]);
    if (timer.current) clearTimeout(timer.current);

    // Reset the flow and the log
    setFlow(foundAnimal);
    setLog(foundAnimal.prompt.map((message) => ({ message, type: "prompt" })));
  }, []);

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
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-[18rem] select-none lg:block xl:hidden 2xl:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block"
        />

        <Section
          className="flex flex-grow items-center pb-16 pt-4"
          containerClassName="flex flex-wrap items-center xl:flex-nowrap gap-16"
        >
          <Image
            src={leafLeftImage1}
            alt=""
            className="pointer-events-none absolute left-0 top-[40vh] -z-10 h-auto w-1/2 max-w-[10rem] select-none"
          />

          <div className="mx-auto flex h-[80vh] w-full max-w-lg shrink-0 flex-col overflow-hidden rounded-xl border border-alveus-green bg-alveus-tan/75 shadow-lg backdrop-blur xl:mx-0">
            <div className="shrink-0 grow-0 border-b border-alveus-green bg-alveus-green-50/75 p-4 text-alveus-green-800">
              <Heading>Found an Animal?</Heading>
              <p>
                Use this interactive tool to get guidance on how to help an
                animal in need that you&apos;ve found.
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
                      ? "self-start bg-alveus-tan-50/75"
                      : "self-end bg-alveus-green-50/75",
                    "rounded px-2 py-1 text-alveus-green-800",
                  )}
                >
                  {log.message}
                </p>
              ))}

              {!!loading && (
                <p className="self-start rounded bg-alveus-tan-50 px-2 py-1 font-extrabold text-alveus-green-700">
                  <span className="animate-pulse">. . .</span>
                </p>
              )}

              <ul className="mt-2 flex flex-wrap items-center justify-end gap-4">
                {flow.options &&
                  flow.options.map((option, index) => (
                    <li key={index}>
                      <button
                        className="rounded-2xl border border-alveus-green bg-alveus-green px-4 py-1 text-lg text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => click(option)}
                        disabled={!!loading}
                        type="button"
                      >
                        {option.name}
                      </button>
                    </li>
                  ))}

                <li
                  className={flow.options ? "order-first mr-auto" : "mx-auto"}
                >
                  <button
                    className={classes(
                      !flow.options && "mt-2 self-center py-1",
                      "px-2 text-alveus-green-400 transition-colors hover:text-alveus-green-800",
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

          <div className="max-w-3xl shrink grow xl:max-w-xl 2xl:max-w-3xl">
            <Heading level={2}>Finding a Wildlife Rehabilitator</Heading>
            <p className="mb-8 text-xl">
              If you&apos;re ever unsure about what to do with an animal
              you&apos;ve found that you believe needs help, the best thing to
              do is keep an eye on it from a safe distance and contact a
              wildlife rehabilitator who can give you guidance, make an
              assessment, or rescue the animal.
            </p>

            <p className="mb-4">
              There are a bunch of different ways to find a wildlife
              rehabilitator, and it may depend on where you are. A good first
              place to start is by searching online for rehabilitation
              organisations that are local to you. You can also try calling a
              local veterinarian who may be able to give you some suggestions
              for who to contact, or you can reach out to your local wildlife
              authority.
            </p>

            <p className="mb-2">
              If you&apos;re in the United States, you can also try using:
            </p>
            <ul className="mx-2 mb-4">
              <li>
                <Link
                  href="https://www.humanesociety.org/resources/how-find-wildlife-rehabilitator"
                  external
                >
                  The Humane Society&apos;s Wildlife Rehabilitator Finder
                </Link>
              </li>
              <li>
                <Link href="https://ahnow.org/" external>
                  Animal Help Now
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.onthefeeder.com/wildlife-rescue-directory/"
                  external
                >
                  On The Feeder&apos;s Wildlife Rescue Directory
                </Link>
              </li>
            </ul>

            <p>
              Please remember that it is generally not a good idea to interfere
              with an animal unless you are sure that it needs help. It is
              against the law in many places to keep wild animals under your
              care without a permit, even if you have good intentions and intend
              to release them.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
};

export default FoundAnimalPage;
