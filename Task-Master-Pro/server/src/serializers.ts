import type { User, Task } from "./schema/index.js";

export function serializeUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt:
      typeof u.createdAt === "string"
        ? u.createdAt
        : u.createdAt
          ? new Date(u.createdAt).toISOString()
          : new Date().toISOString(),
  };
}

export function serializeTask(t: Task) {
  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    description: t.description,
    status: t.status as "pending" | "completed",
    priority: t.priority as "low" | "medium" | "high",
    dueDate: t.dueDate
      ? typeof t.dueDate === "string"
        ? t.dueDate
        : new Date(t.dueDate).toISOString()
      : null,
    createdAt:
      typeof t.createdAt === "string"
        ? t.createdAt
        : t.createdAt
          ? new Date(t.createdAt).toISOString()
          : new Date().toISOString(),
    updatedAt:
      typeof t.updatedAt === "string"
        ? t.updatedAt
        : t.updatedAt
          ? new Date(t.updatedAt).toISOString()
          : new Date().toISOString(),
  };
}