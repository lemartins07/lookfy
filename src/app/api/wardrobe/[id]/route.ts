import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { wardrobeItemUpdateSchema } from "@/lib/contracts/wardrobe";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

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

const idSchema = z.string().cuid();

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
    .filter((tag) => tag.length > 0);
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

function buildUpdateData(
  data: z.infer<typeof wardrobeItemUpdateSchema>
): Prisma.WardrobeItemUpdateInput {
  const updateData: Prisma.WardrobeItemUpdateInput = {};

  if (data.category !== undefined) {
    updateData.category = data.category.trim();
  }
  if (data.color !== undefined) {
    updateData.color = data.color.trim();
  }
  if (data.material !== undefined) {
    updateData.material = data.material.trim();
  }
  if (data.season !== undefined) {
    updateData.season = normalizeNullableText(data.season);
  }
  if (data.notes !== undefined) {
    updateData.notes = normalizeNullableText(data.notes);
  }
  if (data.imageUrl !== undefined) {
    updateData.imageUrl = normalizeNullableText(data.imageUrl);
  }
  if (data.tags !== undefined) {
    updateData.tags = { set: normalizeTags(data.tags) };
  }

  return updateData;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const item = await prisma.wardrobeItem.findFirst({
    where: { id: parsedId.data, userId },
    select: wardrobeItemSelect,
  });

  if (!item) {
    return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

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

  const parsed = wardrobeItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData = buildUpdateData(parsed.data);
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Nada para atualizar" },
      { status: 400 }
    );
  }

  const existing = await prisma.wardrobeItem.findFirst({
    where: { id: parsedId.data, userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  }

  const item = await prisma.wardrobeItem.update({
    where: { id: parsedId.data },
    data: updateData,
    select: wardrobeItemSelect,
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const result = await prisma.wardrobeItem.deleteMany({
    where: { id: parsedId.data, userId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
