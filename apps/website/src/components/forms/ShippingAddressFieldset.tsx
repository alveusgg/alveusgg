import {
  DEFAULT_COUNTRY_CODE,
  commonCountries,
  otherCountries,
} from "@/utils/countries";
import { FORM_ENTRY_MAX_LENGTHS } from "@/utils/forms";

import { FieldGroup } from "../shared/form/FieldGroup";
import { Fieldset } from "../shared/form/Fieldset";
import { SelectBoxField } from "../shared/form/SelectBoxField";
import { TextField } from "../shared/form/TextField";

export const ShippingAddressFieldset = () => {
  return (
    <Fieldset legend="Shipping address">
      <FieldGroup>
        <TextField
          label="Street Address"
          name="address-line1"
          maxLength={FORM_ENTRY_MAX_LENGTHS.addressLine}
          type="text"
          autoComplete="address-line1"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="Second address line"
          name="address-line2"
          maxLength={FORM_ENTRY_MAX_LENGTHS.addressLine}
          type="text"
          autoComplete="address-line2"
        />
      </FieldGroup>

      <FieldGroup>
        <TextField
          label="City"
          name="city"
          maxLength={FORM_ENTRY_MAX_LENGTHS.city}
          autoComplete="address-level2"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="ZIP / Postal Code"
          name="postal-code"
          maxLength={FORM_ENTRY_MAX_LENGTHS.postalCode}
          autoComplete="postal-code"
          isRequired={true}
          minLength={1}
        />
      </FieldGroup>

      <FieldGroup>
        <TextField
          label="State / Province / Region"
          name="state"
          maxLength={FORM_ENTRY_MAX_LENGTHS.state}
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
