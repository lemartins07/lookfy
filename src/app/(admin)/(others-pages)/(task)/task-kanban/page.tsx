import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskHeader from "@/components/task/TaskHeader";
import KanbanBoard from "@/components/task/kanban/KanbanBoard";
import React from "react";

export default function TaskKanban() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Kanban" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <TaskHeader />
        <KanbanBoard />
      </div>
    </div>
  );
}
