import { describe, expect, it } from "vitest";
import {
  getPasswordScore,
  validateEmail,
  validateLoginForm,
  validatePassword,
} from "./validators";

describe("form validators", () => {
  it("accepts a valid email and rejects malformed input", () => {
    expect(validateEmail("client@demo.local")).toBe(true);
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("enforces the password policy", () => {
    expect(validatePassword("Password123!")).toBe(true);
    expect(validatePassword("password")).toBe(false);
    expect(getPasswordScore("Password123!")).toBe(4);
  });

  it("returns field errors for an invalid login", () => {
    expect(validateLoginForm({ email: "bad", password: "" })).toMatchObject({
      email: expect.any(String),
      password: expect.any(String),
    });
  });
});
