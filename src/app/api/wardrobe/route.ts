import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
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

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: wardrobeItemSelect,
  });

  return NextResponse.json({ items });
}
