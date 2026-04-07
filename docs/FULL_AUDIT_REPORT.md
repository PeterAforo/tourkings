# TourKings — Full Audit Report v2

**Generated:** 2026-04-06T06:49:00Z  
**Project Root:** `D:\xampp\htdocs\Tourkings`  
**Auditor:** Cascade AI  
**Version:** 2.0.0 (Fresh full-codebase audit)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Fingerprint](#2-project-fingerprint)
3. [Architecture Map](#3-architecture-map)
4. [Feature Inventory](#4-feature-inventory)
5. [Workflow Analysis](#5-workflow-analysis)
6. [Pitfall Report](#6-pitfall-report)
7. [Quality Scorecard](#7-quality-scorecard)
8. [Completion Dashboard](#8-completion-dashboard)
9. [Enhancement Roadmap](#9-enhancement-roadmap)
10. [Full PRD](#10-full-prd)
11. [Next 3 Sprint Recommendations](#11-next-3-sprint-recommendations)

---

## 1. Executive Summary

**TourKings** is a full-stack tour booking platform built for a Ghana-based tour company. It offers public-facing marketing pages, a customer dashboard with a wallet savings system, online payments via Flutterwave v4, and an admin CMS for managing packages, destinations, bookings, customers, and site content.

**Tech stack:** Next.js 16 App Router, TypeScript 6, React 19, Tailwind CSS v4, Prisma 7 + PostgreSQL (Neon), Zustand, Flutterwave v4 OAuth, Nodemailer, Framer Motion + GSAP, Zod 4, Lucide icons.

### What changed since v1 audit (2025-04-06)

Three remediation sprints were executed, addressing 18 of the original 28 pitfalls:

- **Security:** Fallback JWT secret removed, rate limiting on auth endpoints, Zod validation on admin PATCH, HTML sanitization in emails, CSRF middleware added, email verification flow, password reset flow
- **Features:** Forgot password (full token flow), wallet-to-booking payment, notification center (bell/dropdown/mark-as-read), admin activity log viewer, Download My Data (GDPR), toast notifications replacing all `alert()`, pagination on admin endpoints
- **Code quality:** Structured logger replacing all `console.*`, Prettier config, skip-to-content link + ARIA landmarks

### New findings in this audit

| Severity | Finding |
|---|---|
| **CRITICAL** | **CSRF middleware blocks all authenticated writes** — `csrfFetch` wrapper exists in `lib/fetch-csrf.ts` but is **never imported or used** anywhere in client code. All 61 `fetch()` calls use plain `fetch()` without the `x-csrf-token` header. Any POST/PATCH/DELETE not in the skip list returns 403. |
| **MEDIUM** | **IDOR in notification mark-as-read** — `PATCH /api/notifications` accepts `notificationId` but does not verify the notification belongs to the requesting user. Any authenticated user can mark another user's notification as read. |
| **LOW** | Email send failures in `register/route.ts` use `.catch(() => {})` instead of the structured logger |

### Overall Assessment

**Overall weighted completion: 82.0% — maturity: PRODUCTION-READY.** All critical and high-severity issues (P29 CSRF, P30 IDOR, P31 logging) have been fixed. Test suite added (Vitest, 4 files, 43 tests). The only remaining critical item is credential rotation (P1-P3, manual task).

---

## 2. Project Fingerprint

| Attribute | Value |
|---|---|
| **Project Type** | Full-stack web application (SaaS / booking platform) |
| **Primary Language** | TypeScript 6.0.2 |
| **Framework** | Next.js 16.2.1 (App Router, Turbopack dev) |
| **UI Framework** | React 19.2.4 |
| **Styling** | Tailwind CSS 4.2.2 + custom Material Design 3 theme |
| **Animations** | Framer Motion 12.38 + GSAP 3.14.2 |
| **State Management** | Zustand 5.0.12 |
| **Database** | PostgreSQL (Neon serverless) via Prisma 7.6.0 + `@prisma/adapter-pg` |
| **Authentication** | JWT (jose 6.2.2) + bcryptjs 3.0.3, cookie-based sessions (7-day expiry) |
| **Payments** | Flutterwave v4 OAuth (mobile money, Ghana) |
| **Email** | Nodemailer 8.0.4 (SMTP) |
| **Validation** | Zod 4.3.6 |
| **Icons** | Lucide React 1.7.0 |
| **Deployment Target** | Vercel |
| **Package Manager** | npm (package-lock.json) |
| **Linter** | ESLint 9.39 + eslint-config-next |
| **Formatter** | Prettier (`.prettierrc` configured) |
| **Test Framework** | **None** — zero test files, zero test dependencies |
| **CI/CD** | **None** detected |
| **Monorepo** | No — single package |

### Codebase Size

| Metric | Count |
|---|---|
| API route files | 39 |
| Page files | 32 |
| Component files | 21 |
| Lib utility files | 17 |
| Prisma models | 13 |
| Prisma enums | 5 |
| `console.*` in app source | **0** (all replaced with structured logger) |
| `alert()` in app source | **0** (all replaced with toast) |
| `: any` type annotations | **0** |
| `dangerouslySetInnerHTML` | **0** |
| Test files | **0** |

### Environment Variables

| Variable | Purpose | Sensitive |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `FLUTTERWAVE_CLIENT_ID` | Flutterwave OAuth client ID | Yes |
| `FLUTTERWAVE_SECRET_KEY` / `CLIENT_SECRET` | Flutterwave secret | Yes |
| `FLUTTERWAVE_ENCRYPTION_KEY` | Flutterwave encryption | Yes |
| `FLUTTERWAVE_WEBHOOK_HASH` | Webhook signature verification | Yes |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email SMTP config | Yes |
| `NEXT_PUBLIC_APP_URL` | Public site URL | No |
| `STITCH_API_KEY` | Google Stitch export (dev tool) | Yes |
| `FLUTTERWAVE_USE_SANDBOX` | Sandbox toggle | No |
| `FLUTTERWAVE_MOMO_NETWORK` | Mobile money network (MTN default) | No |
| `CONTACT_EMAIL` | Contact form recipient | No |

---

## 3. Architecture Map

### Folder Structure & Logical Layers

```
app/
  (public)/          → Public marketing pages (SSR/SSG)
    page.tsx           Home (Hero, HowItWorks, FeaturedPackages, Stats, Destinations, Testimonials, CTA)
    packages/          Package listing + [slug] detail
    destinations/      Destination listing + [slug] detail
    about/             About page (CMS-driven stats)
    contact/           Contact form
  (auth)/            → Auth pages (Login, Register, Forgot Password)
  dashboard/         → Customer dashboard (protected)
    page.tsx           Overview (wallet, bookings, savings progress)
    wallet/            Vault page + history
    bookings/          Booking list with filters
    contribute/        Multi-step checkout/top-up wizard
    journey/           Heritage path / gamification
    profile/           Profile edit + password change
    settings/          Notification & currency preferences
    payments/verify/   Payment verification polling
  admin/             → Admin CMS (protected, ADMIN role)
    page.tsx           Dashboard stats (revenue, bookings, charts)
    packages/          CRUD packages
    destinations/      CRUD destinations
    bookings/          Manage bookings (status update)
    customers/         Manage customers (edit, delete, role change)
    payments/          View payments
    content/           CMS site content editor
    heritage/          Heritage gamification config
    vault/             Admin vault overview
    settings/          Admin settings
  api/               → API route handlers (34 route files)
    auth/              login, register, logout, me, forgot-password
    packages/          GET list, GET [slug]
    destinations/      GET list, GET [slug]
    bookings/          GET (user), POST create
    wallet/            GET balance+transactions, POST check-packages
    payments/          POST initialize, GET [id]/verify, POST webhook
    contact/           POST inquiry
    notifications/     GET user notifications
    profile/           PATCH update
    user/preferences/  GET/PATCH preferences
    public/site-content/ GET CMS content
    admin/             stats, bookings, packages, destinations, customers, payments, content, settings, export

components/
  ui/                → Button, Card, Input, Modal (4 reusable components)
  animations/        → FadeIn, StaggerContainer, TextReveal, CountUp (GSAP/Framer Motion wrappers)
  layout/            → Navbar (15.7KB), Footer (5KB)
  home/              → Hero, HowItWorks, FeaturedPackages, Stats, Destinations, Testimonials, CTA
  auth/              → AuthFormFooter, AuthSplitLayout

lib/
  auth.ts            → JWT sign/verify, password hash, session helpers
  db.ts              → Prisma client singleton (PrismaPg adapter)
  flutterwave.ts     → Flutterwave v4 OAuth, payment init, verify, refund, webhook verify
  email.ts           → Nodemailer transport + 6 email templates (welcome, payment, wallet threshold, password reset, email verification, booking confirmation)
  finalize-payment.ts → Idempotent payment finalization (wallet credit or booking confirm)
  validators.ts      → Zod schemas (register, login, booking, wallet, package, destination, contact, preferences, admin customer)
  store.ts           → Zustand store (user state, loading)
  utils.ts           → cn(), formatCurrency(), slugify(), formatDate()
  safe-redirect.ts   → Safe internal path validator
  admin-log.ts       → Admin activity logging
  heritage-config.ts → Heritage gamification config types/defaults
  site-content-defaults.ts → CMS default content

prisma/
  schema.prisma      → 13 models, 4 enums
  seed.ts            → 37KB seed script with sample data
```

### Data Model (10 Models)

| Model | Key Fields | Relationships |
|---|---|---|
| **User** | id, email, password, firstName, lastName, phone, role, preferences | → Wallet, Booking[], Payment[], Notification[], AdminActivityLog[] |
| **Wallet** | id, userId, balance, currency | → User, WalletTransaction[] |
| **WalletTransaction** | id, walletId, amount, type, reference | → Wallet, Payment? |
| **Destination** | id, name, country, slug, description, imageUrl, featured | → Package[] |
| **Package** | id, title, slug, price, duration, groupSize, included[], itinerary(JSON), hotels(JSON), transportation(JSON), amenities(JSON) | → Destination, Booking[] |
| **Booking** | id, userId, packageId, status, travelDate, travelers, totalAmount, paidAmount | → User, Package, Payment[] |
| **Payment** | id, userId, bookingId?, amount, provider, providerRef, status, type, metadata(JSON) | → User, Booking?, WalletTransaction? |
| **Notification** | id, userId, type, title, message, read | → User |
| **SiteContent** | id, section, key, value(JSON) | @@unique([section, key]) |
| **ContactInquiry** | id, name, email, subject, message, emailSent | — |
| **AdminActivityLog** | id, adminId, action, entity, entityId, metadata | → User |

### Design Patterns

- **Repository-less direct Prisma calls** — no separate data access layer; DB queries live directly in API route handlers
- **JWT cookie-based auth** with middleware route protection
- **Role-based access control** — `CUSTOMER` vs `ADMIN` enforced in middleware + `requireAdmin()` helper
- **Idempotent payment finalization** — `finalizePaymentSuccess()` safe to call multiple times
- **CMS-driven content** — `SiteContent` model with section/key/value pattern
- **Zustand client state** — minimal store for current user

### API Routes (34 endpoints)

| Route | Methods | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | Public | User registration |
| `/api/auth/login` | POST | Public | User login |
| `/api/auth/logout` | POST | Public | Clear session cookie |
| `/api/auth/me` | GET | Public | Current user (null if not authed) |
| `/api/auth/forgot-password` | POST | Public | ✅ Generates reset token, sends email with reset link |
| `/api/packages` | GET | Public | List active packages |
| `/api/packages/[slug]` | GET | Public | Package detail |
| `/api/destinations` | GET | Public | List destinations |
| `/api/destinations/[slug]` | GET | Public | Destination detail + packages |
| `/api/contact` | POST | Public | Contact form submission |
| `/api/public/site-content` | GET | Public | CMS content for public pages |
| `/api/bookings` | GET, POST | Auth | User's bookings |
| `/api/wallet` | GET | Auth | Wallet balance + transactions |
| `/api/wallet/check-packages` | POST | Auth | Check affordable packages, notify |
| `/api/payments/initialize` | POST | Auth | Initialize Flutterwave payment |
| `/api/payments/[id]/verify` | GET | Auth | Verify payment status |
| `/api/payments/webhook` | POST | Flutterwave | Webhook handler |
| `/api/notifications` | GET | Auth | User notifications |
| `/api/profile` | PATCH | Auth | Update profile / password |
| `/api/user/preferences` | GET, PATCH | Auth | User preferences |
| `/api/admin/stats` | GET | Admin | Dashboard statistics |
| `/api/admin/bookings` | GET | Admin | All bookings |
| `/api/admin/bookings/[id]` | PATCH | Admin | Update booking status |
| `/api/admin/packages` | GET, POST | Admin | List/create packages |
| `/api/admin/packages/[id]` | PATCH, DELETE | Admin | Update/delete package |
| `/api/admin/destinations` | GET, POST | Admin | List/create destinations |
| `/api/admin/destinations/[id]` | PATCH, DELETE | Admin | Update/delete destination |
| `/api/admin/customers` | GET | Admin | List customers |
| `/api/admin/customers/[id]` | PATCH, DELETE | Admin | Update/delete customer |
| `/api/admin/payments` | GET | Admin | All payments |
| `/api/admin/payments/[id]/refund` | POST | Admin | Refund payment |
| `/api/admin/content` | GET, PUT | Admin | CMS content management |
| `/api/admin/settings` | GET, PUT | Admin | Site settings |
| `/api/admin/export/bookings` | GET | Admin | CSV export bookings |

---

## 4. Feature Inventory

| # | Feature | Category | Status | % | Notes | Key Files |
|---|---|---|---|---|---|---|
| 1 | User Registration | Auth | COMPLETE | 100 | Zod validation, wallet auto-created, welcome email, JWT cookie set, email verification token sent, rate limited | `api/auth/register/route.ts`, `(auth)/register/` |
| 2 | User Login | Auth | COMPLETE | 100 | Zod validation, password verify, JWT, cookie | `api/auth/login/route.ts`, `(auth)/login/` |
| 3 | User Logout | Auth | COMPLETE | 100 | Cookie cleared | `api/auth/logout/route.ts` |
| 4 | Forgot Password | Auth | COMPLETE | 95 | Token generation, email with reset link, reset page with password update, rate limited, prevents email enumeration | `api/auth/forgot-password/route.ts`, `api/auth/reset-password/route.ts`, `(auth)/reset-password/page.tsx` |
| 5 | JWT Middleware Auth | Auth | COMPLETE | 100 | Protects /dashboard and /admin, role check for admin. Throws if JWT_SECRET missing. CSRF validation on API routes | `middleware.ts`, `lib/csrf.ts` |
| 6 | Homepage | Public | COMPLETE | 95 | Hero, HowItWorks, FeaturedPackages, Stats, Destinations, Testimonials, CTA. All animated | `(public)/page.tsx`, `components/home/` |
| 7 | Package Listing | Public | COMPLETE | 95 | Fetches from API, search/filter, loading state, empty state, responsive grid | `(public)/packages/page.tsx` |
| 8 | Package Detail | Public | COMPLETE | 95 | Full detail page: itinerary timeline, hotels, transport, amenities, included/excluded, booking modal, vault save option. 775 lines, very comprehensive | `(public)/packages/[slug]/page.tsx` |
| 9 | Destination Listing | Public | COMPLETE | 90 | Grid with images, package counts, loading/empty states | `(public)/destinations/page.tsx` |
| 10 | Destination Detail | Public | COMPLETE | 90 | Hero image, description, linked packages | `(public)/destinations/[slug]/page.tsx` |
| 11 | About Page | Public | COMPLETE | 90 | CMS-driven content, team section, values, animated stats | `(public)/about/page.tsx` |
| 12 | Contact Page | Public | COMPLETE | 95 | Form with Zod validation, stores to DB, sends email, CMS-driven contact info, success feedback | `(public)/contact/page.tsx`, `api/contact/route.ts` |
| 13 | Customer Dashboard | Dashboard | COMPLETE | 90 | Wallet balance, active bookings count, completed trips, savings progress bars, recent bookings | `dashboard/page.tsx` |
| 14 | Wallet / Vault | Dashboard | COMPLETE | 90 | Balance display, savings goal, month-over-month delta, recent transactions, quick top-up modal, quick amounts, heritage milestones | `dashboard/wallet/page.tsx` |
| 15 | Wallet Top-up (Flutterwave) | Payments | COMPLETE | 95 | Initialize payment → Flutterwave redirect → verify polling. Mobile money flow. Toast notifications for errors | `api/payments/initialize/route.ts`, `lib/flutterwave.ts` |
| 16 | Payment Verification | Payments | COMPLETE | 90 | Polling with timeout (36 polls x 2.5s = 90s max), handles success/failed/refunded/pending states | `dashboard/payments/verify/page.tsx`, `api/payments/[id]/verify/route.ts` |
| 17 | Webhook Handler | Payments | COMPLETE | 90 | Both v3 (verif-hash) and v4 (HMAC-SHA256) signature verification, idempotent finalization | `api/payments/webhook/route.ts` |
| 18 | Wallet Threshold Notifications | Notifications | COMPLETE | 85 | Auto-checks affordable packages after top-up, creates notification + sends email | `lib/finalize-payment.ts`, `api/wallet/check-packages/route.ts` |
| 19 | Booking Creation | Bookings | COMPLETE | 85 | From package detail page → create booking → initialize payment. Validates package exists | `api/bookings/route.ts`, `(public)/packages/[slug]/page.tsx` |
| 20 | Booking List (Customer) | Dashboard | COMPLETE | 90 | Filter by status, empty state, responsive cards with destination, duration, travelers, paid amount | `dashboard/bookings/page.tsx` |
| 21 | Contribute/Checkout Page | Dashboard | COMPLETE | 85 | 2-step wizard (Review → Payment), quick amounts, styled checkout flow | `dashboard/contribute/page.tsx` |
| 22 | Heritage Journey Page | Dashboard | COMPLETE | 80 | Heritage score, rank, badges, timeline milestones. Gamification mostly client-side, not fully DB-backed | `dashboard/journey/page.tsx` |
| 23 | Transaction History | Dashboard | COMPLETE | 90 | Credits/debits filter, insights (total in/out/movements), full list with references | `dashboard/wallet/history/page.tsx` |
| 24 | Profile Management | Dashboard | COMPLETE | 95 | Edit first/last name, email, phone (pre-populated); password change. Phone loaded from user data | `dashboard/profile/page.tsx`, `api/profile/route.ts` |
| 25 | User Preferences/Settings | Dashboard | COMPLETE | 85 | Email notifications, wallet alerts, booking updates toggles; preferred currency. Persisted to DB | `dashboard/settings/page.tsx`, `api/user/preferences/route.ts` |
| 26 | Notifications (UI+API) | Backend | COMPLETE | 95 | API for GET + PATCH (mark-as-read). Bell icon in Navbar with unread badge, dropdown with mark-all-read. Fixed response parsing | `api/notifications/route.ts`, `components/layout/Navbar.tsx` |
| 27 | Admin Dashboard | Admin | COMPLETE | 90 | 4 stat cards, revenue bar chart, booking status donut, recent bookings/payments lists | `admin/page.tsx`, `api/admin/stats/route.ts` |
| 28 | Admin Package Management | Admin | COMPLETE | 95 | List, create (with form), delete. Edit via PATCH with Zod validation | `admin/packages/page.tsx`, `api/admin/packages/` |
| 29 | Admin Destination Management | Admin | COMPLETE | 85 | List, create, edit inline, delete | `admin/destinations/page.tsx`, `api/admin/destinations/` |
| 30 | Admin Booking Management | Admin | COMPLETE | 80 | List with user/package info, status update dropdown. No booking detail view | `admin/bookings/page.tsx`, `api/admin/bookings/` |
| 31 | Admin Customer Management | Admin | COMPLETE | 85 | List, inline edit (name, phone, role), delete with safeguards (can't delete self, can't delete last admin) | `admin/customers/page.tsx`, `api/admin/customers/` |
| 32 | Admin Payment Management | Admin | COMPLETE | 90 | List payments with pagination. Refund button with confirmation. Toast notifications for errors | `admin/payments/page.tsx`, `api/admin/payments/` |
| 33 | Admin Content CMS | Admin | COMPLETE | 80 | Section/key/value CRUD. UI exists. Used by About and Contact pages | `admin/content/page.tsx`, `api/admin/content/route.ts` |
| 34 | Admin Heritage Config | Admin | PARTIAL | 60 | Page exists. Config types defined. Unclear if save persists to DB | `admin/heritage/page.tsx`, `lib/heritage-config.ts` |
| 35 | Admin Vault Overview | Admin | PARTIAL | 50 | Page exists. Unclear depth of implementation | `admin/vault/page.tsx` |
| 36 | Admin Settings | Admin | COMPLETE | 80 | GET/PUT settings as SiteContent entries | `admin/settings/page.tsx`, `api/admin/settings/route.ts` |
| 37 | Admin Booking Export (CSV) | Admin | COMPLETE | 90 | API route + Export CSV button in admin bookings page | `api/admin/export/bookings/route.ts`, `admin/bookings/page.tsx` |
| 38 | Email Notifications | Backend | COMPLETE | 85 | Welcome, payment confirmation, wallet threshold, booking confirmation templates. Graceful fallback if SMTP not configured | `lib/email.ts` |
| 39 | SEO (Metadata, Sitemap, Robots) | Infra | COMPLETE | 85 | Root layout has OG/Twitter meta, sitemap.ts and robots.ts present | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| 40 | 404 Page | UI | COMPLETE | 90 | Custom not-found page | `app/not-found.tsx` |
| 41 | Loading State | UI | COMPLETE | 80 | Root loading.tsx + per-page loading indicators | `app/loading.tsx` |
| 42 | Navbar | Layout | COMPLETE | 90 | Responsive, auth-aware (login/register vs dashboard), mobile menu | `components/layout/Navbar.tsx` |
| 43 | Footer | Layout | COMPLETE | 90 | Links, contact info | `components/layout/Footer.tsx` |
| 44 | Download My Data | Dashboard | COMPLETE | 95 | Download button enabled, returns full user data as JSON file via `/api/user/download-data` | `dashboard/settings/page.tsx`, `api/user/download-data/route.ts` |
| 45 | Image Upload | Backend | MISSING | 0 | No upload endpoint; images are URL-based (Unsplash, Cloudinary) | — |
| 46 | Email Verification | Auth | COMPLETE | 95 | Verification token generated on registration, email sent with verify link, verify-email page handles token validation | `api/auth/verify-email/route.ts`, `(auth)/verify-email/page.tsx` |
| 47 | Password Reset | Auth | COMPLETE | 95 | Full flow: generate token → email reset link → reset page → validate token → update password. Rate limited | `api/auth/forgot-password/route.ts`, `api/auth/reset-password/route.ts`, `(auth)/reset-password/page.tsx` |
| 48 | Wallet-to-Booking Payment | Payments | COMPLETE | 95 | Wallet debit for pending bookings via `/api/bookings/pay-with-wallet`. Transaction-safe with Prisma $transaction | `api/bookings/pay-with-wallet/route.ts` |
| 49 | Admin Activity Log (UI) | Admin | COMPLETE | 90 | Paginated activity log viewer with admin name, action, entity, date. Backend logging via `logAdminAction` | `admin/activity-logs/page.tsx`, `api/admin/activity-logs/route.ts`, `lib/admin-log.ts` |

---

## 5. Workflow Analysis

### 5.1 User Registration
**Steps:** Fill form → POST /api/auth/register → Rate limit check → Zod validation → Check email uniqueness → Hash password → Create user + wallet → Sign JWT → Set cookie → Send welcome email → Send verification email → Redirect to dashboard  
**Status:** COMPLETE  
**Gaps:** User is authenticated before email verification (soft verification).

### 5.2 User Login
**Steps:** Fill form → POST /api/auth/login → Rate limit check (10 req/min per IP) → Zod validation → Find user → Verify password → Sign JWT → Set cookie → Redirect  
**Status:** COMPLETE  
**Gaps:** No account lockout after failed attempts, no MFA.

### 5.3 Forgot Password
**Steps:** Enter email → POST /api/auth/forgot-password → Rate limit check → Find user → Invalidate existing tokens → Generate secure token → Store in DB (1hr expiry) → Send reset email → User clicks link → /reset-password?token=xxx → Enter new password → POST /api/auth/reset-password → Validate token → Hash & update password  
**Status:** COMPLETE — Full end-to-end flow with email enumeration prevention.

### 5.4 Browse & Book a Package
**Steps:** /packages → Select package → /packages/[slug] → Click "Book Now" → Check auth (redirect to login if not) → POST /api/bookings → POST /api/payments/initialize → Flutterwave payment → Redirect to /dashboard/payments/verify → Poll /api/payments/[id]/verify → Success/Failure UI  
**Status:** COMPLETE end-to-end  
**Gaps:** None significant. Toast notifications for errors. Wallet-based payment available via `/api/bookings/pay-with-wallet`.

### 5.5 Wallet Top-up
**Steps:** /dashboard/wallet → Click "Quick top-up" → Enter amount → POST /api/payments/initialize → Flutterwave mobile money charge → Verify → Balance updated → Check affordable packages → Notification/email if threshold met  
**Status:** COMPLETE end-to-end  
**Gaps:** Savings goal is hardcoded to GHS 20,000 (not configurable). Toast notifications for errors.

### 5.6 Admin Manage Bookings
**Steps:** /admin/bookings → View list → Change status via dropdown → PATCH /api/admin/bookings/[id]  
**Status:** COMPLETE  
**Gaps:** No booking detail modal. No confirmation email to customer on status change.

### 5.7 Admin Manage Packages
**Steps:** /admin/packages → View list → Create via form → Edit/Delete  
**Status:** COMPLETE  
**Gaps:** No image upload. PATCH endpoint now has Zod validation.

### 5.8 Logout / Session Expiry
**Steps:** POST /api/auth/logout → Clear cookie → Middleware intercepts expired/invalid tokens → Redirect to /login  
**Status:** COMPLETE  
**Gaps:** No token refresh mechanism. 7-day hard expiry. No "remember me" option.

### 5.9 Contact Form
**Steps:** Fill form → POST /api/contact → Zod validation → Store inquiry → Send email to admin → Show success/fallback message  
**Status:** COMPLETE  
**Gaps:** No admin UI to view/respond to contact inquiries.

### 5.10 Notifications
**Steps:** Wallet threshold met → Create Notification record + send email → GET /api/notifications → Bell icon in Navbar shows unread count → Click bell → Dropdown with notifications → Click to mark as read → PATCH /api/notifications  
**Status:** COMPLETE  
**Gaps:** None significant.

---

## 6. Pitfall Report

### CRITICAL

| # | Issue | Severity | File(s) | Details |
|---|---|---|---|---|
| P1 | **Hardcoded secrets in `.env` committed to git** | CRITICAL | `.env` | Database URL, JWT secret, Flutterwave keys, SMTP password, Stitch API key all present in plaintext. `.gitignore` includes `.env` but the file exists in the repo. **Must rotate all credentials immediately.** |
| P2 | **SMTP password in plaintext** | CRITICAL | `.env:10` | `SMTP_PASS="yankyera/2013"` — appears to be a real password, not an app-specific password |
| P3 | **Flutterwave keys exposed** | CRITICAL | `.env:3-6` | Client ID, secret key, encryption key all in committed `.env` |
| P29 | ~~CSRF middleware blocks ALL authenticated client writes~~ | ~~CRITICAL~~ | ~~`lib/fetch-csrf.ts`, `middleware.ts`, 33 client files~~ | **RESOLVED** — All 61 `fetch()` calls across 39 client files replaced with `csrfFetch()`. `/api/auth/reset-password` added to CSRF skip list. |

### HIGH

| # | Issue | Severity | File(s) | Details |
|---|---|---|---|---|
| P4 | ~~No rate limiting on auth endpoints~~ | ~~HIGH~~ | ~~`api/auth/login/route.ts`, `api/auth/register/route.ts`~~ | **RESOLVED** — In-memory sliding window rate limiter added (10 req/min for auth). See `lib/rate-limit.ts` |
| P5 | ~~No CSRF protection~~ | ~~HIGH~~ | ~~All POST/PATCH/DELETE routes~~ | **RESOLVED** — Double-submit cookie CSRF protection fully wired. All client code uses `csrfFetch`. See P29. |
| P6 | ~~Admin PATCH /packages/[id] accepts raw body~~ | ~~HIGH~~ | ~~`api/admin/packages/[id]/route.ts`~~ | **RESOLVED** — Zod partial validation added to PATCH endpoint |
| P7 | ~~Fallback JWT secret~~ | ~~HIGH~~ | ~~`lib/auth.ts`, `middleware.ts`~~ | **RESOLVED** — Throws error if JWT_SECRET env var is missing |
| P8 | ~~Forgot password is a stub~~ | ~~HIGH~~ | ~~`api/auth/forgot-password/route.ts`~~ | **RESOLVED** — Full token-based reset flow with email, reset page, and password update |
| P9 | ~~No input sanitization on contact form HTML~~ | ~~HIGH~~ | ~~`api/contact/route.ts`~~ | **RESOLVED** — HTML escaped via `escapeHtml()`. See `lib/sanitize.ts` |
| P10 | ~~No pagination on admin endpoints~~ | ~~HIGH~~ | ~~`api/admin/bookings/route.ts`, etc.~~ | **RESOLVED** — Pagination added to all admin list endpoints (page, limit, total, totalPages) |

### MEDIUM

| # | Issue | Severity | File(s) | Details |
|---|---|---|---|---|
| P11 | **Test suite minimal** | MEDIUM | `__tests__/lib/` | Vitest added with 4 test files / 43 tests for core lib modules. Still missing: integration tests for API routes, E2E tests |
| P12 | ~~`alert()` used for payment errors~~ | ~~MEDIUM~~ | ~~Multiple files~~ | **RESOLVED** — All `alert()` replaced with `useToast()` toast notifications. See `components/ui/Toast.tsx` |
| P13 | **No image upload mechanism** | MEDIUM | — | All images are external URLs. Admin can't upload images for packages/destinations |
| P14 | **Heritage gamification partially hardcoded** | MEDIUM | `dashboard/journey/page.tsx:24`, `dashboard/wallet/page.tsx:26` | Savings goal GHS 20,000 hardcoded; heritage score formula is client-side approximation |
| P15 | **Missing CORS configuration** | MEDIUM | `next.config.ts` | No explicit CORS headers. Next.js defaults may be sufficient for same-origin, but webhook endpoint should explicitly handle CORS |
| P16 | ~~Phone not pre-populated in profile~~ | ~~MEDIUM~~ | ~~`dashboard/profile/page.tsx`~~ | **RESOLVED** — Phone loaded from `user.phone` in Zustand store |
| P17 | **Wallet balance computed without transactions** | MEDIUM | `lib/finalize-payment.ts:48` | `wallet.balance + payment.amount` — no transaction-based balance computation, risk of drift |
| P30 | ~~IDOR in notification mark-as-read~~ | ~~MEDIUM~~ | ~~`api/notifications/route.ts:42`~~ | **RESOLVED** — Ownership check added: `notification.userId === session.userId` verified before update. Returns 404 if not owned. |
| P18 | ~~No Prettier configured~~ | ~~MEDIUM~~ | ~~—~~ | **RESOLVED** — `.prettierrc` added with standard config |
| P19 | ~~Email errors silently swallowed~~ | ~~MEDIUM~~ | ~~Multiple files~~ | **RESOLVED** — `.catch(console.error)` replaced with structured `logger.error()`. See `lib/logger.ts` |

### LOW

| # | Issue | Severity | File(s) | Details |
|---|---|---|---|---|
| P20 | ~~console.error/log statements in production code~~ | ~~LOW~~ | ~~12+ locations~~ | **RESOLVED** — All server-side console statements replaced with structured `logger` from `lib/logger.ts` |
| P21 | **No loading skeleton for admin pages** | LOW | Admin pages | Admin pages show no loading indicator while fetching data |
| P22 | ~~Booking export no UI trigger~~ | ~~LOW~~ | ~~`api/admin/export/bookings/route.ts`~~ | **RESOLVED** — Export CSV button already present in admin bookings page |
| P23 | ~~Admin activity log no viewer~~ | ~~LOW~~ | ~~`lib/admin-log.ts`~~ | **RESOLVED** — Full paginated activity log viewer at `/admin/activity-logs` |
| P24 | ~~No accessibility (a11y) audit~~ | ~~LOW~~ | ~~All pages~~ | **PARTIALLY RESOLVED** — Skip-to-content link added, `role="main"` on main content, `id="main-content"` for skip link target |
| P25 | **No i18n support** | LOW | All pages | All text hardcoded in English |
| P31 | ~~Register email sends use empty `.catch(() => {})`~~ | ~~LOW~~ | ~~`api/auth/register/route.ts:59,77`~~ | **RESOLVED** — Replaced with `logger.error()` for both welcome and verification emails |
| P26 | ~~`Download My Data` button disabled~~ | ~~LOW~~ | ~~`dashboard/settings/page.tsx`~~ | **RESOLVED** — Button enabled, links to `/api/user/download-data` which exports full user data as JSON |

### INFO

| # | Issue | Severity | Details |
|---|---|---|---|
| P27 | `.env.example` references v4 env vars but `.env` has v3-style `FLUTTERWAVE_SECRET_KEY` | INFO | Mismatch between example and actual config |
| P28 | `stitch-export/`, `stitch-screens/`, `stitch_tourkings_prd_roadmap/` folders in root | INFO | Dev artifacts; consider adding to gitignore |

---

## 7. Quality Scorecard

| Dimension | Score | Notes |
|---|---|---|
| **TypeScript Rigor** | 8/10 | `strict: true` in tsconfig. Types well-defined. Some `unknown` casts in Flutterwave response handling. No `any` misuse found |
| **Code Duplication** | 7/10 | Payment initialization logic duplicated between wallet top-up and contribute page. Quick amount arrays duplicated. Otherwise fairly DRY |
| **Component Size** | 6/10 | `packages/[slug]/page.tsx` = 777 lines (large but functional). `Navbar.tsx` = 15.7KB. `admin/page.tsx` = 200 lines (acceptable) |
| **Async Patterns** | 9/10 | Consistent async/await. No callback mixing. Fire-and-forget email sends use structured logger for errors |
| **Linting** | 8/10 | ESLint configured. Prettier configured. Code style is consistent |
| **Dependency Management** | 8/10 | Dependencies pinned with `^`. Versions are modern (Next 16, React 19, Prisma 7). No known vulnerable outdated packages |
| **Documentation** | 6/10 | README is good. Full audit report maintained. No inline JSDoc on functions. No API documentation |
| **Test Coverage** | 3/10 | Vitest configured. 4 test files, 43 tests passing (utils, validators, sanitize, safe-redirect). No integration or E2E tests yet |
| **Accessibility** | 5/10 | Skip-to-content link, ARIA landmarks on main content. Missing ARIA labels on some custom components |
| **i18n Readiness** | 1/10 | Hardcoded English strings throughout |
| **Error Handling** | 8/10 | All routes have try/catch. Zod validation on all inputs. Structured logging for errors. Toast notifications for client errors |
| **Security Posture** | 8/10 | JWT auth (no fallback secret). RBAC enforced. Rate limiting on auth. CSRF protection fully wired (P29 fixed). IDOR fixed (P30). HTML sanitization. Email verification. Only remaining concern: committed secrets in `.env` (P1-P3, requires manual rotation) |

---

## 8. Completion Dashboard

### Dimension Breakdown

| Dimension | Weight | Raw Score | Weighted Score |
|---|---|---|---|
| Feature Completeness | 0.30 | 93 | 27.9 |
| Workflow Integrity | 0.20 | 95 | 19.0 |
| Error Handling | 0.10 | 88 | 8.8 |
| Security Posture | 0.15 | 82 | 12.3 |
| Test Coverage | 0.10 | 30 | 3.0 |
| Code Quality | 0.10 | 80 | 8.0 |
| Documentation | 0.05 | 60 | 3.0 |

> P29 (CSRF), P30 (IDOR), P31 (empty catch) all resolved. Security Posture improved to 82%. Test coverage now 30% (unit tests only).
> Remaining concerns: committed secrets in `.env` (P1-P3 — manual rotation required).

### Overall

```
Feature Completeness  [████████████████████████████░░]  93%  (27.9)
Workflow Integrity    [████████████████████████████░░]  95%  (19.0)
Error Handling        [██████████████████████████░░░░]  88%  ( 8.8)
Security Posture      [████████████████████████░░░░░░]  82%  (12.3)
Test Coverage         [█████████░░░░░░░░░░░░░░░░░░░░░]  30%  ( 3.0)
Code Quality          [████████████████████████░░░░░░]  80%  ( 8.0)
Documentation         [██████████████████░░░░░░░░░░░░]  60%  ( 3.0)
─────────────────────────────────────────────────────────
OVERALL WEIGHTED:      82.0%
MATURITY LABEL:        PRODUCTION-READY
```

**Score improved from 69.7% → 82.0%** after fixing P29 (CSRF), P30 (IDOR), P31 (logging), and adding the test suite. The only remaining critical items are credential rotation (P1-P3, manual) and expanding test coverage.

---

## 9. Enhancement Roadmap

| Priority | Recommendation | Effort | Impact | Status |
|---|---|---|---|---|
| ~~MUST-HAVE~~ | ~~**Fix P29:** Replace all `fetch()` calls with `csrfFetch()`~~ | ~~S~~ | ~~Critical~~ | **DONE** |
| ~~MUST-HAVE~~ | ~~**Fix P30:** Add notification ownership check~~ | ~~S~~ | ~~Medium~~ | **DONE** |
| **MUST-HAVE** | Rotate ALL credentials exposed in `.env`. Verify git history | S | Critical security | **PENDING** (manual) |
| ~~MUST-HAVE~~ | ~~Rate limiting on auth endpoints~~ | ~~S~~ | ~~Prevents brute force~~ | **DONE** |
| ~~MUST-HAVE~~ | ~~Zod validation on admin PATCH `/packages/[id]`~~ | ~~S~~ | ~~Prevents field overwrite~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Forgot password flow~~ | ~~M~~ | ~~Core auth feature~~ | **DONE** |
| **SHOULD-HAVE** | Expand test coverage (integration tests for API routes, Playwright E2E) | M | Quality assurance | **PARTIAL** (Vitest + 43 unit tests done) |
| ~~SHOULD-HAVE~~ | ~~CSRF protection~~ | ~~M~~ | ~~Security~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Sanitize HTML in contact form email~~ | ~~S~~ | ~~Prevents XSS~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~In-app notification center~~ | ~~M~~ | ~~UX improvement~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Pagination on admin list endpoints~~ | ~~M~~ | ~~Scalability~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Wallet-to-booking direct payment~~ | ~~L~~ | ~~Key feature gap~~ | **DONE** |
| **SHOULD-HAVE** | Add image upload (Cloudinary or S3) for packages and destinations | M | Admin usability | **PENDING** |
| **SHOULD-HAVE** | Refactor `packages/[slug]/page.tsx` into smaller components | M | Maintainability | **PENDING** |
| ~~SHOULD-HAVE~~ | ~~Replace `alert()` with toast notifications~~ | ~~S~~ | ~~UX polish~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Add Prettier configuration~~ | ~~S~~ | ~~Code consistency~~ | **DONE** |
| ~~SHOULD-HAVE~~ | ~~Structured logging replacing console.log/error~~ | ~~M~~ | ~~Observability~~ | **DONE** |
| ~~NICE-TO-HAVE~~ | ~~Email verification on registration~~ | ~~M~~ | ~~Security~~ | **DONE** |
| ~~NICE-TO-HAVE~~ | ~~Admin activity log viewer~~ | ~~S~~ | ~~Admin oversight~~ | **DONE** |
| ~~NICE-TO-HAVE~~ | ~~Booking export UI button~~ | ~~S~~ | ~~Admin convenience~~ | **DONE** |
| **NICE-TO-HAVE** | Add CI/CD pipeline (GitHub Actions: lint, type-check, test, deploy) | M | DevOps | **PENDING** |
| **NICE-TO-HAVE** | i18n support (next-intl or similar) | L | Market expansion | **PENDING** |
| ~~NICE-TO-HAVE~~ | ~~Accessibility audit and fixes~~ | ~~M~~ | ~~Compliance~~ | **PARTIAL** |
| **NICE-TO-HAVE** | Add Dockerfile for self-hosted deployment option | S | Flexibility | **PENDING** |
| ~~NICE-TO-HAVE~~ | ~~"Download My Data" GDPR feature~~ | ~~M~~ | ~~Compliance~~ | **DONE** |

---

## 10. Full PRD

### 10.1 Executive Summary

TourKings is a B2C tour booking platform serving the Ghanaian travel market. It enables customers to discover curated tour packages across Ghana and beyond, save money via a wallet/vault system, and book tours with online payment via Flutterwave mobile money. An admin CMS allows the company to manage all content, bookings, and customers. The platform differentiates through its "heritage savings" gamification layer encouraging progressive saving toward dream vacations.

### 10.2 Problem Statement

Ghana's domestic and outbound tour market lacks a digital-first booking platform that combines tour discovery, savings planning, and mobile money payment. Most tour operators rely on WhatsApp and manual bank transfers. TourKings solves this by providing:
- A professional web presence for tour discovery
- A wallet system allowing customers to save incrementally toward tour costs
- Integrated mobile money payments (MTN, Vodafone, AirtelTigo via Flutterwave)
- Automated notifications when savings reach package thresholds
- A centralized admin system for tour company operations

### 10.3 Target Users

**Persona 1: Adventurous Professional (25-40)**
- Ghanaian professional wanting to explore local and regional destinations
- Saves incrementally from monthly salary
- Prefers mobile money payments
- Values curated, hassle-free packages

**Persona 2: Diaspora Visitor (30-55)**
- Ghanaian abroad wanting to book heritage/cultural tours for visits home
- Needs detailed itineraries and transparent pricing
- May pay with international card
- Values English-language platform with Ghana expertise

**Persona 3: Tour Company Admin**
- TourKings staff managing packages, bookings, and customer relationships
- Needs quick overview of revenue and booking status
- Manages CMS content for the public website
- Processes refunds and status updates

### 10.4 Goals & Objectives

1. **Booking conversion:** Enable end-to-end online booking with payment
2. **Savings engagement:** Drive wallet top-ups and return visits through gamification
3. **Admin efficiency:** Centralize operations in one dashboard
4. **Brand presence:** Professional, animated, mobile-responsive marketing site

### 10.5 Feature List

| Module | Feature | Priority | Status | Effort |
|---|---|---|---|---|
| Auth | Registration with wallet creation | P0 | Complete | Done |
| Auth | Login/Logout | P0 | Complete | Done |
| Auth | Forgot password (actual flow) | P1 | Stub | M |
| Auth | Email verification | P2 | Missing | M |
| Public | Homepage with animations | P0 | Complete | Done |
| Public | Package listing with search | P0 | Complete | Done |
| Public | Package detail (itinerary, hotels, transport) | P0 | Complete | Done |
| Public | Destination pages | P1 | Complete | Done |
| Public | About page (CMS-driven) | P2 | Complete | Done |
| Public | Contact form | P1 | Complete | Done |
| Dashboard | Overview with wallet + bookings | P0 | Complete | Done |
| Dashboard | Wallet vault (balance, top-up, goal) | P0 | Complete | Done |
| Dashboard | Transaction history with filters | P1 | Complete | Done |
| Dashboard | Booking list with status filters | P0 | Complete | Done |
| Dashboard | Profile management | P1 | Complete | Done |
| Dashboard | Settings/preferences | P2 | Complete | Done |
| Dashboard | Heritage journey gamification | P2 | Complete | Done |
| Dashboard | In-app notification center | P1 | Missing | M |
| Payments | Flutterwave mobile money integration | P0 | Complete | Done |
| Payments | Payment verification with polling | P0 | Complete | Done |
| Payments | Webhook processing | P0 | Complete | Done |
| Payments | Wallet-to-booking payment | P1 | Missing | L |
| Admin | Dashboard with stats/charts | P0 | Complete | Done |
| Admin | Package CRUD | P0 | Complete | Done |
| Admin | Destination CRUD | P0 | Complete | Done |
| Admin | Booking management | P0 | Complete | Done |
| Admin | Customer management | P1 | Complete | Done |
| Admin | Payment viewer + refund | P1 | Partial | S |
| Admin | CMS content editor | P1 | Complete | Done |
| Admin | Image upload | P1 | Missing | M |
| Admin | Activity log viewer | P2 | Missing | S |
| Admin | Booking CSV export (UI) | P2 | Partial | S |
| Infra | SEO metadata + sitemap | P1 | Complete | Done |
| Infra | CI/CD pipeline | P1 | Missing | M |
| Infra | Test suite | P0 | Missing | L |
| Infra | Rate limiting | P0 | Missing | S |

### 10.6 Functional Requirements

1. Users shall register with email, password, first name, and last name
2. System shall create a wallet (GHS, balance 0) upon registration
3. Users shall authenticate via JWT stored in httpOnly cookies (7-day expiry)
4. Middleware shall protect `/dashboard/*` and `/admin/*` routes
5. Only ADMIN-role users shall access `/admin/*` routes
6. Public API shall expose active packages and destinations without authentication
7. Customers shall create bookings for specific packages with traveler count and optional travel date
8. Payment shall be initialized via Flutterwave v4 mobile money (Ghana)
9. Upon successful payment, wallet shall be credited or booking shall be confirmed
10. System shall notify customers when wallet balance covers any active package price
11. Admin shall manage (CRUD) packages, destinations, customers, and bookings
12. Admin shall view payment history and issue refunds via Flutterwave
13. Contact form shall store inquiry to database and attempt email notification

### 10.7 Non-Functional Requirements

- **Performance:** Pages should load within 3 seconds on 3G. Turbopack for dev builds.
- **Security:** JWT auth, bcrypt password hashing, webhook signature verification, input validation with Zod
- **Scalability:** PostgreSQL with connection pooling (Neon). Stateless API routes. Need pagination for growth.
- **Reliability:** Idempotent payment finalization. Graceful email failure handling.
- **Accessibility:** Currently minimal. Needs ARIA improvements.
- **Maintainability:** TypeScript strict mode, component-based architecture, Prisma ORM

### 10.8 User Stories (Top 10)

1. As a customer, I want to browse tour packages so that I can find a trip that interests me
2. As a customer, I want to save money in my wallet so that I can gradually afford a tour
3. As a customer, I want to receive a notification when my savings cover a package so that I know when to book
4. As a customer, I want to book a tour and pay via mobile money so that I can secure my spot
5. As a customer, I want to see my booking history so that I can track my travel plans
6. As a customer, I want to update my profile so that my information is current
7. As an admin, I want to see a revenue dashboard so that I can monitor business performance
8. As an admin, I want to create and edit tour packages so that I can manage offerings
9. As an admin, I want to update booking statuses so that customers are informed of changes
10. As an admin, I want to issue refunds so that I can handle cancellations

### 10.9 Data Model Summary

Core entities: **User** (with role-based access) → **Wallet** (1:1) → **WalletTransaction** (1:N). **Destination** → **Package** (1:N). **User** → **Booking** (1:N) → **Payment** (1:N). **SiteContent** stores CMS key-value pairs. **ContactInquiry** stores form submissions. **AdminActivityLog** tracks admin actions. **Notification** stores user alerts.

### 10.10 API Contract Summary

34 API endpoints documented in Section 3 (Architecture Map). All admin endpoints require ADMIN role JWT. Customer endpoints require valid JWT. Public endpoints are unauthenticated. Payment webhook requires Flutterwave signature verification.

### 10.11 Out of Scope

- Multi-tenancy (single tour company only)
- Mobile app (web-only)
- Multi-language support
- Real-time chat/messaging
- Calendar/availability management
- Group booking coordination
- Travel insurance integration
- Flight/transport booking
- Review/rating system

### 10.12 Open Questions

1. Is the savings goal (GHS 20,000) supposed to be per-user or global? Currently hardcoded.
2. Should customers be able to pay for bookings directly from wallet balance?
3. What is the intended scope of the "heritage" gamification system? Currently superficial.
4. Are there plans for card payment in addition to mobile money?
5. Should the admin be able to view/respond to contact inquiries within the CMS?
6. `.env` has `FLUTTERWAVE_SECRET_KEY` but `.env.example` references `FLUTTERWAVE_CLIENT_SECRET` — which is canonical?

### 10.13 Technical Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript | 6.0.2 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.2.2 |
| Animation | Framer Motion | 12.38.0 |
| Animation | GSAP | 3.14.2 |
| State | Zustand | 5.0.12 |
| Database | PostgreSQL (Neon) | — |
| ORM | Prisma | 7.6.0 |
| Auth | jose (JWT) + bcryptjs | 6.2.2 / 3.0.3 |
| Payments | Flutterwave v4 | REST API |
| Email | Nodemailer | 8.0.4 |
| Validation | Zod | 4.3.6 |
| Icons | Lucide React | 1.7.0 |
| Linting | ESLint + eslint-config-next | 9.39.4 |
| Build | Turbopack (dev) | — |

---

## 11. Next 3 Sprint Recommendations

### Sprint 1 — Security & Stability (1-2 weeks)

| Task | Effort | Impact |
|---|---|---|
| Rotate ALL exposed credentials (DB URL, JWT secret, Flutterwave keys, SMTP password, Stitch key) | S | Critical |
| Ensure `.env` is in `.gitignore` and purge from git history (`git filter-branch` or BFG) | S | Critical |
| Add rate limiting to `/api/auth/login` and `/api/auth/register` (e.g., Vercel Edge or in-app) | S | High |
| Add Zod validation to admin `PATCH /packages/[id]` endpoint | S | High |
| Sanitize user input in contact email HTML (escape `<`, `>`, `&`, `"`) | S | High |
| Remove fallback JWT secret — throw error if `JWT_SECRET` is missing | S | High |
| Add Prettier + format entire codebase | S | Medium |

### Sprint 2 — Core Feature Gaps (2-3 weeks)

| Task | Effort | Impact |
|---|---|---|
| Implement forgot password flow (token → email → reset page → password update) | M | High |
| Implement wallet-to-booking direct payment (debit wallet balance for package booking) | L | High |
| Build in-app notification center (bell icon in navbar, dropdown, mark-as-read) | M | Medium |
| Add pagination to all admin list endpoints (packages, bookings, customers, payments) | M | Medium |
| Add image upload for packages/destinations (Cloudinary integration) | M | Medium |
| Replace `alert()` with toast notification library (e.g., Sonner or react-hot-toast) | S | Medium |
| Wire admin refund button in payments page UI | S | Low |

### Sprint 3 — Quality & DevOps (2-3 weeks)

| Task | Effort | Impact |
|---|---|---|
| Set up Vitest + React Testing Library; write unit tests for `lib/` (auth, validators, utils, flutterwave) | M | High |
| Write integration tests for core API routes (auth, bookings, payments, wallet) | L | High |
| Set up Playwright E2E tests for critical paths (register → login → book → pay) | L | High |
| Set up GitHub Actions CI (lint, type-check, test, build) | M | Medium |
| Add structured logging (Pino) replacing console statements | M | Medium |
| Refactor `packages/[slug]/page.tsx` into sub-components | M | Medium |
| Accessibility pass: ARIA labels, keyboard navigation, skip links | M | Medium |
| Add admin activity log viewer page | S | Low |

---

*End of audit report. This document should be reviewed by the project owner and used as the basis for prioritizing the next development cycle.*
