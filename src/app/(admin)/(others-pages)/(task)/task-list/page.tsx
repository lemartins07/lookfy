import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskListPage from "@/components/task/task-list/TaskListPage";
import React from "react";

export default function TaskList() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Task List" />
      <TaskListPage />
    </div>
  );
}
