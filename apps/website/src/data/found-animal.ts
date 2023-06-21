export type FoundAnimalOption = {
  name: string;
  flow: FoundAnimalFlow;
};

export type FoundAnimalFlow = {
  prompt: Readonly<string[]>;
  options?: Readonly<FoundAnimalOption[]>;
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

export default data;
