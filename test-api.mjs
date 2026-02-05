import { getDailyLogs } from "./server/db.ts";
import { subDays } from "date-fns";

const startDate = subDays(new Date(), 7);
const endDate = new Date();

console.log("Testing getDailyLogs...");
console.log("Start date:", startDate);
console.log("End date:", endDate);

const logs = await getDailyLogs(1, startDate, endDate);
console.log("Logs found:", logs.length);
console.log("Logs:", JSON.stringify(logs, null, 2));
