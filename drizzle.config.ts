import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "file:./local.db";

// Auto-detect dialect based on connection string
const isSQLite = connectionString.startsWith("file:");
const dialect = isSQLite ? "sqlite" : "mysql";

console.log(`[Drizzle] Using ${dialect} dialect with connection: ${connectionString}`);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: dialect as "mysql" | "sqlite",
  dbCredentials: isSQLite
    ? { url: connectionString }
    : { url: connectionString },
});
