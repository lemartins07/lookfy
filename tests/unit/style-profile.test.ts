import { describe, expect, it } from "vitest";
import { styleProfileSchema } from "@/lib/contracts/style-profile";

describe("style profile schema", () => {
  it("accepts a valid wardrobe mode", () => {
    const result = styleProfileSchema.safeParse({
      wardrobeMode: "capsula",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid wardrobe mode", () => {
    const result = styleProfileSchema.safeParse({
      wardrobeMode: "explorador",
    });

    expect(result.success).toBe(false);
  });
});
