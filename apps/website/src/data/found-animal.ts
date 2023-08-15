export type FoundAnimalOption = {
  name: string;
  flow: FoundAnimalFlow;
};

export type FoundAnimalFlow = {
  prompt: Readonly<string[]>;
  options?: Readonly<FoundAnimalOption[]>;
};

const macros = {
  general: {
    rehab: (animal = "it", context = "") => [
      `${
        context ? `${context}, call` : "Call"
      } a wildlife rehabilitator. They will be able to help ${animal}, or give you advice on what to do next.`,
      "To find a local wildlife rehabilitator, you can try searching online, or contacting your region's wildlife agency, or a local veterinarian.",
    ],
    leave: (animal = "it") => [
      `Leave ${animal} alone and keep yourself, and any pets, away from it.`,
      `If you are still concerned, you can monitor ${animal} from a distance to make sure it is doing okay over a few days.`,
      `Do not feed or otherwise interfere with it, to avoid ${animal} imprinting on humans.`,
    ],
  },
} as const;

const data: FoundAnimalFlow = {
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
              prompt: macros.general.rehab("an injured bird"),
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
                          prompt: macros.general.leave("the bird"),
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
                                prompt: macros.general.leave("the bird"),
                              },
                            },
                            {
                              name: "No",
                              flow: {
                                prompt: macros.general.rehab(
                                  "the bird",
                                  "If you are sure the parents are not nearby, and do not return within a few hours",
                                ),
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
                                prompt: macros.general.leave("the bird"),
                              },
                            },
                            {
                              name: "No",
                              flow: {
                                prompt: macros.general.rehab(
                                  "the bird",
                                  "If you are sure the parents are not nearby, and do not return within a few hours",
                                ),
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
                                  "Once the nest is in place, carefully put the bird in the nest.",
                                  "Once returned, leave the bird alone, keeping yourself and any pets away from it, and observe from a distance.",
                                  "Are the parents still nearby? Are they visiting the nest and showing interest in the bird?",
                                ],
                                options: [
                                  {
                                    name: "Yes",
                                    flow: {
                                      prompt: macros.general.leave("the bird"),
                                    },
                                  },
                                  {
                                    name: "No",
                                    flow: {
                                      prompt: macros.general.rehab(
                                        "the bird",
                                        "If you are sure the parents are not nearby, and do not return within a few hours",
                                      ),
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
    {
      name: "Deer/Fawn",
      flow: {
        prompt: [
          "Is the deer injured?",
          "For example, does it look like it may have been attacked, is it bleeding, is it unable to walk?",
        ],
        options: [
          {
            name: "Yes",
            flow: {
              prompt: [
                "Do not approach or try to handle the deer, as this may scare it and lead to further injury.",
                ...macros.general.rehab("an injured deer"),
              ],
            },
          },
          {
            name: "No",
            flow: {
              prompt: [
                "Is the deer trapped or stuck?",
                "For example, is it stuck in a fence, or in a hole?",
              ],
              options: [
                {
                  name: "Yes",
                  flow: {
                    prompt: [
                      "Do not approach or try to handle the deer, as this may scare it and lead to further injury.",
                      ...macros.general.rehab("a trapped deer"),
                    ],
                  },
                },
                {
                  name: "No",
                  flow: {
                    prompt: ["Is the deer alone?"],
                    options: [
                      {
                        name: "Yes",
                        flow: {
                          prompt: [
                            "This is normal, do not worry. Younger deer (fawns) are often left alone for long periods of time. The mother should return to feed them, often toward the end of the day.",
                            "If you are still concerned, you can monitor the deer from a distance to make sure the mother is still caring for it. Do not approach or try to handle the deer, as your scent may lead to the mother abandoning it.",
                            ...macros.general.rehab(
                              "a deer",
                              "If you don't see the mother return over the next couple of days",
                            ),
                          ],
                        },
                      },
                      {
                        name: "No",
                        flow: {
                          prompt: macros.general.leave("the deer"),
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

export default data;
