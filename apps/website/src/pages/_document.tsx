import { Head, Html, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html
      lang="en"
      className="bg-gradient-to-b from-alveus-green-900 from-45% to-gray-800 to-55% bg-fixed"
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
