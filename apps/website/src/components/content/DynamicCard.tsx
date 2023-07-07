import dynamic from "next/dynamic";

const DynamicCard = dynamic(() => import("./ProfileCard"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default DynamicCard;
