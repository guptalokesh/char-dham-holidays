# Deploy for testing on Netlify (free)

The site runs on Netlify; the database runs on a free Neon account (Netlify's own
database is not on its free plan). No credit card is needed for either.

## 1. Create the free database (2 minutes)
1. Sign up at https://neon.com and create a project (any region close to you).
2. Click **Connect**, switch **Connection pooling OFF**, and copy the connection string
   (it ends with `?sslmode=require`). This is your `DATABASE_URL`.

## 2. Put the code on GitHub
Create a private repo and push this project (or drag the project folder into the
GitHub web uploader). Do **not** upload `node_modules`, `.env` or the raw
`images/<folder name>/` photo folders — they are not needed; the cleaned copies
in `images/curated/` are.

## 3. Create the Netlify site
1. https://app.netlify.com → **Add new site → Import an existing project** → pick the repo.
   Netlify reads `netlify.toml`; leave the build settings as they are.
2. Before the first deploy open **Site configuration → Environment variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | the Neon string from step 1 |
| `SESSION_SECRET` | any random text of 32+ characters (`openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | a strong password for the admin login |
| `ADMIN_EMAIL` | the email you will log in to /admin with |

Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (enquiry
emails are skipped without them), and `NEXT_PUBLIC_SITE_URL` (defaults to the Netlify URL).

3. Click **Deploy**. Each deploy automatically: validates the variables above, creates or
   updates the database tables, loads the starter content and photos (existing text you
   edited in admin is never overwritten), then builds the site. If a variable is missing
   or still a default, the build stops with a plain message saying which one.

Share the `https://<name>.netlify.app` link with your tester. Admin is at `/admin/login`.

## Known limits of this free test setup
- **Admin image uploads will not persist** (Netlify's disk is temporary). Seeded photos,
  text edits and all forms work. Permanent uploads need an S3-compatible bucket
  (`STORAGE_DRIVER=s3` plus the `S3_*` variables in `.env.example`).
- Rate limiting is per server instance, which is fine for testing.
