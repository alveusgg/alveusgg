import { PT_Sans, PT_Serif } from "next/font/google";
import { useEffect } from "react";

const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: ["400", "700"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-ptserif",
  weight: ["400", "700"],
});

const fonts = `${ptSans.variable} ${ptSerif.variable} font-sans`;

const FontProvider = ({ children }: { children: React.ReactNode }) => {
  // Add fonts to the root for portals that do not attach to #app
  useEffect(() => {
    document.documentElement.classList.add(...fonts.split(" "));
  }, []);

  return <div className={fonts}>{children}</div>;
};

export default FontProvider;
