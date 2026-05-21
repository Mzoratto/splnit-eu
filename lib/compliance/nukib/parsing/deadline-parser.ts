import type { NukibDeadline } from "@/lib/compliance/nukib/types";

export function parseDeadline(raw: string): NukibDeadline {
  const normalized = raw.trim();

  if (!normalized || normalized === "-") {
    return {
      raw,
      type: "unknown",
    };
  }

  const absoluteMatch = normalized.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  if (absoluteMatch) {
    const [, dayRaw, monthRaw, yearRaw] = absoluteMatch;
    const day = Number(dayRaw);
    const month = Number(monthRaw);
    const year = Number(yearRaw);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return {
        raw,
        type: "absolute",
        date,
      };
    }
  }

  if (/pr[uů]b[eě][zž]n[eě]/i.test(normalized)) {
    return {
      raw,
      type: "ongoing",
    };
  }

  const relativeMatch = normalized.match(
    /\bdo\s+(\d+)\s+m[eě]s[ií]c(?:e|[uů])?\b/i,
  );
  if (relativeMatch) {
    return {
      raw,
      type: "relative",
      relativeMonths: Number(relativeMatch[1]),
    };
  }

  return {
    raw,
    type: "unknown",
  };
}
