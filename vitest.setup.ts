import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { config } from "dotenv";

config({ path: ".env.test", override: true });

expect.extend(toHaveNoViolations);
