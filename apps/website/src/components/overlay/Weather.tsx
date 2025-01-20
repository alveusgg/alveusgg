import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

const Weather = () => {
  // Get the current weather every 60s
  // Consider the data stale after 10 minutes
  const { data: weather, isStale } = trpc.stream.getWeather.useQuery(
    undefined,
    {
      placeholderData: keepPreviousData,
      refetchInterval: 60 * 1000,
      refetchIntervalInBackground: true,
      staleTime: 10 * 60 * 1000,
    },
  );

  return (
    weather &&
    !isStale && (
      <p className="text-3xl">
        {weather.temperature.fahrenheit}°F{" "}
        <span className="text-xl">({weather.temperature.celsius}°C)</span>
      </p>
    )
  );
};

export default Weather;
