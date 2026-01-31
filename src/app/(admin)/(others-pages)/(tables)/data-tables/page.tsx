import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTableOne from "@/components/tables/DataTables/TableOne/DataTableOne";
import DataTableThree from "@/components/tables/DataTables/TableThree/DataTableThree";
import DataTableTwo from "@/components/tables/DataTables/TableTwo/DataTableTwo";
import React from "react";

export default function DataTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Data Tables" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Data Table 1">
          <DataTableOne />
        </ComponentCard>
        <ComponentCard title="Data Table 2">
          <DataTableTwo />
        </ComponentCard>
        <ComponentCard title="Data Table 3">
          <DataTableThree />
        </ComponentCard>
      </div>
    </div>
  );
}
