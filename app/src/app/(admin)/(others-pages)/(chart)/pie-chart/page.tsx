import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PieChartOne from "@/components/charts/pie/PieChartOne";
import PieChartTwo from "@/components/charts/pie/PieChartTwo";
import React from "react";

export default function PieChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pie Chart" />
      <div className="space-y-6">
        <PieChartOne />
        <PieChartTwo />
      </div>
    </div>
  );
}
