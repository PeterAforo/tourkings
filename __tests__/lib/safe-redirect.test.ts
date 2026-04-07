import { describe, it, expect } from "vitest";
import { getSafeInternalPath } from "@/lib/safe-redirect";

describe("getSafeInternalPath", () => {
  it("accepts valid internal paths", () => {
    expect(getSafeInternalPath("/dashboard")).toBe("/dashboard");
    expect(getSafeInternalPath("/admin/packages")).toBe("/admin/packages");
    expect(getSafeInternalPath("/")).toBe("/");
  });

  it("rejects null and undefined", () => {
    expect(getSafeInternalPath(null)).toBeNull();
    expect(getSafeInternalPath(undefined)).toBeNull();
  });

  it("rejects empty string", () => {
    expect(getSafeInternalPath("")).toBeNull();
  });

  it("rejects protocol-relative URLs (//)", () => {
    expect(getSafeInternalPath("//evil.com")).toBeNull();
  });

  it("rejects absolute URLs with schemes", () => {
    expect(getSafeInternalPath("https://evil.com")).toBeNull();
    expect(getSafeInternalPath("http://evil.com")).toBeNull();
    expect(getSafeInternalPath("javascript:alert(1)")).toBeNull();
  });

  it("rejects paths not starting with /", () => {
    expect(getSafeInternalPath("dashboard")).toBeNull();
    expect(getSafeInternalPath("evil.com/path")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(getSafeInternalPath("  /dashboard  ")).toBe("/dashboard");
  });
});
