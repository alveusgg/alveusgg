"use client";

import React from "react";
import Image, { type ImageProps } from "next/image";

type EnclosureCardProps = {
  name: string;
  imgs: any;
  upwards: boolean;
};

const styles = `absolute z-50 flex flex-col -mt-[25px] items-center gap-4  rounded border border-yellow-400 bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;
