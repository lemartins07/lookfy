import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { styleProfileSchema, type StyleProfile } from "@/lib/contracts/style-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const styleProfileSelect = {
  perception: true,
  styles: true,
  colorsPreferred: true,
  colorsAvoid: true,
  occasions: true,
  formality: true,
  silhouettes: true,
  materials: true,
  avoidPieces: true,
  wardrobeMode: true,
} as const;

function normalizeNullableText(value?: string | null) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeProfile(profile: StyleProfile) {
  return {
    perception: normalizeNullableText(profile.perception),
    styles: normalizeNullableText(profile.styles),
    colorsPreferred: normalizeNullableText(profile.colorsPreferred),
    colorsAvoid: normalizeNullableText(profile.colorsAvoid),
    occasions: normalizeNullableText(profile.occasions),
    formality: profile.formality === undefined ? undefined : profile.formality,
    silhouettes: normalizeNullableText(profile.silhouettes),
    materials: normalizeNullableText(profile.materials),
    avoidPieces: normalizeNullableText(profile.avoidPieces),
    wardrobeMode:
      profile.wardrobeMode === undefined ? undefined : profile.wardrobeMode,
  };
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

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const profile = await prisma.styleProfile.findUnique({
    where: { userId },
    select: styleProfileSelect,
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
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

  const parsed = styleProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const normalized = normalizeProfile(parsed.data);

  const profile = await prisma.styleProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...normalized,
    },
    update: normalized,
    select: styleProfileSelect,
  });

  return NextResponse.json({ profile });
}
