import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

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

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function POST(request: Request) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase nao configurado" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao encontrado" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Tipo de arquivo invalido" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Arquivo excede ${MAX_FILE_SIZE_MB}MB` },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const safeName = sanitizeFileName(file.name || "upload.jpg");
  const filePath = `${userId}/${timestamp}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("wardrobe")
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: "Falha ao enviar imagem", details: error.message },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from("wardrobe").getPublicUrl(filePath);

  return NextResponse.json(
    { path: filePath, publicUrl: data.publicUrl },
    { status: 201 }
  );
}
