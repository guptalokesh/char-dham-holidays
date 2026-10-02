# Deploy for testing (free) — Vercel or Netlify

Everything is automatic. You only connect the GitHub repo and add a free database.
No credit card is needed.

## What happens on every deploy (you don't do any of this)
The build command (`npm run build:deploy`, already set in `vercel.json` and `netlify.toml`):
1. checks the settings and stops with a plain message if the database is missing,
2. creates/updates the database tables (Prisma migrations),
3. loads the starter content and photos (text you edit in admin is never overwritten),
4. builds the site.

## Vercel (recommended)
1. https://vercel.com/new → import `guptalokesh/char-dham-holidays`. Leave every build
   setting as it is (Root `./`, preset Next.js, no environment variables needed).
2. Before pressing Deploy, or right after: open the project → **Storage** → **Create
   Database** → **Neon** (free plan) → connect it to the project. This adds
   `DATABASE_URL` automatically. Then **Deployments → Redeploy**.
3. Open the build log of that deployment. Near the end it prints a box
   `ADMIN LOGIN (shown once — save it)` with the admin email and a generated password.
   Save it. Admin is at `/admin/login`.

That is all. Share the `https://<name>.vercel.app` link.

## Netlify
Same idea: Import from Git, then add `DATABASE_URL` (a free Neon connection string with
connection pooling OFF) under Site configuration → Environment variables, and deploy.
The admin login is printed in the build log in the same way.

## Optional settings (only if you want them)
| Variable | Effect |
|---|---|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | choose the admin login yourself instead of the generated one (first deploy only) |
| `SESSION_SECRET` | 32+ characters; otherwise one is derived safely from the database URL |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | send enquiry emails (skipped without them) |
| `NEXT_PUBLIC_SITE_URL` | custom domain; defaults to the host's own URL |

## Known limits of this free test setup
- **Admin image uploads will not persist** (the host's disk is temporary). Seeded photos,
  text edits and all forms work. Permanent uploads need an S3-compatible bucket
  (`STORAGE_DRIVER=s3` plus the `S3_*` variables in `.env.example`).
- Forgot the generated admin password? Redeploying does not create a new one (an admin
  already exists). Delete the row in the Neon dashboard (table `AdminUser`) and redeploy.
- Vercel's free Hobby plan is for non-commercial use — fine for testing.
