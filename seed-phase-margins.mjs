import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("Seeding phaseAlertMargins...");

const margins = [
  {
    phase: "MAINTENANCE",
    tempMargin: "3.0", // ±3°C (mais tolerante)
    rhMargin: "10.0", // ±10% RH
    ppfdMargin: 100, // ±100 PPFD
    phMargin: "0.3", // ±0.3 pH
  },
  {
    phase: "CLONING",
    tempMargin: "2.0", // ±2°C
    rhMargin: "5.0", // ±5% RH
    ppfdMargin: 50, // ±50 PPFD
    phMargin: "0.2", // ±0.2 pH
  },
  {
    phase: "VEGA",
    tempMargin: "2.0", // ±2°C
    rhMargin: "5.0", // ±5% RH
    ppfdMargin: 50, // ±50 PPFD
    phMargin: "0.2", // ±0.2 pH
  },
  {
    phase: "FLORA",
    tempMargin: "2.0", // ±2°C
    rhMargin: "5.0", // ±5% RH
    ppfdMargin: 50, // ±50 PPFD
    phMargin: "0.2", // ±0.2 pH
  },
  {
    phase: "DRYING",
    tempMargin: "1.0", // ±1°C (controle rigoroso!)
    rhMargin: "3.0", // ±3% RH (controle rigoroso!)
    ppfdMargin: 0, // 0 PPFD (ambiente escuro)
    phMargin: null, // N/A para secagem
  },
];

for (const margin of margins) {
  await db.insert(schema.phaseAlertMargins).values(margin);
  console.log(`✅ Inserted ${margin.phase} margins`);
}

console.log("✅ Seed completed!");
await connection.end();
