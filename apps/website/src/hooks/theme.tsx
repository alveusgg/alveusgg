import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

const getTheme = (): "light" | "dark" => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const updateTheme = (theme?: "light" | "dark") => {
  if (theme) localStorage.setItem("theme", theme);

  if ((theme || getTheme()) === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }
};

const globalCode = () => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => updateTheme());
  updateTheme();
};

export const ThemeScript = () => (
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
  <Script id="theme" strategy="beforeInteractive">
    {`const getTheme = ${getTheme.toString()}; const updateTheme = ${updateTheme.toString()}; (${globalCode.toString()})()`}
  </Script>
);

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">();

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      updateTheme(next);
      return next;
    });
  }, []);

  return [theme, toggleTheme] as const;
};

export default useTheme;
