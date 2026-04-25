const STROOPS_PER_XLM = BigInt(10_000_000);

// Stellar's hard-coded maximum supply: 100 billion XLM in stroops.
const MAX_STROOPS = BigInt(100_000_000_000) * STROOPS_PER_XLM;

// Maximum digits accepted in an XLM whole-number part before conversion,
// sized to prevent BigInt construction from arbitrarily long user strings.
const MAX_XLM_WHOLE_DIGITS = 12;

type StroopsInput = bigint | number | string;

export interface XlmFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface AddressFormatOptions {
  startChars?: number;
  endChars?: number;
}

function normalizeStroops(value: StroopsInput): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error("Stroops value must be a finite integer.");
    }

    return BigInt(value);
  }

  const normalized = value.trim();
  if (!/^-?\d+$/.test(normalized)) {
    throw new Error("Stroops value must be an integer string.");
  }

  // Reject strings long enough to produce a value that can never be valid
  // stroops, guarding against intentional or accidental BigInt overflow.
  if (normalized.replace("-", "").length > MAX_XLM_WHOLE_DIGITS + 7) {
    throw new Error("Stroops value is out of the valid Stellar range.");
  }

  const result = BigInt(normalized);
  if (result > MAX_STROOPS || result < -MAX_STROOPS) {
    throw new Error("Stroops value is out of the valid Stellar range.");
  }

  return result;
}

export function formatXlm(
  stroops: StroopsInput,
  options: XlmFormatOptions = {},
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 7,
  } = options;

  if (
    minimumFractionDigits < 0 ||
    maximumFractionDigits < minimumFractionDigits ||
    maximumFractionDigits > 7
  ) {
    throw new Error("Invalid XLM fraction digit configuration.");
  }

  const value = normalizeStroops(stroops);
  const sign = value < 0 ? "-" : "";
  const absoluteValue = value < 0 ? -value : value;
  const whole = absoluteValue / STROOPS_PER_XLM;
  const fraction = absoluteValue % STROOPS_PER_XLM;

  let fractionText = fraction.toString().padStart(7, "0");
  fractionText = fractionText.slice(0, maximumFractionDigits);
  fractionText = fractionText.replace(/0+$/, "");

  if (fractionText.length < minimumFractionDigits) {
    fractionText = fractionText.padEnd(minimumFractionDigits, "0");
  }

  const wholeText = whole.toString();
  return `${sign}${wholeText}.${fractionText || "0".repeat(minimumFractionDigits)}`;
}

export function formatAddress(
  address: string,
  options: AddressFormatOptions = {},
): string {
  const { startChars = 4, endChars = 4 } = options;
  const normalized = address.trim();

  if (!normalized) {
    return "";
  }

  const minimumVisibleLength = startChars + endChars + 3;
  if (normalized.length <= minimumVisibleLength) {
    return normalized;
  }

  return `${normalized.slice(0, startChars)}...${normalized.slice(-endChars)}`;
}

export function parseXlmToStroops(value: string): bigint {
  const normalized = value.trim();

  if (
    normalized === "" ||
    normalized === "." ||
    normalized.toLowerCase().includes("e") ||
    normalized.toLowerCase() === "infinity" ||
    normalized.toLowerCase() === "-infinity" ||
    normalized.toLowerCase() === "nan"
  ) {
    throw new Error("Invalid XLM amount format. Use up to 7 decimal places.");
  }

  if (!/^-?\d+(?:\.\d{1,7})?$/.test(normalized)) {
    throw new Error("Invalid XLM amount format. Use up to 7 decimal places.");
  }

  const [wholePart = "0", fractionPart = ""] = normalized.split(".");
  const absWhole = wholePart.replace("-", "");

  if (absWhole.length > MAX_XLM_WHOLE_DIGITS) {
    throw new Error("XLM amount exceeds the maximum Stellar supply.");
  }

  const sign = wholePart.startsWith("-") ? BigInt(-1) : BigInt(1);
  const whole = BigInt(absWhole);
  const fraction = fractionPart.padEnd(7, "0").slice(0, 7);
  const stroops = whole * STROOPS_PER_XLM + BigInt(fraction);

  if (stroops > MAX_STROOPS) {
    throw new Error("XLM amount exceeds the maximum Stellar supply.");
  }

  return stroops * sign;
}

/**
 * Sanitise a raw form input string for the XLM amount field.
 *
 * - Strips any character that is not a digit, dot, or leading minus.
 * - Limits the whole-number part to MAX_XLM_WHOLE_DIGITS digits.
 * - Limits the fractional part to 7 digits (one stroop precision).
 * - Collapses multiple dots down to one.
 *
 * Returns the sanitised string, suitable for controlled input state.
 */
export function sanitizeXlmInput(raw: string): string {
  // Keep only digits, dots, and a single leading minus.
  let s = raw.replace(/[^\d.-]/g, "");

  // Preserve at most one leading minus.
  const negative = s.startsWith("-");
  s = (negative ? "-" : "") + s.replace(/-/g, "");

  // Collapse multiple dots — keep only the first.
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  // Clamp whole part length.
  const dotIndex = s.indexOf(".");
  if (dotIndex === -1) {
    const start = negative ? 1 : 0;
    s = s.slice(0, start + MAX_XLM_WHOLE_DIGITS);
  } else {
    const start = negative ? 1 : 0;
    const whole = s.slice(start, dotIndex).slice(0, MAX_XLM_WHOLE_DIGITS);
    const frac = s.slice(dotIndex + 1).slice(0, 7);
    s = (negative ? "-" : "") + whole + "." + frac;
  }

  return s;
}

export function formatAbsoluteDate(
  value: Date | string | number,
  locale = "en-US",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDate(
  value: Date | string | number,
  now: Date = new Date(),
  locale = "en-US",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }

  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, unitSeconds] of units) {
    if (Math.abs(diffInSeconds) >= unitSeconds || unit === "second") {
      return formatter.format(Math.round(diffInSeconds / unitSeconds), unit);
    }
  }

  return formatter.format(0, "second");
}
