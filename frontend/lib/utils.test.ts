import { describe, it, expect } from "vitest";
import { cn, formatBRL, formatPercent, formatDate, formatTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("returns empty string when no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatBRL", () => {
  it("formats positive number as BRL", () => {
    expect(formatBRL(1234.56)).toContain("1.234,56");
  });

  it("returns R$ 0,00 for null", () => {
    expect(formatBRL(null)).toBe("R$ 0,00");
  });

  it("returns R$ 0,00 for undefined", () => {
    expect(formatBRL(undefined)).toBe("R$ 0,00");
  });

  it("returns R$ 0,00 for NaN string", () => {
    expect(formatBRL("not-a-number")).toBe("R$ 0,00");
  });

  it("parses numeric strings", () => {
    expect(formatBRL("500")).toContain("500,00");
  });

  it("handles zero", () => {
    expect(formatBRL(0)).toContain("0,00");
  });
});

describe("formatPercent", () => {
  it("formats a fraction as percent with 1 digit default", () => {
    expect(formatPercent(0.31)).toBe("31.0%");
  });

  it("respects custom digits", () => {
    expect(formatPercent(0.12345, 2)).toBe("12.35%");
  });

  it("returns 0% for null", () => {
    expect(formatPercent(null)).toBe("0%");
  });

  it("returns 0% for undefined", () => {
    expect(formatPercent(undefined)).toBe("0%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("formatDate", () => {
  it("formats ISO date string to dd/mm/yyyy", () => {
    // Avoid TZ off-by-one: pass a Date constructed in local time
    const d = new Date(2026, 7, 20); // August 20, 2026 local
    expect(formatDate(d)).toBe("20/08/2026");
  });

  it("formats Date object", () => {
    expect(formatDate(new Date("2026-08-20T00:00:00"))).toBe("20/08/2026");
  });

  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns em-dash for invalid string", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatTime", () => {
  it("formats ISO datetime to HH:MM", () => {
    expect(formatTime("2026-01-15T14:30:00")).toBe("14:30");
  });

  it("returns em-dash for null", () => {
    expect(formatTime(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatTime(undefined)).toBe("—");
  });

  it("returns em-dash for invalid string", () => {
    expect(formatTime("garbage")).toBe("—");
  });
});
