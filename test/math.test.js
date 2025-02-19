import { _FormatNumberWithUnit } from "../src/Math/index";

describe("_FormatNumberWithUnit", () => {
  it("should format a number less than 10000 with default config", () => {
    expect(_FormatNumberWithUnit(1234)).toBe("1234");
  });

  it("should format a number between 10000 and 100000000 with default config", () => {
    expect(_FormatNumberWithUnit(123456)).toBe("12.35万");
  });

  it("should format a number greater than or equal to 100000000 with default config", () => {
    expect(_FormatNumberWithUnit(123456789)).toBe("1.23亿");
  });

  it("should handle invalid number input", () => {
    expect(_FormatNumberWithUnit("not a number")).toBe("0");
  });

  it("should format with join false", () => {
    expect(_FormatNumberWithUnit(123456, { join: false })).toEqual([
      12.35,
      "万",
    ]);
  });

  it("should format with custom suffix", () => {
    expect(_FormatNumberWithUnit(123456, { suffix: "元" })).toBe("12.35万元");
  });

  it("should format with custom decimal places", () => {
    expect(_FormatNumberWithUnit(123456, { decimalPlaces: 1 })).toBe("12.3万");
  });

  it("should format negative numbers", () => {
    expect(_FormatNumberWithUnit(-123456)).toBe("-12.35万");
  });
});
