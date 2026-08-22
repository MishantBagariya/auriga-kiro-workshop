import { Card } from "../ui/Card";
import { TaskRow } from "./TaskRow";
import type { Task } from "../../types";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="hidden border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:flex md:items-center md:gap-4">
        <span className="flex-1">Title</span>
        <span className="w-40">Project</span>
        <span className="w-32">Status</span>
        <span className="w-24">Priority</span>
        <span className="w-24">Due date</span>
      </div>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </Card>
  );
}
