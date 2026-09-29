import "dotenv/config";
import { prisma } from "../src/lib/db";
import { runSeed } from "./seed-logic";

runSeed()
  .then(() => console.log("Seed complete."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
