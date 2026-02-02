import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { wardrobeItemCreateSchema } from "@/lib/contracts/wardrobe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const wardrobeItemSelect = {
  id: true,
  category: true,
  color: true,
  material: true,
  season: true,
  tags: true,
  imageUrl: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

function normalizeNullableText(value?: string | null) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTags(tags?: string[]) {
  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 20);
}

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function POST(request: Request) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const parsed = wardrobeItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const item = await prisma.wardrobeItem.create({
    data: {
      userId,
      category: data.category.trim(),
      color: data.color.trim(),
      material: data.material.trim(),
      season: normalizeNullableText(data.season),
      notes: normalizeNullableText(data.notes),
      imageUrl: normalizeNullableText(data.imageUrl),
      tags: normalizeTags(data.tags),
    },
    select: wardrobeItemSelect,
  });

  return NextResponse.json({ item }, { status: 201 });
}
