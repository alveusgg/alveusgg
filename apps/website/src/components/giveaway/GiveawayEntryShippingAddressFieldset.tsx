import React from "react";

import {
  DEFAULT_COUNTRY_CODE,
  commonCountries,
  otherCountries,
} from "../../utils/countries";

export const GiveawayEntryShippingAddressFieldset: React.FC = () => {
  return (
    <>
      <fieldset className="mt-3">
        <legend className="mb-2 font-bold">Shipping address</legend>

        <div className="flex flex-col gap-2">
          <label className="flex-1">
            Street Address
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="address-line1"
              type="text"
              autoComplete="address-line1"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            Second address line
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="address-line2"
              type="text"
              autoComplete="address-line2"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-5 md:flex-row">
          <label className="flex-1">
            City
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="city"
              type="text"
              autoComplete="address-level2"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            ZIP / Postal Code
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="postal-code"
              type="text"
              autoComplete="postal-code"
              required={true}
              minLength={1}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-5 md:flex-row">
          <label className="flex-1">
            State / Province / Region
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="state"
              type="text"
              autoComplete="address-level1"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            Country
            <br />
            <select
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="country"
              autoComplete="country"
              required={true}
            >
              <optgroup>
                {commonCountries.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                    defaultChecked={country.code === DEFAULT_COUNTRY_CODE}
                  >
                    {country.name}
                  </option>
                ))}
              </optgroup>
              <optgroup>
                {otherCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
      </fieldset>
    </>
  );
};
