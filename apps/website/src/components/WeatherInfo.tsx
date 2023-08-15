import Image from "next/image";
import React from "react";
import type { WeatherData } from "../server/utils/weather-data";

function convertFahrenheitToCelsius(degrees: number) {
  return (5 / 9) * (degrees - 32);
}

const nfCelsius = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});
const nfFahrenheit = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

export const WeatherInfo: React.FC<{ weatherData: WeatherData }> = ({
  weatherData,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex-shrink-0">
        {weatherData.weather[0] && (
          <Image
            className=""
            key={weatherData.weather[0].id}
            width={40}
            height={40}
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            title={weatherData.weather[0].description}
          />
        )}
      </div>

      <table className="mr-1">
        <tbody>
          <tr>
            <th className="pr-2 text-left" scope="row">
              Temp
            </th>
            <td>
              <span
                title={`${nfCelsius.format(
                  convertFahrenheitToCelsius(weatherData.main.temp),
                )} °C`}
              >
                {`${nfFahrenheit.format(weatherData.main.temp)} °F`}
              </span>
            </td>
          </tr>
          <tr>
            <th className="pr-2 text-left" scope="row">
              Humidity
            </th>
            <td>{weatherData.main.humidity} %</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
