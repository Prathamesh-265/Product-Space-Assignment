import "dotenv/config";
import app from "./app.js";
import { seedDemoUser } from "./seedDemo.js";
import { execSync } from "child_process";

const port = Number(process.env.PORT ?? 3000);

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});


try {
  execSync("npx drizzle-kit push", { stdio: "inherit" });
  console.log("Database schema created");
} catch (e) {
  console.error("DB setup failed:", e);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  seedDemoUser().catch((e) => console.error("SEED ERROR:", e));
});