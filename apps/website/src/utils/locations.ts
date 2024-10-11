export function extractCountryFromLocationString(location: string) {
  return location
    ?.substring(location.lastIndexOf(",") + 1)
    .trim()
    .toUpperCase();
}

export function extractCountriesFromLocations(locations: string[]) {
  return locations
    .map(extractCountryFromLocationString)
    .filter((country) => !["", "OTHER"].includes(country));
}
