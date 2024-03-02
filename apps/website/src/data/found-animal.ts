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
    {
      name: "Squirrel",
      flow: {
        prompt: [
          "Does any of the following apply to the squirrel?",
          "- It is bleeding, has an open wound, or has a broken bone",
          "- It has been in a cat's or dog's mouth",
          "- It is covered in fly eggs (looks like small grains of rice)",
          "- It is cold, wet, or crying nonstop",
        ],
        options: [
          {
            name: "Yes",
            flow: {
              prompt: macros.general.rehab("the squirrel"),
            },
          },
          {
            name: "No",
            flow: {
              prompt: [
                "If the squirrel is uninjured the next step is to identify its age to determine if intervention is needed",
                "Does any of the following apply to the squirrel",
                "- have a fluffed out tail",
                "- a body longer than 6 inches (not including the tail)",
                "- approach humans or pets",
              ],
              options: [
                {
                  name: "Yes",
                  flow: {
                    prompt: [
                      "This is a juvenile squirrel, you do not need to intervene.",
                      ...macros.general.leave("the squirrel"),
                    ],
                  },
                },
                {
                  name: "No",
                  flow: {
                    prompt: [
                      "This is an infant squirrel, You will need to guide the baby back to its mother",
                      "Place uncooked rice or bird seed in a sock and warm in the microwave for 20-30 seconds, Wrap the sock in a soft towel, and place it with the baby squirrel in an open container (e.g. a box)",
                      "Do NOT give the baby food or water",
                      "Return the squirrel to its nesting tree (usually in the immediate area where the squirrel was found) If you dont know which tree the squirrels nest is in, or if the nest  was destroyed. Then choose a tree closest to where the squirrel was found",
                      "Observe the baby for the next 6 to 8 hours, Reheat the rice every two hours. If the mother does return after 24 hours, you can...",
                      ...macros.general.rehab("the squirrel"),
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
      name: "Raccoon",
      flow: {
        prompt: [
          "Does the raccoon appear to be sick or injured?",
        ],
        options: [
          {
            name: "Yes",
            flow: {
              prompt: [
                "Is the raccoon an adult or a baby?",
              ],
              options: [
                {
                  name: "Adult",
                  flow: {
                    prompt: [
                      "If you have found an injured adult raccoon, although it may be hard to accept. Adult raccoons can almost never be caught and successfully treated. If you see an adult raccoon with an injury, leave the animal alone. Even though the injury may take a long time to heal, this is far preferable to the trauma of chase and capture.",
                    ],
                  },
                },
                {
                  name: "Baby",
                  flow: {
                    prompt: macros.general.rehab("the baby raccoon"),
                  },
                },
              ],
            },
          },
          {
            name: "No",
            flow: {
              prompt: [
                "Have you found a baby raccoon that's alone with no mother in sight?",
              ],
              options: [
                {
                  name: "Yes",
                  flow: {
                    prompt: [
                      "Be very careful not create a orphan raccoon on accident. When a baby raccoon is separated from its mother, the baby will stay where it is until the mother returns. It's best to observe the baby without disturbing it.",
                      "If the mother does return after 24 hours you can...",
                      ...macros.general.rehab("the baby raccoon"),
                    ]
                  },
                },
                {
                  name: "No",
                  flow: {
                    prompt: macros.general.leave("the raccoon"),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      name: "Cat",
      flow: {
        prompt: [
          "Does the cat appear to be sick, injured, in danger, or a nursing kitten with no mama in sight?",
        ],
        options: [
          {
            name: "Yes",
            flow: {
              prompt: [
                "If the cat appears to be sick, injured, in danger, or if you've found a nursing kitten with no mama in sight please contact an animal welfare organization or shelter that can help you assess the situation",
              ],
            },
          },
          {
            name: "No",
            flow: {
              prompt: [
                "Many cats that people spot in neighborhoods aren't in need of immediate help. Instead, they are pets who spend some or all of their time outdoors.",
                "Check for a collar, if the cat has one try and get in contact with the owner, If the cat has no collar you can take the cat to the nearest animal shelter to check for a microchip",
                "If the cat does not have a microchip, assess whether the cat seems healthy (not injured or visibly ill) and safe (in a secure location, away from any danger) We want a healthy and safe cat to stay where it is while you attempt to find the owner",
              ],
            },
          },
        ],
      },
    },
  ],
} as const;

export default data;
