import Server from "./Server";

const Blank = ({
  size = 1,
  filled = false,
}: {
  size?: 1 | 2;
  filled?: boolean;
}) => (
  <Server size={size} background={filled ? "bg-gray-900" : "bg-transparent"} />
);

export default Blank;
