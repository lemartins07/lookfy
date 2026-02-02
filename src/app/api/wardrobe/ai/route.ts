import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { wardrobeItemCreateSchema } from "@/lib/contracts/wardrobe";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const aiRequestSchema = z.object({
  imageUrl: z.string().trim().url(),
  notes: z.string().trim().min(1).optional(),
});

const aiResultSchema = z.object({
  category: z.string().trim().min(1),
  color: z.string().trim().min(1),
  material: z.string().trim().min(1),
  season: z.enum(["verao", "inverno", "meia-estacao", "todas"]).nullable(),
  notes: z.string().trim().min(1).nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

const systemPrompt = `Voce e um especialista em catalogar roupas. Analise a imagem enviada e retorne os campos:
- category: tipo da peca (ex.: Camisa, Calca, Tenis, Vestido)
- color: cor principal
- material: material principal
- season: escolha apenas entre verao, inverno, meia-estacao, todas. Use todas se nao tiver certeza.
- notes: observacoes curtas (ou null)
- tags: ate 6 tags curtas (ex.: casual, social, verao)

Dicas para season:
- tecidos leves (linho, algodao fino) -> verao
- tecidos pesados (la, trico, couro) -> inverno
- jeans/alfaiataria leve -> meia-estacao
- se nao der para inferir -> todas

Retorne apenas JSON no formato exigido.`;

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nao configurada" },
      { status: 500 }
    );
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

  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { imageUrl, notes } = parsed.data;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: notes
                ? `Observacoes do usuario: ${notes}`
                : "Analise esta peca e gere o cadastro.",
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "wardrobe_ai_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              category: { type: "string" },
              color: { type: "string" },
              material: { type: "string" },
              season: {
                type: ["string", "null"],
                enum: ["verao", "inverno", "meia-estacao", "todas", null],
              },
              notes: { type: ["string", "null"] },
              tags: { type: "array", items: { type: "string" } },
            },
            required: [
              "category",
              "color",
              "material",
              "season",
              "notes",
              "tags",
            ],
          },
        },
      },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "OpenAI request failed", details: errorText },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "Resposta vazia da IA" },
      { status: 500 }
    );
  }

  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(content);
  } catch {
    return NextResponse.json(
      { error: "JSON invalido da IA", raw: content },
      { status: 500 }
    );
  }

  const parsedResult = aiResultSchema.safeParse(parsedContent);
  if (!parsedResult.success) {
    return NextResponse.json(
      { error: "Resposta da IA fora do schema" },
      { status: 500 }
    );
  }

  const aiResult = parsedResult.data;

  const payload = {
    category: aiResult.category,
    color: aiResult.color,
    material: aiResult.material,
    season: normalizeNullableText(aiResult.season),
    notes: normalizeNullableText(aiResult.notes ?? notes ?? null),
    imageUrl,
    tags: normalizeTags(aiResult.tags),
  };

  const validated = wardrobeItemCreateSchema.safeParse(payload);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Nao foi possivel validar o cadastro", details: validated.error.flatten() },
      { status: 422 }
    );
  }

  return NextResponse.json({ draft: validated.data });
}
