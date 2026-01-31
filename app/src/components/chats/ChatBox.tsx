"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";

interface ChatItem {
  id: number;
  name: string;
  profileImage?: string;
  lastActive: string;
  message: string;
  isSender: boolean;
}

const assistantProfileImage = "/images/user/user-17.jpg";
const questions = [
  "Como você gostaria de ser percebido(a) pelo seu estilo?",
  "Quais estilos você mais gosta ou se inspira?",
  "Quais cores você prefere usar no dia a dia? E quais evita?",
  "Quais ocasiões são mais comuns na sua rotina?",
  "Você prefere roupas mais ajustadas ou mais soltas?",
  "Existe algum tecido/peça que você não usa?",
];

const introMessage =
  "Oi! Vou fazer algumas perguntas rápidas para entender seu estilo. Responda com texto livre.";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 1,
      name: "Consultor de Estilo",
      profileImage: assistantProfileImage,
      lastActive: "agora",
      message: introMessage,
      isSender: false,
    },
    {
      id: 2,
      name: "Consultor de Estilo",
      profileImage: assistantProfileImage,
      lastActive: "agora",
      message: questions[0],
      isSender: false,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isCompleted = currentQuestionIndex >= questions.length;

  const summaryMessage = useMemo(() => {
    if (!isCompleted) {
      return "";
    }
    const [percepcao, estilos, cores, ocasioes, silhuetas, evitar] = answers;
    return [
      "Perfeito! Com base nas suas respostas, criei um perfil inicial:",
      `• Percepção desejada: ${percepcao || "não informado"}`,
      `• Estilos/Referências: ${estilos || "não informado"}`,
      `• Cores preferidas e evitadas: ${cores || "não informado"}`,
      `• Ocasiões frequentes: ${ocasioes || "não informado"}`,
      `• Silhuetas preferidas: ${silhuetas || "não informado"}`,
      `• Peças/tecidos a evitar: ${evitar || "não informado"}`,
    ].join("\n");
  }, [answers, isCompleted]);

  useEffect(() => {
    if (!isCompleted) {
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: "Consultor de Estilo",
        profileImage: assistantProfileImage,
        lastActive: "agora",
        message: summaryMessage,
        isSender: false,
      },
    ]);
  }, [isCompleted, summaryMessage]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (trimmed.length === 0 || isCompleted) {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    const newMessages: ChatItem[] = [
      {
        id: 0,
        name: "Você",
        lastActive: "agora",
        message: trimmed,
        isSender: true,
      },
    ];

    setAnswers((prev) => [...prev, trimmed]);
    setInput("");

    if (nextIndex < questions.length) {
      newMessages.push({
        id: 0,
        name: "Consultor de Estilo",
        profileImage: assistantProfileImage,
        lastActive: "agora",
        message: questions[nextIndex],
        isSender: false,
      });
    }

    setMessages((prev) => {
      const baseId = prev.length;
      const withIds = newMessages.map((message, index) => ({
        ...message,
        id: baseId + index + 1,
      }));
      return [...prev, ...withIds];
    });

    setCurrentQuestionIndex(nextIndex);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      {/* <!-- ====== Chat Box Start --> */}
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
                  <img
                    src={chat.profileImage}
                    alt={`${chat.name} profile`}
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
        disabled={isCompleted}
      />
      {/* <!-- ====== Chat Box End --> */}
    </div>
  );
}
