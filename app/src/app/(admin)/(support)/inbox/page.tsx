import EmailContent from "@/components/email/EmailInbox/EmailContent";
import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";
import React from "react";

export default function EmailInbox() {
  return (
    <div className="h-screen sm:h-[calc(100vh-174px)] xl:h-[calc(100vh-186px)]">
      <div className="flex flex-col gap-5 sm:gap-5 xl:grid xl:grid-cols-12">
        <div className="col-span-full xl:col-span-3">
          <EmailSidebar />
        </div>
        <EmailContent />
      </div>
    </div>
  );
}
