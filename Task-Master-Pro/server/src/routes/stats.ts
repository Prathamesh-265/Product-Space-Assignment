import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tasksTable } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId));

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let pending = 0;
    let completed = 0;
    let dueSoon = 0;
    let overdue = 0;
    const byPriority = { low: 0, medium: 0, high: 0 };

    for (const t of tasks) {
      if (t.status === "completed") {
        completed++;
      } else {
        pending++;
        if (t.dueDate) {
          const dueDate = new Date(t.dueDate);
          if (dueDate < now) overdue++;
          else if (dueDate <= sevenDaysFromNow) dueSoon++;
        }
      }
      if (t.priority === "low") byPriority.low++;
      else if (t.priority === "high") byPriority.high++;
      else byPriority.medium++;
    }

    const total = tasks.length;
    const completionRate = total === 0 ? 0 : Number((completed / total).toFixed(4));

    res.json({
      total,
      pending,
      completed,
      dueSoon,
      overdue,
      completionRate,
      byPriority,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
