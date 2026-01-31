import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FaqsOne from "@/components/example/FaqsExample/FaqsOne";
import FaqsThree from "@/components/example/FaqsExample/FaqsThree";
import FaqsTwo from "@/components/example/FaqsExample/FaqsTwo";
import React from "react";

export default function Faqs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Faqs" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Faq’s 1">
          <FaqsOne />
        </ComponentCard>
        <ComponentCard title="Faq’s 2">
          <FaqsTwo />
        </ComponentCard>
        <ComponentCard title="Faq’s 3">
          <FaqsThree />
        </ComponentCard>
      </div>
    </div>
  );
}
