import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema/index.js";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH ?? "./taskflow.db";

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

export * from "./schema/index.js";