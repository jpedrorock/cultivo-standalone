import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🌱 Criando dados de seed...\n");

// 1. Criar strains
console.log("📋 Criando strains...");
const strain1Result = await db.insert(schema.strains).values({
  name: "OG Kush",
  description: "Strain clássica com alto rendimento",
  vegaWeeks: 4,
  floraWeeks: 8,
});
const strain1 = { id: Number(strain1Result[0].insertId) };

const strain2Result = await db.insert(schema.strains).values({
  name: "Blue Dream",
  description: "Sativa equilibrada para uso diurno",
  vegaWeeks: 4,
  floraWeeks: 9,
});
const strain2 = { id: Number(strain2Result[0].insertId) };

console.log(`✓ Criadas 2 strains`);

// 2. Criar 3 estufas
console.log("\n🏠 Criando estufas...");
const tentAResult = await db.insert(schema.tents).values({
  name: "Estufa A - Manutenção",
  category: "MAINTENANCE",
  width: 120,
  depth: 120,
  height: 200,
  volume: "2880.000",
  powerW: 100,
  createdAt: new Date(),
});
const tentA = { id: Number(tentAResult[0].insertId) };

const tentBResult = await db.insert(schema.tents).values({
  name: "Estufa B - Vegetativa",
  category: "VEGA",
  width: 150,
  depth: 150,
  height: 200,
  volume: "4500.000",
  powerW: 300,
  createdAt: new Date(),
});
const tentB = { id: Number(tentBResult[0].insertId) };

const tentCResult = await db.insert(schema.tents).values({
  name: "Estufa C - Floração",
  category: "FLORA",
  width: 200,
  depth: 150,
  height: 200,
  volume: "6000.000",
  powerW: 600,
  createdAt: new Date(),
});
const tentC = { id: Number(tentCResult[0].insertId) };

console.log(`✓ Criadas 3 estufas`);

// 3. Criar ciclos ativos para estufas B e C
console.log("\n🔄 Criando ciclos...");
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7); // Começou há 1 semana

const cycleBResult = await db.insert(schema.cycles).values({
  tentId: tentB.id,
  strainId: strain1.id,
  phase: "VEGA",
  weekNumber: 2,
  startDate: startDate,
  status: "ACTIVE",
});
const cycleB = { id: Number(cycleBResult[0].insertId) };

const cycleCResult = await db.insert(schema.cycles).values({
  tentId: tentC.id,
  strainId: strain2.id,
  phase: "FLORA",
  weekNumber: 3,
  startDate: startDate,
  status: "ACTIVE",
});
const cycleC = { id: Number(cycleCResult[0].insertId) };

console.log(`✓ Criados 2 ciclos ativos`);

// 4. Criar plantas (2 em cada estufa ativa)
console.log("\n🌿 Criando plantas...");
const plantsBResult = await db.insert(schema.plants).values([
  {
    name: "OG Kush #1",
    code: "OG-B1",
    strainId: strain1.id,
    currentTentId: tentB.id,
    status: "ACTIVE",
  },
  {
    name: "OG Kush #2",
    code: "OG-B2",
    strainId: strain1.id,
    currentTentId: tentB.id,
    status: "ACTIVE",
  },
]);
const plantsB = [
  { id: Number(plantsBResult[0].insertId) },
  { id: Number(plantsBResult[0].insertId) + 1 },
];

const plantsCResult = await db.insert(schema.plants).values([
  {
    name: "Blue Dream #1",
    code: "BD-C1",
    strainId: strain2.id,
    currentTentId: tentC.id,
    status: "ACTIVE",
  },
  {
    name: "Blue Dream #2",
    code: "BD-C2",
    strainId: strain2.id,
    currentTentId: tentC.id,
    status: "ACTIVE",
  },
]);
const plantsC = [
  { id: Number(plantsCResult[0].insertId) },
  { id: Number(plantsCResult[0].insertId) + 1 },
];

console.log(`✓ Criadas 4 plantas (2 em cada estufa ativa)`);

// 5. Criar registros diários de 1 semana
console.log("\n📊 Criando registros diários (7 dias)...");
const logs = [];

for (let day = 0; day < 7; day++) {
  const logDate = new Date(startDate);
  logDate.setDate(logDate.getDate() + day);
  
  // Registros AM e PM para Estufa B (Vega)
  logs.push({
    tentId: tentB.id,
    cycleId: cycleB.id,
    period: "AM",
    temperature: 24 + Math.random() * 2, // 24-26°C
    humidity: 65 + Math.random() * 5, // 65-70%
    ppfd: 400 + Math.random() * 50, // 400-450 µmol/m²/s
    photoperiod: 18,
    ph: 5.8 + Math.random() * 0.4, // 5.8-6.2
    ec: 1.2 + Math.random() * 0.3, // 1.2-1.5 mS/cm
    waterVolume: 2 + Math.random(), // 2-3L
    observations: day === 0 ? "Início da semana 2" : null,
    createdAt: logDate,
  });
  
  logs.push({
    tentId: tentB.id,
    cycleId: cycleB.id,
    period: "PM",
    temperature: 22 + Math.random() * 2, // 22-24°C
    humidity: 60 + Math.random() * 5, // 60-65%
    ppfd: 0, // Luzes apagadas
    photoperiod: 18,
    ph: 5.8 + Math.random() * 0.4,
    ec: 1.2 + Math.random() * 0.3,
    waterVolume: null,
    observations: null,
    createdAt: new Date(logDate.getTime() + 12 * 60 * 60 * 1000), // 12h depois
  });
  
  // Registros AM e PM para Estufa C (Flora)
  logs.push({
    tentId: tentC.id,
    cycleId: cycleC.id,
    period: "AM",
    temperature: 26 + Math.random() * 2, // 26-28°C
    humidity: 50 + Math.random() * 5, // 50-55%
    ppfd: 600 + Math.random() * 50, // 600-650 µmol/m²/s
    photoperiod: 12,
    ph: 6.0 + Math.random() * 0.4, // 6.0-6.4
    ec: 1.6 + Math.random() * 0.4, // 1.6-2.0 mS/cm
    waterVolume: 3 + Math.random() * 2, // 3-5L
    observations: day === 0 ? "Início da semana 3 de floração" : null,
    createdAt: logDate,
  });
  
  logs.push({
    tentId: tentC.id,
    cycleId: cycleC.id,
    period: "PM",
    temperature: 24 + Math.random() * 2, // 24-26°C
    humidity: 45 + Math.random() * 5, // 45-50%
    ppfd: 0, // Luzes apagadas
    photoperiod: 12,
    ph: 6.0 + Math.random() * 0.4,
    ec: 1.6 + Math.random() * 0.4,
    waterVolume: null,
    observations: null,
    createdAt: new Date(logDate.getTime() + 12 * 60 * 60 * 1000),
  });
}

await db.insert(schema.dailyLogs).values(logs);
console.log(`✓ Criados ${logs.length} registros diários (AM/PM)`);

// 6. Criar registros de saúde das plantas
console.log("\n🏥 Criando registros de saúde...");
const healthLogs = [];

for (const plant of [...plantsB, ...plantsC]) {
  // 3 registros de saúde ao longo da semana (dia 0, 3, 6)
  for (const day of [0, 3, 6]) {
    const healthDate = new Date(startDate);
    healthDate.setDate(healthDate.getDate() + day);
    
    healthLogs.push({
      plantId: plant.id,
      date: healthDate,
      overallHealth: ["EXCELLENT", "GOOD", "GOOD"][Math.floor(Math.random() * 3)],
      leafColor: "GREEN",
      pestIssues: false,
      nutrientDeficiency: false,
      notes: day === 0 ? "Planta saudável" : null,
    });
  }
}

await db.insert(schema.plantHealthLogs).values(healthLogs);
console.log(`✓ Criados ${healthLogs.length} registros de saúde`);

// 7. Criar registros de tricomas (apenas para plantas em floração)
console.log("\n💎 Criando registros de tricomas...");
const trichomaLogs = [];

for (const plant of plantsC) {
  // 2 registros de tricomas na semana (dia 2, 5)
  for (const day of [2, 5]) {
    const trichomaDate = new Date(startDate);
    trichomaDate.setDate(trichomaDate.getDate() + day);
    
    trichomaLogs.push({
      plantId: plant.id,
      date: trichomaDate,
      clearPercent: 60 - day * 5, // Diminuindo
      cloudyPercent: 30 + day * 3, // Aumentando
      amberPercent: 10 + day * 2, // Aumentando
      notes: "Desenvolvimento normal",
    });
  }
}

await db.insert(schema.plantTrichomeLogs).values(trichomaLogs);
console.log(`✓ Criados ${trichomaLogs.length} registros de tricomas`);

// 8. Criar registros de LST
console.log("\n🪢 Criando registros de LST...");
const lstLogs = [];

for (const plant of [...plantsB, ...plantsC]) {
  // 2 registros de LST na semana (dia 1, 4)
  for (const day of [1, 4]) {
    const lstDate = new Date(startDate);
    lstDate.setDate(lstDate.getDate() + day);
    
    lstLogs.push({
      plantId: plant.id,
      date: lstDate,
      technique: "LST",
      description: "Ajuste de galhos principais",
      notes: "Crescimento uniforme",
    });
  }
}

await db.insert(schema.plantLSTLogs).values(lstLogs);
console.log(`✓ Criados ${lstLogs.length} registros de LST`);

// 9. Criar presets de fertilização
console.log("\n🧪 Criando presets de fertilização...");
await db.insert(schema.fertilizationPresets).values([
  {
    name: "Vegetativa Básica",
    phase: "VEGA",
    nitrogenPpm: 150,
    phosphorusPpm: 50,
    potassiumPpm: 100,
    calciumPpm: 100,
    magnesiumPpm: 50,
    ironPpm: 3,
    sulfurPpm: 50,
    notes: "Fórmula básica para fase vegetativa",
  },
  {
    name: "Floração Intensa",
    phase: "FLORA",
    nitrogenPpm: 100,
    phosphorusPpm: 100,
    potassiumPpm: 150,
    calciumPpm: 120,
    magnesiumPpm: 60,
    ironPpm: 4,
    sulfurPpm: 60,
    notes: "Fórmula para floração com alto P-K",
  },
]);
console.log(`✓ Criados 2 presets de fertilização`);

// 10. Criar presets de rega
console.log("\n💧 Criando presets de rega...");
await db.insert(schema.wateringPresets).values([
  {
    name: "Rega Vegetativa",
    phase: "VEGA",
    volumeLiters: 2.5,
    frequency: "Diária",
    notes: "Rega diária para fase vegetativa",
  },
  {
    name: "Rega Floração",
    phase: "FLORA",
    volumeLiters: 4.0,
    frequency: "Diária",
    notes: "Rega abundante para floração",
  },
]);
console.log(`✓ Criados 2 presets de rega`);

await connection.end();

console.log("\n✅ Seed completo! Banco de dados populado com:");
console.log("  - 3 estufas (Manutenção, Vegetativa, Floração)");
console.log("  - 2 strains (OG Kush, Blue Dream)");
console.log("  - 2 ciclos ativos");
console.log("  - 4 plantas (2 em cada estufa ativa)");
console.log("  - 28 registros diários (7 dias × 2 períodos × 2 estufas)");
console.log("  - 12 registros de saúde");
console.log("  - 4 registros de tricomas");
console.log("  - 8 registros de LST");
console.log("  - 4 presets (2 fertilização + 2 rega)");
console.log("\n🚀 Pronto para uso!");
