import { describe, it, expect } from "vitest";
import { formatCurrency, slugify, formatDate } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats GHS amount with 2 decimal places", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("1,234.50");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });

  it("accepts custom currency", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toContain("100.00");
  });
});

describe("slugify", () => {
  it("converts text to lowercase kebab-case", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello & World!")).toBe("hello-world");
  });

  it("collapses multiple separators", () => {
    expect(slugify("Hello   World---Test")).toBe("hello-world-test");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15");
    expect(result).toContain("15");
    expect(result).toContain("January");
    expect(result).toContain("2025");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-12-25"));
    expect(result).toContain("25");
    expect(result).toContain("December");
    expect(result).toContain("2024");
  });
});
