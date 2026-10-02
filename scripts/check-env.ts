const DEFAULT_ADMIN_PASSWORDS = ["ChangeMe123!", "replace-with-a-strong-password"];
const LOCAL_DB = /@(localhost|127\.0\.0\.1)[:/]/;

export function findEnvProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = [];
  const databaseUrl = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;

  if (!databaseUrl) {
    problems.push(
      "DATABASE_URL is missing — add a free Neon database (Vercel: Storage tab, or paste a Neon connection string)."
    );
  } else if (LOCAL_DB.test(databaseUrl)) {
    problems.push("DATABASE_URL points at localhost — use the hosted (Neon) connection string.");
  }

  if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
    problems.push("SESSION_SECRET is shorter than 32 characters — use a longer one or remove it.");
  }

  if (env.ADMIN_PASSWORD && DEFAULT_ADMIN_PASSWORDS.includes(env.ADMIN_PASSWORD)) {
    problems.push("ADMIN_PASSWORD is a placeholder — set a real password or remove it to auto-generate one.");
  }

  return problems;
}

if (process.argv[1]?.endsWith("check-env.ts")) {
  const problems = findEnvProblems(process.env);
  if (problems.length > 0) {
    console.error("\nCannot deploy yet — fix these environment variables:\n");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("");
    process.exit(1);
  }
}
