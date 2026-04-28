import { Router, type IRouter } from "express";
import authRouter from "./auth.js";
import tasksRouter from "./tasks.js";
import statsRouter from "./stats.js";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/tasks", tasksRouter);
router.use("/stats", statsRouter);

export default router;
