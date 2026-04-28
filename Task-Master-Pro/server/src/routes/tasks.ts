import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, tasksTable } from "../db.js";
import {
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "../schemas.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { serializeTask } from "../serializers.js";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    console.log("Fetching tasks for user:", req.userId);
    const params = ListTasksQueryParams.parse(req.query);
    const userId = req.userId!;

    const conditions: SQL[] = [eq(tasksTable.userId, userId)];

    if (params.status) {
      conditions.push(eq(tasksTable.status, params.status));
    }
    if (params.priority) {
      conditions.push(eq(tasksTable.priority, params.priority));
    }
    if (params.search && params.search.trim().length > 0) {
      const term = `%${params.search.trim()}%`;
      const searchCondition = or(
        ilike(tasksTable.title, term),
        ilike(tasksTable.description, term),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const rows = await db
      .select()
      .from(tasksTable)
      .where(and(...conditions))
      .orderBy(desc(tasksTable.createdAt));

    console.log("Found tasks:", rows.length);
    res.json(rows.map(serializeTask));
  } catch (err) {
    console.error("Error in GET /tasks:", err);
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = CreateTaskBody.parse(req.body);
    const userId = req.userId!;

    const [task] = await db
      .insert(tasksTable)
      .values({
        userId,
        title: body.title.trim(),
        description: body.description ?? null,
        priority: body.priority ?? "medium",
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
      })
      .returning();

    if (!task) {
      res.status(500).json({ message: "Failed to create task" });
      return;
    }

    res.json(serializeTask(task));
  } catch (err) {
    console.error("Error in POST /tasks:", err);
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = UpdateTaskParams.parse(req.params);
    const body = UpdateTaskBody.parse(req.body);
    const userId = req.userId!;

    const updates: Partial<typeof tasksTable.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.dueDate !== undefined) {
      updates.dueDate = body.dueDate ? new Date(body.dueDate).toISOString() : null;
    }

    const [updated] = await db
      .update(tasksTable)
      .set(updates)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(serializeTask(updated));
  } catch (err) {
    console.error("Error in PATCH /tasks/:id:", err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = DeleteTaskParams.parse(req.params);
    const userId = req.userId!;

    const result = await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .returning({ id: tasksTable.id });

    if (result.length === 0) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
