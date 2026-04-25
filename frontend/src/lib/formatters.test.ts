import { describe, expect, it } from "vitest";
import {
  formatAbsoluteDate,
  formatAddress,
  formatRelativeDate,
  formatXlm,
  parseXlmToStroops,
  sanitizeXlmInput,
} from "@/lib/formatters";

describe("formatXlm", () => {
  it("formats whole stroops into XLM", () => {
    expect(formatXlm(10_000_000)).toBe("1.00");
  });

  it("preserves up to seven decimal places", () => {
    expect(formatXlm(12_345_678)).toBe("1.2345678");
  });

  it("supports negative values", () => {
    expect(formatXlm(-25_000_000)).toBe("-2.50");
  });

  it("throws on non-integer input", () => {
    expect(() => formatXlm(1.25)).toThrow("Stroops value must be a finite integer.");
  });
});

describe("formatAddress", () => {
  it("truncates long addresses consistently", () => {
    expect(formatAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ123456789")).toBe("GABC...6789");
  });

  it("returns short addresses unchanged", () => {
    expect(formatAddress("GSHORT123")).toBe("GSHORT123");
  });
});

describe("parseXlmToStroops", () => {
  it("converts a whole XLM string to stroops", () => {
    expect(parseXlmToStroops("1")).toBe(BigInt(10_000_000));
  });

  it("converts a fractional XLM string to stroops", () => {
    expect(parseXlmToStroops("1.5")).toBe(BigInt(15_000_000));
  });

  it("converts maximum precision (7 decimals)", () => {
    expect(parseXlmToStroops("1.0000001")).toBe(BigInt(10_000_001));
  });

  it("converts negative XLM amounts", () => {
    expect(parseXlmToStroops("-2")).toBe(BigInt(-20_000_000));
  });

  it("throws on empty string", () => {
    expect(() => parseXlmToStroops("")).toThrow("Invalid XLM amount format");
  });

  it("throws on a bare dot", () => {
    expect(() => parseXlmToStroops(".")).toThrow("Invalid XLM amount format");
  });

  it("throws on scientific notation", () => {
    expect(() => parseXlmToStroops("1e7")).toThrow("Invalid XLM amount format");
  });

  it("throws on Infinity", () => {
    expect(() => parseXlmToStroops("Infinity")).toThrow("Invalid XLM amount format");
  });

  it("throws on NaN", () => {
    expect(() => parseXlmToStroops("NaN")).toThrow("Invalid XLM amount format");
  });

  it("throws when whole-number part exceeds digit limit", () => {
    expect(() => parseXlmToStroops("1000000000000")).toThrow(
      "XLM amount exceeds the maximum Stellar supply",
    );
  });

  it("throws on more than 7 decimal places", () => {
    expect(() => parseXlmToStroops("1.00000001")).toThrow("Invalid XLM amount format");
  });
});

describe("sanitizeXlmInput", () => {
  it("passes through a valid decimal string unchanged", () => {
    expect(sanitizeXlmInput("12.345")).toBe("12.345");
  });

  it("strips non-numeric characters", () => {
    expect(sanitizeXlmInput("1a2b.3c")).toBe("12.3");
  });

  it("collapses multiple dots to the first one", () => {
    expect(sanitizeXlmInput("1.2.3")).toBe("1.23");
  });

  it("preserves a single leading minus", () => {
    expect(sanitizeXlmInput("-5.0")).toBe("-5.0");
  });

  it("removes extra minus signs", () => {
    expect(sanitizeXlmInput("--5")).toBe("-5");
  });

  it("clamps fractional part to 7 digits", () => {
    expect(sanitizeXlmInput("1.123456789")).toBe("1.1234567");
  });

  it("clamps whole part to 12 digits", () => {
    expect(sanitizeXlmInput("9999999999999")).toBe("999999999999");
  });
});

describe("formatXlm — hardened inputs", () => {
  it("throws on Infinity passed as number", () => {
    expect(() => formatXlm(Infinity)).toThrow("Stroops value must be a finite integer.");
  });

  it("throws on NaN passed as number", () => {
    expect(() => formatXlm(NaN)).toThrow("Stroops value must be a finite integer.");
  });

  it("throws on a non-integer number", () => {
    expect(() => formatXlm(1.5)).toThrow("Stroops value must be a finite integer.");
  });

  it("throws on a non-integer string", () => {
    expect(() => formatXlm("abc")).toThrow("Stroops value must be an integer string.");
  });

  it("throws on stroops exceeding Stellar max supply", () => {
    const overMax = (BigInt(100_000_000_001) * BigInt(10_000_000)).toString();
    expect(() => formatXlm(overMax)).toThrow("out of the valid Stellar range");
  });

  it("formats zero stroops correctly", () => {
    expect(formatXlm(0)).toBe("0.00");
  });
});

describe("date formatting", () => {
  it("formats absolute dates", () => {
    expect(formatAbsoluteDate("2026-03-27T10:30:00Z", "en-US")).toMatch(/Mar/);
  });

  it("formats relative future dates", () => {
    const now = new Date("2026-03-27T10:00:00Z");
    expect(formatRelativeDate("2026-03-27T12:00:00Z", now, "en-US")).toBe("in 2 hours");
  });

  it("formats relative past dates", () => {
    const now = new Date("2026-03-27T10:00:00Z");
    expect(formatRelativeDate("2026-03-26T10:00:00Z", now, "en-US")).toBe("yesterday");
  });

  it("throws on invalid dates", () => {
    expect(() => formatAbsoluteDate("not-a-date")).toThrow("Invalid date value.");
  });
});
