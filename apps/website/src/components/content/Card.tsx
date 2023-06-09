"use client";
import React, { FC } from "react";
import type { Ambassador } from "@alveusgg/data/src/ambassadors/core";
import type Image from "next/image";

type CardProps = {
  name: string;
  species?: Ambassador["species"];
  enclosure?: Ambassador["enclosure"];
  img?: typeof Image;
};
