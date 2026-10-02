const DEFAULT_ADMIN_PASSWORDS = ["ChangeMe123!", "replace-with-a-strong-password"];
const LOCAL_DB = /@(localhost|127\.0\.0\.1)[:/]/;

export function findEnvProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = [];

  if (!env.DATABASE_URL) {
    problems.push("DATABASE_URL is missing — paste your Neon connection string.");
  } else if (LOCAL_DB.test(env.DATABASE_URL)) {
    problems.push("DATABASE_URL points at localhost — use the hosted (Neon) connection string.");
  }

  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    problems.push("SESSION_SECRET is missing or shorter than 32 characters.");
  }

  if (!env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORDS.includes(env.ADMIN_PASSWORD)) {
    problems.push("ADMIN_PASSWORD is missing or still a default — set a strong password.");
  }

  return problems;
}

if (process.argv[1]?.endsWith("check-env.ts")) {
  const problems = findEnvProblems(process.env);
  if (problems.length > 0) {
    console.error("\nCannot deploy yet — fix these environment variables in Netlify:\n");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("");
    process.exit(1);
  }
}
