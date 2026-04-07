import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/lib/sanitize";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
    );
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("does not double-escape", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });

  it("handles all special characters together", () => {
    expect(escapeHtml(`<a href="test" class='x'>&`)).toBe(
      "&lt;a href=&quot;test&quot; class=&#39;x&#39;&gt;&amp;"
    );
  });
});
