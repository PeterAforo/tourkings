# TourKings - Premium Tour Experiences

A full-stack tour booking platform for TourKings, a Ghana-based tour company offering customized packages across Ghana and beyond. Built with Next.js 14, GSAP, Framer Motion, and PostgreSQL.

## Features

- **Public Website** - Animated homepage with GSAP parallax, package browsing, destination guides
- **Customer Dashboard** - Wallet savings system, booking management, profile settings
- **Wallet System** - Save towards tour packages; receive notifications when balance covers a package
- **Online Payments** - Flutterwave integration for card and mobile money (MTN, Vodafone, AirtelTigo)
- **Admin CMS** - Full management dashboard for packages, destinations, bookings, customers, payments, and site content
- **Email Notifications** - Automated emails for registration, payments, wallet thresholds, and booking confirmations

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **GSAP** + **Framer Motion** for animations
- **PostgreSQL** + **Prisma ORM**
- **Flutterwave** for payments
- **Nodemailer** for emails
- **Zustand** for state management

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Flutterwave account (for payments)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL, JWT secret, Flutterwave keys, and SMTP settings
   ```

3. Set up the database:
   ```bash
   npx prisma db push
   ```

4. Seed sample data:
   ```bash
   npm run db:seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, you can log in with:

- **Admin**: admin@tourkings.com / admin123
- **Customer**: kofi@example.com / customer123

## Project Structure

```
app/
  (public)/          - Public pages (home, packages, destinations, about, contact)
  (auth)/            - Login and registration
  dashboard/         - Customer dashboard (wallet, bookings, profile)
  admin/             - Admin CMS (packages, destinations, bookings, customers, payments)
  api/               - API route handlers
components/
  ui/                - Reusable UI components (Button, Input, Card, Modal)
  animations/        - GSAP & Framer Motion wrappers
  layout/            - Navbar, Footer
  home/              - Homepage sections (Hero, FeaturedPackages, etc.)
lib/                 - Utilities, auth, database, payments, email
prisma/              - Schema and seed script
```

## Key Flows

### Wallet Savings

1. Customer tops up wallet via Flutterwave
2. System checks if wallet balance covers any package
3. If yes, customer receives an email notification
4. Customer can choose to book or continue saving

### Booking

1. Customer selects a package
2. Pays via Flutterwave or uses wallet balance
3. Receives booking confirmation email
4. Admin manages booking status via CMS
