import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "../api/tasks";
import type { CreateTaskInput, Task, TaskListParams, TaskStatus, UpdateTaskInput } from "../types";

export function useTasksQuery(params: TaskListParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.listTasks(params),
  });
}

export function useTaskQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.getTask(id as string),
    enabled: !!id,
  });
}

function invalidateAfterTaskMutation(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: string
) {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  if (projectId) {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.createTask(input),
    onSuccess: (task) => invalidateAfterTaskMutation(queryClient, task.projectId),
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.updateTask(id, input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      invalidateAfterTaskMutation(queryClient, task.projectId);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
      previous.forEach(([key, tasks]) => {
        if (!tasks) return;
        queryClient.setQueryData<Task[]>(
          key,
          tasks.map((t) => (t.id === id ? { ...t, status } : t))
        );
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, tasks]) => {
        queryClient.setQueryData(key, tasks);
      });
    },
    onSettled: (task) => {
      queryClient.invalidateQueries({ queryKey: ["task", task?.id] });
      invalidateAfterTaskMutation(queryClient, task?.projectId);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; projectId?: string }) => tasksApi.deleteTask(id),
    onSuccess: (_data, variables) => invalidateAfterTaskMutation(queryClient, variables.projectId),
  });
}
