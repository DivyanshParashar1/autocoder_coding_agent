import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULT_DB_PATH = path.resolve("./data/agent.db");
const SCHEMA_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql");

export function initDb(dbPath = DEFAULT_DB_PATH) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
  return db;
}
