"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";
import type {
  ChatMessage,
  StyleProfile,
  StyleChatResponse,
} from "@/lib/contracts/style-chat";

interface ChatItem {
  id: number;
  name: string;
  profileImage?: string;
  lastActive: string;
  message: string;
  isSender: boolean;
}

const assistantProfileImage = "/images/user/user-17.jpg";
const introMessage =
  "Oi! Me conte sobre seu estilo atual e onde você quer chegar. Vou fazer perguntas se precisar.";

function formatValue(value: string | null | undefined, fallback: string) {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  return value;
}

function formatFormality(value: StyleProfile["formality"]) {
  if (!value) {
    return "não informado";
  }
  return value;
}

function buildSummary(summaryProfile: StyleProfile) {
  return [
    "Perfeito! Com base nas suas respostas, criei um perfil inicial:",
    `• Percepção desejada: ${formatValue(
      summaryProfile.perception,
      "não informado"
    )}`,
    `• Estilos/Referências: ${formatValue(
      summaryProfile.styles,
      "não informado"
    )}`,
    `• Cores preferidas: ${formatValue(
      summaryProfile.colorsPreferred,
      "sem preferência"
    )}`,
    `• Cores a evitar: ${formatValue(
      summaryProfile.colorsAvoid,
      "sem preferência"
    )}`,
    `• Ocasiões frequentes: ${formatValue(
      summaryProfile.occasions,
      "não informado"
    )}`,
    `• Nível de formalidade: ${formatFormality(summaryProfile.formality)}`,
    `• Silhuetas preferidas: ${formatValue(
      summaryProfile.silhouettes,
      "sem preferência"
    )}`,
    `• Materiais preferidos: ${formatValue(
      summaryProfile.materials,
      "sem preferência"
    )}`,
    `• Peças/tecidos a evitar: ${formatValue(
      summaryProfile.avoidPieces,
      "sem preferência"
    )}`,
  ].join("\n");
}

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [profile, setProfile] = useState<StyleProfile>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: introMessage },
  ]);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 1,
      name: "Consultor de Estilo",
      profileImage: assistantProfileImage,
      lastActive: "agora",
      message: introMessage,
      isSender: false,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const summaryMessage = useMemo(() => buildSummary(profile), [profile]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (trimmed.length === 0 || isCompleted || isLoading) {
      return;
    }

    const newUserMessage: ChatItem = {
      id: messages.length + 1,
      name: "Você",
      lastActive: "agora",
      message: trimmed,
      isSender: true,
    };

    const updatedChatMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: trimmed },
    ];

    setMessages((prev) => [...prev, newUserMessage]);
    setChatMessages(updatedChatMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/style-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedChatMessages,
          profile,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao chamar a IA");
      }

      const data = (await response.json()) as StyleChatResponse;

      const mergedProfile: StyleProfile = {
        perception: data.profile?.perception ?? profile.perception,
        styles: data.profile?.styles ?? profile.styles,
        colorsPreferred: data.profile?.colorsPreferred ?? profile.colorsPreferred,
        colorsAvoid: data.profile?.colorsAvoid ?? profile.colorsAvoid,
        occasions: data.profile?.occasions ?? profile.occasions,
        formality: data.profile?.formality ?? profile.formality,
        silhouettes: data.profile?.silhouettes ?? profile.silhouettes,
        materials: data.profile?.materials ?? profile.materials,
        avoidPieces: data.profile?.avoidPieces ?? profile.avoidPieces,
      };

      setProfile(mergedProfile);

      const assistantMessage: ChatItem = {
        id: messages.length + 2,
        name: "Consultor de Estilo",
        profileImage: assistantProfileImage,
        lastActive: "agora",
        message: data.ready
          ? buildSummary(mergedProfile)
          : data.assistant_message,
        isSender: false,
      };

      const nextChatMessages: ChatMessage[] = [
        ...updatedChatMessages,
        { role: "assistant", content: assistantMessage.message },
      ];

      setMessages((prev) => [...prev, assistantMessage]);
      setChatMessages(nextChatMessages);

      if (data.ready) {
        setIsCompleted(true);
      }
    } catch {
      const fallbackMessage: ChatItem = {
        id: messages.length + 2,
        name: "Consultor de Estilo",
        profileImage: assistantProfileImage,
        lastActive: "agora",
        message:
          "Tive um problema ao processar sua mensagem. Pode tentar de novo?",
        isSender: false,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 xl:w-3/4">
      <ChatBoxHeader />
      <div
        ref={scrollRef}
        className="flex-1 max-h-full p-5 space-y-6 overflow-auto custom-scrollbar xl:space-y-8 xl:p-6"
      >
        {messages.map((chat) => (
          <div
            key={chat.id}
            className={`flex ${
              chat.isSender ? "justify-end" : "items-start gap-4"
            }`}
          >
            {!chat.isSender && (
              <div className="w-10 h-10 overflow-hidden rounded-full">
                {chat.profileImage ? (
                  <Image
                    src={chat.profileImage}
                    alt={`${chat.name} profile`}
                    width={40}
                    height={40}
                    className="object-cover object-center w-full h-full"
                  />
                ) : null}
              </div>
            )}

            <div className={`${chat.isSender ? "text-right" : ""}`}>
              <div
                className={`px-3 py-2 rounded-lg ${
                  chat.isSender
                    ? "bg-brand-500 text-white dark:bg-brand-500"
                    : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90"
                } ${chat.isSender ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              >
                <p className="text-sm whitespace-pre-line">{chat.message}</p>
              </div>
              <p className="mt-2 text-gray-500 text-theme-xs dark:text-gray-400">
                {chat.isSender
                  ? chat.lastActive
                  : `${chat.name}, ${chat.lastActive}`}
              </p>
            </div>
          </div>
        ))}
      </div>
      <ChatBoxSendForm
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isCompleted || isLoading}
      />
    </div>
  );
}
