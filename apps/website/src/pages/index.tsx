export async function getStaticProps() {
  return {
    redirect: {
      destination: "/live",
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
