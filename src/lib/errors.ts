/**
 * Thrown for expected, safe-to-display business-rule failures (e.g. "this
 * room is no longer available"). Route handlers catch this specifically and
 * return its message to the client. Any other thrown error is NOT this type
 * and must be allowed to propagate so Next.js's default error handling can
 * return a generic message — never widen a catch block to `instanceof
 * Error`, which would also match unexpected internal errors (a raw Prisma
 * error, a DB connection failure, ...) and leak their message to the client.
 */
export class UserFacingError extends Error {}
