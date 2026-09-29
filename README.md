# Char Dham Holidays

A full-stack website for a Uttarakhand travel business offering the Chardham
Yatra by Helicopter, customised trekking, and a Farm Home Stay. Customers
discover services, check availability and reach the organiser over WhatsApp;
the organiser confirms bookings, itineraries and payment directly — there is
no online payment gateway in this version.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **PostgreSQL** via **Prisma ORM 7** (driver adapter: `@prisma/adapter-pg`)
- **iron-session** for admin authentication (httpOnly, SameSite=Lax cookies)
- **Vitest** for unit/integration tests, **Playwright** for the end-to-end
  acceptance suite
- File storage: local disk by default, S3-compatible for serverless hosts
- Email: `nodemailer` over SMTP (falls back to a warn-and-skip no-op if
  unconfigured, so local dev/demo works without real credentials)

## Local development

Prerequisites: Node.js 22+, a PostgreSQL database (local, Docker, or hosted
— e.g. Neon, Supabase, Railway).

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npx prisma migrate deploy   # creates the schema
npx prisma db seed          # seeds the admin user, both treks, and sample
                             # (clearly non-final) farm room pricing

npm run dev                 # http://localhost:3000
```

Log into `/admin/login` with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set
before seeding. If you didn't set `ADMIN_PASSWORD`, the seed script prints a
dev-only login to the console — do not deploy with that default.

## Testing

```bash
npm run test        # Vitest — unit + real-database integration tests
npm run test:e2e    # Playwright — the spec's 10 end-to-end acceptance flows,
                     # against a separate chardham_e2e database and a real
                     # dev server (see playwright.config.ts)
npm run lint
npm run build        # also runs the TypeScript check
```

## Deployment

This app is a standard Next.js app with a Postgres dependency — it is not
tied to any one host.

### Any VPS / Docker host (recommended — simplest storage story)

1. Provision a Postgres database reachable from the app server.
2. Set the environment variables from `.env.example` (`STORAGE_DRIVER=local`
   is fine here — uploads are written to `UPLOAD_DIR`, served by Next.js as
   a static path, and persist on the server's disk).
3. `npm ci && npm run build && npx prisma migrate deploy && npx prisma db seed`
   (seed only on first deploy — it's idempotent, but only run it once you've
   set real `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
4. `npm start` (or run it under a process manager / Docker).

### Serverless (Vercel, etc.)

The filesystem is ephemeral and not shared across instances, so set
`STORAGE_DRIVER=s3` and provide the `S3_*` variables (works with AWS S3 or
any S3-compatible provider, e.g. Cloudflare R2). Use a managed Postgres
(Neon, Supabase, etc.) for `DATABASE_URL`. Run migrations and the seed as a
one-off build/deploy step, same as above.

## What's out of scope (by design)

Per the approved V1 spec: no online payment gateway, no customer accounts,
no mobile app, no external hotel/helicopter inventory integration, no CRM.
The customer journey ends at WhatsApp — the organiser handles the rest
directly.
