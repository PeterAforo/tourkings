import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  packageId: z.string(),
  travelDate: z.string().optional(),
  travelers: z.number().min(1).max(50),
  notes: z.string().optional(),
});

export const walletTopupSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
});

export const packageSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  destinationId: z.string(),
  price: z.number().min(0),
  currency: z.string().default("GHS"),
  duration: z.string(),
  groupSize: z.number().min(1).default(10),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const destinationSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  description: z.string().min(10),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type WalletTopupInput = z.infer<typeof walletTopupSchema>;
export type PackageInput = z.infer<typeof packageSchema>;
export type DestinationInput = z.infer<typeof destinationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
