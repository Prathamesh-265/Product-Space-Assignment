import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatusFilter = TaskStatus | "all";
export type TaskPriorityFilter = TaskPriority | "all";

export type Task = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatsSummary = {
  total: number;
  pending: number;
  completed: number;
  dueSoon: number;
  overdue: number;
  completionRate: number;
  byPriority: { low: number; medium: number; high: number };
};

export type SignupRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type AuthResponse = { token: string; user: User };

export type ListTasksParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};
export type CreateTaskRequest = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
};
export type UpdateTaskRequest = Partial<CreateTaskRequest> & { status?: TaskStatus };

// ---------------------------------------------------------------------------
// Token storage + fetch wrapper
// ---------------------------------------------------------------------------

const TOKEN_KEY = "taskflow_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const apiBase = import.meta.env.VITE_API_URL ?? "";
  let url = `${apiBase}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { "content-type": "application/json" };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : null) ?? res.statusText ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const getGetCurrentUserQueryKey = () => ["auth", "me"] as const;
export const getListTasksQueryKey = (params?: ListTasksParams) =>
  ["tasks", "list", params ?? {}] as const;
export const getGetStatsSummaryQueryKey = () => ["stats", "summary"] as const;

// ---------------------------------------------------------------------------
// Auth hooks
// ---------------------------------------------------------------------------

export function useSignup() {
  return useMutation<AuthResponse, ApiError, { data: SignupRequest }>({
    mutationFn: ({ data }) => request<AuthResponse>("POST", "/api/auth/signup", data),
  });
}

export function useLogin() {
  return useMutation<AuthResponse, ApiError, { data: LoginRequest }>({
    mutationFn: ({ data }) => request<AuthResponse>("POST", "/api/auth/login", data),
  });
}

type GetCurrentUserOptions = {
  query?: Partial<UseQueryOptions<User, ApiError>>;
};

export function useGetCurrentUser(options?: GetCurrentUserOptions) {
  return useQuery<User, ApiError>({
    queryKey: getGetCurrentUserQueryKey(),
    queryFn: () => request<User>("GET", "/api/auth/me"),
    enabled: !!getToken(),
    ...options?.query,
  });
}

// ---------------------------------------------------------------------------
// Task hooks
// ---------------------------------------------------------------------------

export function useListTasks(params?: ListTasksParams) {
  return useQuery<Task[], ApiError>({
    queryKey: getListTasksQueryKey(params),
    queryFn: () => request<Task[]>("GET", "/api/tasks", undefined, params as Record<string, string | undefined>),
    enabled: !!getToken(),
  });
}

export function useCreateTask() {
  return useMutation<Task, ApiError, { data: CreateTaskRequest }>({
    mutationFn: ({ data }) => request<Task>("POST", "/api/tasks", data),
  });
}

export function useUpdateTask() {
  return useMutation<Task, ApiError, { id: number; data: UpdateTaskRequest }>({
    mutationFn: ({ id, data }) => request<Task>("PATCH", `/api/tasks/${id}`, data),
  });
}

export function useDeleteTask() {
  return useMutation<{ success: boolean }, ApiError, { id: number }>({
    mutationFn: ({ id }) => request<{ success: boolean }>("DELETE", `/api/tasks/${id}`),
  });
}

// ---------------------------------------------------------------------------
// Stats hooks
// ---------------------------------------------------------------------------

export function useGetStatsSummary() {
  return useQuery<StatsSummary, ApiError>({
    queryKey: getGetStatsSummaryQueryKey(),
    queryFn: () => request<StatsSummary>("GET", "/api/stats/summary"),
    enabled: !!getToken(),
  });
}
