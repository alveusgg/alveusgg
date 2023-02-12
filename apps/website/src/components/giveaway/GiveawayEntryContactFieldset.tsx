import React from "react";

export const GiveawayEntryContactFieldset: React.FC<{
  defaultEmailAddress?: string;
}> = ({ defaultEmailAddress }) => (
  <fieldset>
    <legend className="mb-2 font-bold">Contact</legend>

    <div className="flex flex-col gap-5 md:flex-row">
      <label className="flex-1">
        Email address:
        <br />
        <input
          className="w-full rounded-sm border border-gray-700 bg-white p-1"
          name="email"
          type="email"
          autoComplete="email"
          required={true}
          defaultValue={defaultEmailAddress}
          minLength={3}
        />
      </label>
    </div>
  </fieldset>
);
