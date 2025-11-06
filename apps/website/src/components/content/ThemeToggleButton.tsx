"use client";

import { useTheme } from "next-themes";

import IconMoon from "@/icons/IconMoon";
import IconSun from "@/icons/IconSun";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="cursor-pointer align-middle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <IconMoon /> : <IconSun />}
    </button>
  );
}
