import { z } from "zod";

export const SignupBody = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const PriorityEnum = z.enum(["low", "medium", "high"]);
const StatusEnum = z.enum(["pending", "completed"]);

export const CreateTaskBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const UpdateTaskBody = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateTaskParams = idParam;
export const DeleteTaskParams = idParam;

export const ListTasksQueryParams = z.object({
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  search: z.string().optional(),
});
