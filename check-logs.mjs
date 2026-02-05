import { drizzle } from "drizzle-orm/mysql2";
import { dailyLogs } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);
const logs = await db.select().from(dailyLogs);
console.log("Total de registros:", logs.length);
console.log("Registros:", JSON.stringify(logs, null, 2));
