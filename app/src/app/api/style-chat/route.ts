import { NextResponse } from "next/server";
import {
  styleChatRequestSchema,
  styleChatResponseSchema,
  type StyleProfile,
} from "@/lib/contracts/style-chat";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map<string, RateLimitEntry>();

const systemPrompt = `Voce e um consultor de estilo. Conduza uma conversa para definir um perfil de estilo.
Objetivo: obter um perfil com os campos:
- perception
- styles
- colorsPreferred
- colorsAvoid
- occasions
- formality (baixo/medio/alto)
- silhouettes
- materials
- avoidPieces

Regras:
- Seja conciso e amigavel.
- Se ja tiver informacao suficiente, pergunte: "Posso gerar o perfil agora?".
- Se o usuario confirmar, responda com um resumo final do perfil e marque ready=true.
- Caso faltem dados importantes, faca apenas uma pergunta de follow-up por vez.
- Use o historico e o perfil parcial fornecido para evitar perguntas repetidas.

Retorne SOMENTE JSON no formato especificado.`;

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not set" },
      { status: 500 }
    );
  }

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsedRequest = styleChatRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsedRequest.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, profile } = parsedRequest.data;

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
          role: "system",
          content: `Perfil parcial (JSON): ${JSON.stringify(profile ?? {})}`,
        },
        ...messages,
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "style_chat_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              assistant_message: { type: "string" },
              ready: { type: "boolean" },
              profile: {
                type: "object",
                additionalProperties: false,
                properties: {
                  perception: { type: ["string", "null"] },
                  styles: { type: ["string", "null"] },
                  colorsPreferred: { type: ["string", "null"] },
                  colorsAvoid: { type: ["string", "null"] },
                  occasions: { type: ["string", "null"] },
                  formality: {
                    type: ["string", "null"],
                    enum: ["baixo", "medio", "alto", null],
                  },
                  silhouettes: { type: ["string", "null"] },
                  materials: { type: ["string", "null"] },
                  avoidPieces: { type: ["string", "null"] },
                },
                required: [
                  "perception",
                  "styles",
                  "colorsPreferred",
                  "colorsAvoid",
                  "occasions",
                  "formality",
                  "silhouettes",
                  "materials",
                  "avoidPieces",
                ],
              },
            },
            required: ["assistant_message", "ready", "profile"],
          },
        },
      },
      temperature: 0.4,
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
      { error: "Empty response from OpenAI" },
      { status: 500 }
    );
  }

  try {
    const parsed = JSON.parse(content) as {
      assistant_message: string;
      ready: boolean;
      profile: StyleProfile;
    };
    const validated = styleChatResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid response schema", details: validated.error.flatten() },
        { status: 500 }
      );
    }
    return NextResponse.json(validated.data);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from OpenAI", raw: content },
      { status: 500 }
    );
  }
}
