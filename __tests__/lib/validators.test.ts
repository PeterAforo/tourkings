import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  bookingSchema,
  walletTopupSchema,
  contactSchema,
  userPreferencesSchema,
  adminCustomerPatchSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts registration with optional phone", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phone: "+233201234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing firstName", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      firstName: "",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("bookingSchema", () => {
  it("accepts valid booking", () => {
    const result = bookingSchema.safeParse({
      packageId: "pkg-123",
      travelers: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero travelers", () => {
    const result = bookingSchema.safeParse({
      packageId: "pkg-123",
      travelers: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 50 travelers", () => {
    const result = bookingSchema.safeParse({
      packageId: "pkg-123",
      travelers: 51,
    });
    expect(result.success).toBe(false);
  });
});

describe("walletTopupSchema", () => {
  it("accepts valid amount", () => {
    const result = walletTopupSchema.safeParse({ amount: 100 });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = walletTopupSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts valid contact form", () => {
    const result = contactSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      subject: "Hello",
      message: "This is a test message for the contact form.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short message", () => {
    const result = contactSchema.safeParse({
      name: "John",
      email: "john@example.com",
      subject: "Hi",
      message: "Short",
    });
    expect(result.success).toBe(false);
  });
});

describe("userPreferencesSchema", () => {
  it("accepts valid preferences", () => {
    const result = userPreferencesSchema.safeParse({
      emailNotifications: true,
      walletAlerts: false,
      preferredCurrency: "USD",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid currency", () => {
    const result = userPreferencesSchema.safeParse({
      preferredCurrency: "BTC",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty object (all optional)", () => {
    const result = userPreferencesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("adminCustomerPatchSchema", () => {
  it("accepts valid patch", () => {
    const result = adminCustomerPatchSchema.safeParse({
      firstName: "Jane",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = adminCustomerPatchSchema.safeParse({
      role: "SUPERADMIN",
    });
    expect(result.success).toBe(false);
  });
});
