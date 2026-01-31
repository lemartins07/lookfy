import ChatBox from "@/components/chats/ChatBox";
import React from "react";

export default function Chats() {
  return (
    <div>
      <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
        <div className="flex h-full flex-col">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
