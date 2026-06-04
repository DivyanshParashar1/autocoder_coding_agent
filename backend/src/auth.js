import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DB_PATH || path.resolve("./data/agent.db");

export const auth = betterAuth({
  database: new Database(dbPath),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 4000}`,
  trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:5173"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});