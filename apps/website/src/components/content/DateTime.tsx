import React, { useEffect, useState } from "react";

import { formatDateTimeLocal, type DateTimeFormat } from "@/utils/datetime";

type DateTimeProps = {
  date: Date;
  format?: Partial<DateTimeFormat>;
};

const DateTime: React.FC<DateTimeProps> = ({ date, format }) => {
  // On client load, and when the settings change, reformat the date
  const [formattedDate, setFormattedDate] = useState<string>(
    formatDateTimeLocal(date, format),
  );
  useEffect(() => {
    setFormattedDate(formatDateTimeLocal(date, format));
  }, [date, format]);

  return <time dateTime={date.toISOString()}>{formattedDate}</time>;
};

export default DateTime;
