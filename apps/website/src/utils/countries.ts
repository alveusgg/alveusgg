import type { Country } from "country-list";
import {
  overwrite,
  getData as getCountries,
  getName as getCountryName,
} from "country-list";

export { getName as getCountryName } from "country-list";

export const DEFAULT_COUNTRY_CODE = "US";

overwrite([
  {
    code: "TW",
    name: "Taiwan",
  },
  {
    code: "GB",
    name: "United Kingdom",
  },
]);

export const allCountries = getCountries();
export const commonCountryCodes = ["US", "CA", "GB", "DE"];
export const commonCountries: Country[] = commonCountryCodes.map((code) => ({
  code: code,
  name: getCountryName(code) || code,
}));
export const otherCountries = allCountries.filter(
  (country) => !commonCountryCodes.includes(country.code),
);

export const countryCodes = allCountries.map((country) => country.code);
export const isValidCountryCode = (val: unknown) =>
  typeof val === "string" && val.length === 2 && countryCodes.includes(val);
