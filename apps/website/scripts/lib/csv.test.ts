import { describe, expect, it } from "vitest";

import { parseCsv, parseUsdAmount } from "./csv";

describe("administrative CSV inputs", () => {
  it("preserves quoted commas, escaped quotes, multiline fields, trailing empties and BOMs", () => {
    expect(
      parseCsv(
        '\uFEFFname,note,email\r\n"Example, Donor","line one\nline ""two""",\r\n',
      ),
    ).toEqual([
      ["name", "note", "email"],
      ["Example, Donor", 'line one\nline "two"', ""],
    ]);
  });
  it.each(['a,"unfinished', 'a,un"quoted', '"value"extra'])(
    "rejects malformed quoting: %s",
    (value) => {
      expect(() => parseCsv(value)).toThrow();
    },
  );
  it("accepts positive USD amounts and rejects partial values, fractional cents and overflow", () => {
    expect(parseUsdAmount(" 103.66 ")).toBe(103.66);
    for (const value of [
      "",
      "0",
      "-10",
      "NaN",
      "10oops",
      "1.001",
      "9999999999999999",
    ]) {
      expect(parseUsdAmount(value)).toBeUndefined();
    }
  });
});
