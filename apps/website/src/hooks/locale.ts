import { useEffect, useState } from "react";

const useLocaleString = (value: number) => {
  const [formattedValue, setFormattedValue] = useState(
    value.toLocaleString("en-US"),
  );

  useEffect(() => {
    setFormattedValue(value.toLocaleString());
  }, [value]);

  return formattedValue;
};

export default useLocaleString;
