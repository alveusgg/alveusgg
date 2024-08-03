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

const updateTheme = (theme: "light" | "dark", store = false) => {
  if (store) localStorage.setItem("theme", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }
};

const globalCode = (update: () => void) => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => update());
  update();
};

export const ThemeScript = () => (
  // Note that we have to do a bit of a hack here, passing in `getTheme` and `updateTheme` to the iife
  // This is to get around bundling clobbering the method names if they're referenced directly in `globalCode`
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
  <Script id="theme" strategy="beforeInteractive">
    {`const getTheme = ${getTheme.toString()}; const updateTheme = ${updateTheme.toString()}; (${globalCode.toString()})(() => updateTheme(getTheme()))`}
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
      updateTheme(next, true);
      return next;
    });
  }, []);

  return [theme, toggleTheme] as const;
};

export default useTheme;
