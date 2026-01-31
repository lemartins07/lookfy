import EmailWrapper from "@/components/email/EmailDetails/EmailWrapper";
import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";
import React from "react";

export default function EmailDetails() {
  return (
    <div className="sm:h-[calc(100vh-174px)] xl:h-[calc(100vh-186px)]">
      <div className="flex flex-col gap-5 sm:gap-5 xl:grid xl:grid-cols-12">
        <div className="col-span-full xl:col-span-3">
          <EmailSidebar />
        </div>
        <div className="w-full xl:col-span-9">
          <EmailWrapper />
        </div>
      </div>
    </div>
  );
}
