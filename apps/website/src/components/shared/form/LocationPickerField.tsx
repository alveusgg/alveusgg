import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Select from "react-select";

// TO-DO:
// 1) Investigar tipo de columna JSON en Prisma para type ShowAndTellLocation. Preguntar a pje si lo puedo usar o mejor meto el json en una columna de tipo string.
// 2) Probar con localizaciones extra largas, llevar la columna de 100 caracteres al límite.
// 3) Probar con distintos featureCodes y featureClasses. Probar también sin pasar ninguno de los parámetros.
// 4) El desplegable es azul por algún motivo, igualar al estilo de Alveus.
// 5) Sanear mejor el string que llega a handleSearch.
// 6) Crear mapas.
// 7) Tener en cuenta que un usuario puede crear varios posts en la misma localización, no contar a ese usuario varias veces en los mapas de tipo "usuarios únicos".

/**
 * Data persisted to the database consisting on a recognizable name to display wherever and coordinates to draw on a map.
 */
type ShowAndTellLocation = {
  displayName: string;
  lattitude: string;
  longitude: string;
};

/**
 * Used to show the location on this Component. It shows the label to the user but has the rest of the info (value) underlying.
 */
type FilteredLocation = {
  value: string;
  label: string;
};

/**
 * For featureClasses and featureCodes @see {@link https://www.geonames.org/export/codes.html|Feature types}
 */
export type LocationPickerFieldProps = {
  label: string;
  name: string;
  className?: string;
  placeholder: string;
  maxLength: number;
  queryType: "name_startsWith"; // Implement the rest when needed.
  featureClasses?: string[];
  featureCodes?: string[];
  defaultValue?: string;
};

/**
 * Minimun length to not spam the API. Tips if you are on the list below:
 * If you live in a two letter place just add a comma.
 * If you live in a one letter place add a comma and space.
 * @see {@link https://en.wikipedia.org/wiki/List_of_short_place_names|List of short place names}
 */
const MINIMUM_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY_MS = 300;

const API_URL = "http://api.geonames.org/search?"; // FIXME: idk where to put this, but surely not here?
const API_USER = "xilipa3578"; // FIXME: idk where to put this, but surely not here?

export function LocationPickerField(props: LocationPickerFieldProps) {
  const [filteredLocations, setFilteredLocations] = useState(
    [] as FilteredLocation[],
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Creates a feature parameter string ready to pass to the api url
   * @param features array of features. See documentation
   * @param featureType featureClass is the group, featureCode is each individual category.
   * @see {@link https://www.geonames.org/export/codes.html|Classes and Codes List}
   * @returns String containing all the features to filter the api call
   */
  const processFeatures = (
    features?: string[],
    featureType?: "featureClass" | "featureCode",
  ) => {
    if (!features) return "";

    let fString = "";
    features.forEach((f: string) => {
      fString += `&${featureType}=${f}`;
    });
    return fString;
  };

  /**
   * Sends a request to the API with the query type, features and query term passed.
   * Throttles calls to the API to not use all the credits, in case a user has a bad day and misses all their keystrokes.
   * @param query User input value
   * @see {@link https://www.geonames.org/export/geonames-search.html|Endpoint Documentation}
   */
  const searchLocation = useDebouncedCallback(async (query: string) => {
    try {
      setIsLoading(true);

      const featureClasses = processFeatures(
        props.featureClasses,
        "featureClass",
      );
      const featureCodes = processFeatures(props.featureCodes, "featureCode");
      const urlParams = `${props.queryType}=${query}${featureClasses}${featureCodes}&type=json&username=${API_USER}`;

      const res = await fetch(`${API_URL}${urlParams}`);
      const data = await res.json();

      const tempLocations = [] as FilteredLocation[];

      data["geonames"]?.forEach(
        (item: {
          name: string;
          adminName1: string;
          countryName: string;
          lat: string;
          lng: string;
        }) => {
          // API returns multiple equally named locations in the same area, the only difference being coordinates.
          // We'll assume that two locations are equal if their city/village name, administrative name and country name are the same.
          const exists = tempLocations.find(
            (l) =>
              l.label ===
              `${item.name}, ${item.adminName1} (${item.countryName})`,
          );

          if (!exists) {
            tempLocations.push({
              value: JSON.stringify({
                displayName: `${item.name}, ${item.adminName1} (${item.countryName})`,
                lattitude: item.lat,
                longitude: item.lng,
              }),
              label: `${item.name}, ${item.adminName1} (${item.countryName})`,
            });
          }
        },
      );

      setFilteredLocations(
        tempLocations.length > 0 ? tempLocations : ([] as FilteredLocation[]),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, DEBOUNCE_DELAY_MS);

  /**
   * Basic input control
   */
  const handleSearch = (value: string) => {
    value = value.trim().replace(/\s{2,}/g, ""); // "Sanitize" the string in case the user slept on the spacebar.
    if (value) {
      if (value.length >= MINIMUM_SEARCH_LENGTH) {
        searchLocation(value);
      }
    }
  };

  return (
    <div>
      <label className={props.className || "flex-1"}>{props.label}</label>
      <Select
        className="w-full rounded-sm border border-gray-700 bg-white p-1 text-black"
        name={props.name}
        onInputChange={handleSearch}
        isLoading={isLoading}
        placeholder={props.placeholder}
        options={filteredLocations}
        defaultInputValue={
          props.defaultValue
            ? (JSON.parse(props.defaultValue) as ShowAndTellLocation)
                .displayName
            : undefined
        }
      />
    </div>
  );
}
