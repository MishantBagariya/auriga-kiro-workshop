import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn, getPriorityColor, getPriorityLabel, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'
import { Calendar, ArrowRight } from 'lucide-react'
import type { Task } from 'shared'

interface TaskBoardViewProps {
  tasks: Task[]
}

const columns = [
  { status: 'TODO', label: 'To Do', gradient: 'from-slate-400 to-slate-500', dotColor: 'bg-slate-400' },
  { status: 'IN_PROGRESS', label: 'In Progress', gradient: 'from-blue-400 to-blue-500', dotColor: 'bg-blue-400' },
  { status: 'COMPLETED', label: 'Completed', gradient: 'from-emerald-400 to-emerald-500', dotColor: 'bg-emerald-400' },
] as const

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Task>(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 overflow-x-auto animate-fade-in">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status)
        return (
          <div key={column.status} className="flex flex-col rounded-xl bg-muted/40 p-3">
            {/* Column Header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className={cn('h-2.5 w-2.5 rounded-full', column.dotColor)} />
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2.5 min-h-[120px] flex-1">
              {columnTasks.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed">
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer rounded-xl border bg-card p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <p className="text-sm font-medium line-clamp-2 leading-snug">{task.title}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{task.project?.name}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', getPriorityColor(task.priority))}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>

                    {/* Quick status change */}
                    <div className="mt-2.5 flex gap-1.5">
                      {columns
                        .filter((c) => c.status !== column.status)
                        .map((c) => (
                          <button
                            key={c.status}
                            onClick={(e) => {
                              e.stopPropagation()
                              statusMutation.mutate({ id: task.id, status: c.status })
                            }}
                            disabled={statusMutation.isPending}
                            className="flex items-center gap-0.5 rounded-lg border bg-white px-2 py-1 text-[10px] font-medium hover:bg-accent transition-colors"
                            title={`Move to ${c.label}`}
                          >
                            <ArrowRight className="h-2.5 w-2.5" />
                            {c.label}
                          </button>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
