import React from "react";

import {
  DEFAULT_COUNTRY_CODE,
  commonCountries,
  otherCountries,
} from "../../utils/countries";
import { Fieldset } from "../shared/form/Fieldset";
import { FieldGroup } from "../shared/form/FieldGroup";
import { TextField } from "../shared/form/TextField";
import { SelectBoxField } from "../shared/form/SelectBoxField";

export const GiveawayEntryShippingAddressFieldset: React.FC = () => {
  return (
    <Fieldset legend="Shipping address">
      <FieldGroup>
        <TextField
          label="Street Address"
          name="address-line1"
          type="text"
          autoComplete="address-line1"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="Second address line"
          name="address-line2"
          type="text"
          autoComplete="address-line2"
        />
      </FieldGroup>

      <FieldGroup>
        <TextField
          label="City"
          name="city"
          autoComplete="address-level2"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="ZIP / Postal Code"
          name="postal-code"
          autoComplete="postal-code"
          isRequired={true}
          minLength={1}
        />
      </FieldGroup>

      <FieldGroup>
        <TextField
          label="State / Province / Region"
          name="state"
          autoComplete="address-level1"
        />

        <SelectBoxField
          label="Country"
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
        </SelectBoxField>
      </FieldGroup>
    </Fieldset>
  );
};
