import { Head, Html, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html
      lang="en"
      // Smooth scrolling for in-page links, unless reduced motion is preferred
      // data-scroll-behavior tells Next.js to skip it when changing pages
      data-scroll-behavior="smooth"
      className="bg-linear-to-b from-alveus-green-900 from-45% to-alveus-green to-55% bg-fixed motion-safe:scroll-smooth"
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
