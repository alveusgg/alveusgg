import { type NextPage } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import Heading from "@/components/content/Heading";

import { classes } from "@/utils/classes";

type Option = {
  name: string;
  flow: Flow;
};

type Flow = {
  prompt: Readonly<string[]>;
  options?: Readonly<Option[]>;
};

type Log = {
  message: string;
  type: "prompt" | "option";
};

const macros = {
  bird: {
    rehab: [
      "To find a local wildlife rehabilitator, you can try searching online, or contacting your region's wildlife agency, or a local veterinarian.",
    ],
    leave: [
      "Leave the bird alone and keep yourself, and any pets, away from it.",
      "If you are still concerned, you can monitor the bird from a distance to make sure the parents are still caring for it.",
      "Do not feed or otherwise interfere with it, to avoid it imprinting on humans.",
    ],
  },
} as const;

const data: Flow = {
  prompt: ["What animal have you found in distress?"],
  options: [
    {
      name: "Bird",
      flow: {
        prompt: [
          "Is the bird injured?",
          "For example, does it look like it may have been attacked, is it bleeding, does it appear malnourished, or a wing is drooping?",
        ],
        options: [
          {
            name: "Yes",
            flow: {
              prompt: ["Call a wildlife rehabilitator", ...macros.bird.rehab],
            },
          },
          {
            name: "No",
            flow: {
              prompt: ["Does the bird have feathers?"],
              options: [
                {
                  name: "Yes",
                  flow: {
                    prompt: [
                      "The bird you've found is likely a fledgling.",
                      "It is normal for it to be on the ground, it has likely left the nest recently. The parents should still be looking after it and feeding it.",
                      "Is the bird safe from pets (dogs, cats, etc.) and people?",
                    ],
                    options: [
                      {
                        name: "Yes",
                        flow: {
                          prompt: macros.bird.leave,
                        },
                      },
                      {
                        name: "No",
                        flow: {
                          prompt: [
                            "Carefully move the bird to a safe location nearby, such as a bush or tree.",
                            "Once moved, leave the bird alone, keeping yourself and any pets away from it, and observe from a distance.",
                            "Are the parents still nearby?",
                          ],
                          options: [
                            {
                              name: "Yes",
                              flow: {
                                prompt: macros.bird.leave,
                              },
                            },
                            {
                              name: "No",
                              flow: {
                                prompt: [
                                  "If you are sure the parents are not nearby, and do not return within a few hours, call a wildlife rehabilitator.",
                                  ...macros.bird.rehab,
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "No",
                  flow: {
                    prompt: [
                      "The bird you've found is likely a nestling. It shouldn't be on the ground yet!",
                      "Can you locate the nest, and is it intact and safe to return the bird to?",
                    ],
                    options: [
                      {
                        name: "Yes",
                        flow: {
                          prompt: [
                            "Carefully return the bird to the nest.",
                            "Once returned, leave the bird alone, keeping yourself and any pets away from it, and observe from a distance.",
                            "Are the parents still nearby? Are they visiting the nest and showing interest in the bird?",
                          ],
                          options: [
                            {
                              name: "Yes",
                              flow: {
                                prompt: macros.bird.leave,
                              },
                            },
                            {
                              name: "No",
                              flow: {
                                prompt: [
                                  "If you are sure the parents are not nearby, and do not return within a few hours, call a wildlife rehabilitator.",
                                  ...macros.bird.rehab,
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        name: "No",
                        flow: {
                          prompt: [
                            "If you are sure the nest is not nearby, or isn't in good enough condition to return the bird to, you'll need to construct a makeshift nest.",
                            "Use a small box (a butter tub or fruit box works well), or a basket. Ensure there are some holes in the bottom for air flow and drainage.",
                            "Line the box with some natural nesting materials, such as dry grass, pine needles, or parts of the old nest if you located it but it was too damaged to return the bird to.",
                            "Place the makeshift nest in a tree or bush as close to where you found the bird as possible (or in the same tree if you found the old nest).",
                          ],
                          options: [
                            {
                              name: "Done",
                              flow: {
                                prompt: [
                                  "Once the nest is in situ, carefully place the bird in the nest.",
                                  "Once returned, leave the bird alone, keeping yourself and any pets away from it, and observe from a distance.",
                                  "Are the parents still nearby? Are they visiting the nest and showing interest in the bird?",
                                ],
                                options: [
                                  {
                                    name: "Yes",
                                    flow: {
                                      prompt: macros.bird.leave,
                                    },
                                  },
                                  {
                                    name: "No",
                                    flow: {
                                      prompt: [
                                        "If you are sure the parents are not nearby, and do not return within a few hours, call a wildlife rehabilitator.",
                                        ...macros.bird.rehab,
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as const;

const FoundAnimalPage: NextPage = () => {
  const [flow, setFlow] = useState<Flow>(data);
  const [log, setLog] = useState<Log[]>(
    data.prompt.map((message) => ({ message, type: "prompt" }))
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
    (option: Option) => {
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
    setFlow(data);
    setLog(data.prompt.map((message) => ({ message, type: "prompt" })));
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
