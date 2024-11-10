import { useEffect, useState } from "react";
import { getIsIos, getIsSafari } from "@/utils/browser-detection";

const useIsWebKit = () => {
  const [isWebKit, setIsWebKit] = useState<boolean | null>(null);

  useEffect(() => {
    setIsWebKit(getIsIos() || getIsSafari());
  }, []);

  return isWebKit;
};

export default useIsWebKit;
