import { randomBytes } from "node:crypto";

const DEFAULT_ADMIN_EMAIL = "Sanjaythapliyal02@gmail.com";
const DEV_PASSWORD = "ChangeMe123!";
const GENERATED_LENGTH = 20;

export interface AdminCredentials {
  email: string;
  password: string;
  generated: boolean;
}

export function resolveAdminCredentials(
  env: Record<string, string | undefined> = process.env
): AdminCredentials {
  const hosted = Boolean(env.VERCEL || env.NETLIFY || env.CI);
  const email = env.ADMIN_EMAIL ?? (hosted ? DEFAULT_ADMIN_EMAIL : "admin@chardhamholidays.example");

  if (env.ADMIN_PASSWORD) return { email, password: env.ADMIN_PASSWORD, generated: false };
  if (!hosted) return { email, password: DEV_PASSWORD, generated: false };

  const password = randomBytes(24).toString("base64url").slice(0, GENERATED_LENGTH);
  return { email, password, generated: true };
}
