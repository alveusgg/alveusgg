import { useEffect, useState } from "react";

const useIsSafari = () => {
  const [isSafari, setIsSafari] = useState<boolean | null>(null);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsSafari(
      ua.indexOf("safari") != -1 &&
        !(ua.indexOf("chrome") != -1) &&
        ua.indexOf("version/") != -1,
    );
  }, []);

  return isSafari;
};

export default useIsSafari;
