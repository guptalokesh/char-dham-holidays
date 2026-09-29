@AGENTS.md

## Stack-Specific Rules (Char Dham Holidays)

- **Framework**: Next.js 16 (App Router, TypeScript). This version renamed `middleware.ts` to `proxy.ts` — do not create `middleware.ts`. Auth checks belong in each admin route handler/server function, not only in `proxy.ts` (proxy matchers can silently stop covering a route after a refactor).
- **Database**: PostgreSQL via Prisma ORM 7 (`prisma7.config.ts`, generator `prisma-client`, output `src/generated/prisma`, `moduleFormat = "cjs"`). Prisma 7 requires a driver adapter at runtime — the client is instantiated with `@prisma/adapter-pg` in `src/lib/db.ts`, not a bare `new PrismaClient()`.
- **Testing**: Vitest (`npm run test`) for unit/business-logic tests, Playwright reserved for the section-56 end-to-end acceptance flows (added at checkpoint 15).
- **Business data**: never hardcode contact info, prices, or listing content in components — read through `src/lib/settings.ts` / Prisma models. See the approved plan at the top of this session for full checkpoint list and data model.
- **Feature-level TDD**: work proceeds in the checkpoints defined in the approved plan; write that checkpoint's tests first, keep them green, then stop for approval before the next checkpoint — not per-line TDD, given the project's scope.
- **Security**: `src/proxy.ts` (the one legitimate use of Next 16's proxy here) blocks cross-origin mutations to `/api/admin/*` as CSRF defense-in-depth on top of the SameSite=Lax session cookie — see `src/lib/csrf.ts`. Security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS in production) are set globally via `next.config.ts`'s `headers()`, not via proxy. All admin mutation schemas rely on zod's default strip-unknown-keys behavior for mass-assignment protection — never add `.passthrough()`/`.strict()` overrides to those schemas without re-auditing.
