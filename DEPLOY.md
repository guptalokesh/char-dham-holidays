# Deploy for testing (free) — Vercel or Netlify

Everything is automatic. You only connect the GitHub repo and add a free database.
No credit card is needed.

## What happens on every deploy (you don't do any of this)
The build command (`npm run build:deploy`, already set in `vercel.json` and `netlify.toml`):
1. checks the settings and stops with a plain message if the database is missing,
2. creates/updates the database tables (Prisma migrations),
3. loads the starter content and photos (text you edit in admin is never overwritten),
4. builds the site.

## Vercel — step by step (recommended)

**Step 1 — Import.** vercel.com → Add New → Project → pick `guptalokesh/char-dham-holidays` → Import.

**Step 2 — Settings screen** (Root Directory / Application Preset / Build and Output Settings):
- Root Directory: leave `./`
- Application Preset: leave **Next.js**
- **Build Command: click the pencil icon and type `npm run build:deploy`.**
  (`vercel.json` already sets this; typing it here as well makes sure it is used.)
- Output Directory and Install Command: leave as they are (greyed out).
- Environment Variables: leave empty for now. Nothing is required here.

**Step 3 — Click Deploy.** The first build will stop with the message
`DATABASE_URL is missing`. That is expected — the database is added next.

**Step 4 — Add the free database.** In the project: **Storage** tab → Create Database →
**Neon** → free plan → Continue → connect it to this project (all environments).
Vercel now adds `DATABASE_URL` by itself.

**Step 5 — Redeploy.** Deployments tab → the failed one → ⋯ → **Redeploy**. This build creates
the tables, loads the content and photos, and publishes the site.

**Step 6 — Open the site.** Project page → **Visit**, or use the `https://<name>.vercel.app`
link. Share that link with your tester.

No admin login is needed to view the site. (The admin password is generated automatically and
printed once in the build log — only look for it if you ever want `/admin/login`.)

If a build fails, open it and read the last red lines; the message names the problem.

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
