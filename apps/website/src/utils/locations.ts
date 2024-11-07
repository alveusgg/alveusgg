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

export function extractInfoFromMapFeatures(
  mapFeatures: { id: string; location: string }[],
) {
  const locations = new Set<string>();
  const countries = new Set<string>();
  const postsFromANewLocation = new Set<string>();
  for (let i = 0; i < mapFeatures.length; i++) {
    const { id, location } = mapFeatures[i]!;

    locations.add(location);

    const country = location
      .substring(location.lastIndexOf(",") + 1)
      .trim()
      .toUpperCase();

    if (country !== "" && country !== "OTHER" && !countries.has(country)) {
      countries.add(country);
      postsFromANewLocation.add(id);
    }
  }

  return { locations, countries, postsFromANewLocation };
}
