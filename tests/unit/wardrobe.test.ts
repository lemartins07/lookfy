import { describe, expect, it } from "vitest";
import {
  wardrobeItemCreateSchema,
  wardrobeItemUpdateSchema,
} from "@/lib/contracts/wardrobe";

describe("wardrobe schemas", () => {
  it("validates minimal create input", () => {
    const result = wardrobeItemCreateSchema.safeParse({
      category: "Camisa",
      color: "Azul",
      material: "Algodao",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects invalid create input", () => {
    const result = wardrobeItemCreateSchema.safeParse({
      category: "",
      color: "",
      material: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows partial updates", () => {
    const result = wardrobeItemUpdateSchema.safeParse({
      color: "Preto",
    });

    expect(result.success).toBe(true);
  });
});
