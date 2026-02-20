import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";
import fs from "fs";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🧹 Limpando banco de dados...\n");

// Desabilitar foreign key checks
await connection.query("SET FOREIGN_KEY_CHECKS = 0");

// Limpar todas as tabelas
const tables = [
  "plantTrichomeLogs",
  "plantRunoffLogs",
  "plantLSTLogs",
  "plantHealthLogs",
  "plantObservations",
  "plantPhotos",
  "plantTentHistory",
  "cloningEvents",
  "plants",
  "nutrientApplications",
  "wateringApplications",
  "dailyLogs",
  "weeklyTargets",
  "taskInstances",
  "taskTemplates",
  "cycles",
  "tentAState",
  "tents",
  "strains",
  "alertHistory",
  "alertPreferences",
  "alertSettings",
  "alerts",
  "notificationHistory",
  "notificationSettings",
  "phaseAlertMargins",
  "safetyLimits",
  "fertilizationPresets",
  "wateringPresets",
  "recipeTemplates",
  "recipes",
];

for (const table of tables) {
  await connection.query(`DELETE FROM ${table}`);
  console.log(`✓ Limpa: ${table}`);
}

// Reabilitar foreign key checks
await connection.query("SET FOREIGN_KEY_CHECKS = 1");

console.log("\n📦 Importando dados limpos...\n");

// Ler arquivo JSON
const seedData = JSON.parse(fs.readFileSync("./seed-data-clean.json", "utf-8"));

// Importar strains
if (seedData.strains?.length) {
  await db.insert(schema.strains).values(seedData.strains);
  console.log(`✓ Importadas ${seedData.strains.length} strains`);
}

// Importar tents
if (seedData.tents?.length) {
  await db.insert(schema.tents).values(seedData.tents);
  console.log(`✓ Importadas ${seedData.tents.length} estufas`);
}

// Importar presets de fertilização
if (seedData.fertilizationPresets?.length) {
  await db.insert(schema.fertilizationPresets).values(seedData.fertilizationPresets);
  console.log(`✓ Importados ${seedData.fertilizationPresets.length} presets de fertilização`);
}

// Importar presets de rega
if (seedData.wateringPresets?.length) {
  await db.insert(schema.wateringPresets).values(seedData.wateringPresets);
  console.log(`✓ Importados ${seedData.wateringPresets.length} presets de rega`);
}

await connection.end();

console.log("\n✅ Banco de dados limpo e populado com sucesso!");
console.log("  - 2 strains (OG Kush, Blue Dream)");
console.log("  - 3 estufas (Manutenção, Vegetativa, Floração)");
console.log("  - 4 presets (2 fertilização + 2 rega)");
console.log("\n🚀 Pronto para uso!");
