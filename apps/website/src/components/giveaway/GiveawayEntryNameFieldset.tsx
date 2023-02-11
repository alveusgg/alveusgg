import React from "react";

export const GiveawayEntryNameFieldset: React.FC = () => (
  <fieldset>
    <legend className="mb-2 font-bold">Name</legend>

    <div className="flex flex-col gap-5 md:flex-row">
      <label className="flex-1">
        First name
        <br />
        <input
          className="w-full rounded-sm border border-gray-700 bg-white p-1"
          name="given-name"
          type="text"
          autoComplete="given-name"
          required={true}
          minLength={1}
        />
      </label>

      <label className="flex-1">
        Last name
        <br />
        <input
          className="w-full rounded-sm border border-gray-700 bg-white p-1"
          name="family-name"
          type="text"
          autoComplete="family-name"
          required={true}
          minLength={1}
        />
      </label>
    </div>
  </fieldset>
);
