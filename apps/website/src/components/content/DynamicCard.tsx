import dynamic from "next/dynamic";

const DynamicCard = dynamic(() => import("./ProfileCard"), {
  ssr: false,
});

export default DynamicCard;
