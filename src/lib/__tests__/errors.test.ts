import { describe, expect, it } from "vitest";
import { UserFacingError } from "@/lib/errors";

describe("UserFacingError", () => {
  it("is an Error subclass carrying a safe-to-display message", () => {
    const error = new UserFacingError("This room is no longer available.");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UserFacingError);
    expect(error.message).toBe("This room is no longer available.");
  });

  it("is distinguishable from a plain Error, so route handlers can safely narrow their catch", () => {
    const plain = new Error("Connection terminated unexpectedly");
    expect(plain).not.toBeInstanceOf(UserFacingError);
  });
});
