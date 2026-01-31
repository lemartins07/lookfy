import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Invoice from "@/components/invoice/Invoice";
import React from "react";

export default function Invoices() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />
      <Invoice />
    </div>
  );
}
