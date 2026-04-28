import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema/index.js";

const dbPath = process.env.DATABASE_PATH ?? "./taskflow.db";

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

export * from "./schema/index.js";