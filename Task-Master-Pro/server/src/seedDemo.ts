import { db, usersTable, tasksTable } from "./db.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.js";

export const DEMO_EMAIL = "demo@taskflow.app";
export const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo User";

const sampleTasks = [
  {
    title: "Welcome to TaskFlow",
    description: "Try editing this task, marking it complete, or deleting it.",
    priority: "high" as const,
    status: "pending" as const,
    dueOffsetDays: 1,
  },
  {
    title: "Review quarterly metrics",
    description: "Pull the latest dashboard and write a one-page summary.",
    priority: "medium" as const,
    status: "pending" as const,
    dueOffsetDays: 3,
  },
  {
    title: "Plan portfolio refresh",
    description: "Outline three case studies to publish next month.",
    priority: "medium" as const,
    status: "pending" as const,
    dueOffsetDays: 7,
  },
  {
    title: "Reply to last week's emails",
    description: null,
    priority: "low" as const,
    status: "completed" as const,
    dueOffsetDays: -2,
  },
];

export async function seedDemoUser(): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, DEMO_EMAIL))
      .limit(1);

    let userId: number;

    if (existing.length === 0) {
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      const [created] = await db
        .insert(usersTable)
        .values({
          email: DEMO_EMAIL,
          name: DEMO_NAME,
          passwordHash,
        })
        .returning();
      userId = created!.id;
      console.log(`Seeded demo user: ${DEMO_EMAIL}`);
    } else {
      userId = existing[0]!.id;
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      await db
        .update(usersTable)
        .set({ passwordHash, name: DEMO_NAME })
        .where(eq(usersTable.id, userId));
    }

    const existingTasks = await db
      .select({ id: tasksTable.id })
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId))
      .limit(1);

    if (existingTasks.length === 0) {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      await db.insert(tasksTable).values(
        sampleTasks.map((t) => ({
          userId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: new Date(now + t.dueOffsetDays * day).toISOString(),
        })),
      );
      console.log(`Seeded ${sampleTasks.length} demo tasks`);
    }
  } catch (err) {
    console.error("Failed to seed demo user:", err);
  }
}
