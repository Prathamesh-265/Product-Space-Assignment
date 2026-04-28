import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../db.js";
import { SignupBody, LoginBody } from "../schemas.js";
import { hashPassword, verifyPassword, signToken } from "../auth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { serializeUser } from "../serializers.js";

const router: IRouter = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const body = SignupBody.parse(req.body);
    const email = body.email.trim().toLowerCase();

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ message: "An account with that email already exists" });
      return;
    }

    const passwordHash = await hashPassword(body.password);
    const [user] = await db
      .insert(usersTable)
      .values({
        name: body.name.trim(),
        email,
        passwordHash,
      })
      .returning();

    if (!user) {
      res.status(500).json({ message: "Failed to create account" });
      return;
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = LoginBody.parse(req.body);
    const email = body.email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
});

export default router;
