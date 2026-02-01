import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/contracts/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("auth schemas", () => {
  it("validates register input", () => {
    const result = registerSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "strong-password",
      acceptTerms: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid register input", () => {
    const result = registerSchema.safeParse({
      firstName: "",
      lastName: "",
      email: "invalid",
      password: "123",
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
  });

  it("defaults remember to false", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "strong-password",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remember).toBe(false);
    }
  });
});

describe("password hashing", () => {
  it("hashes and verifies passwords", async () => {
    const password = "strong-password";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
