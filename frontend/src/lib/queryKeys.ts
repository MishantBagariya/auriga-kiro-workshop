/**
 * Single definition of the query key hierarchy described in
 * architecture.md. Hooks import from here rather than writing array
 * literals inline, so invalidation stays consistent.
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    tasks: (id: string) => ['projects', id, 'tasks'] as const,
  },
  tasks: {
    list: <T extends object>(filters: T) => ['tasks', filters] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
  dashboard: {
    summary: ['dashboard'] as const,
  },
};
