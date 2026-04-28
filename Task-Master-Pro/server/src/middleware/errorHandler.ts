import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const path = first?.path.map(String).join(".") || "input";
    res.status(400).json({
      message: `Invalid ${path}: ${first?.message ?? "validation error"}`,
    });
    return;
  }

  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  ) {
    const status = (err as { status: number }).status;
    const message =
      "message" in err && typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Request failed";
    res.status(status).json({ message });
    return;
  }

  console.error("Unhandled error:", err instanceof Error ? err.message : String(err));
  if (err instanceof Error) {
    console.error("Stack:", err.stack);
  }
  res.status(500).json({ message: "Internal server error" });
};
