import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🌱 Iniciando seed de dados de uma semana completa...\n");

// Buscar IDs existentes
const existingTents = await db.select().from(schema.tents);
const existingStrains = await db.select().from(schema.strains);

if (existingTents.length !== 3) {
  console.error("❌ Erro: Esperado 3 estufas no banco!");
  process.exit(1);
}

if (existingStrains.length !== 2) {
  console.error("❌ Erro: Esperado 2 strains no banco!");
  process.exit(1);
}

const tentA = existingTents.find(t => t.name.includes("Manutenção") || t.name.includes("Manutencao"));
const tentB = existingTents.find(t => t.name.includes("Vega") || t.name.includes("Vegetativa"));
const tentC = existingTents.find(t => t.name.includes("Flora"));

const strainOG = existingStrains.find(s => s.name.includes("OG"));
const strainBlue = existingStrains.find(s => s.name.includes("Blue"));

console.log(`✅ Estufas encontradas: ${tentA.name}, ${tentB.name}, ${tentC.name}`);
console.log(`✅ Strains encontradas: ${strainOG.name}, ${strainBlue.name}\n`);

// Data base: hoje - 7 dias
const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);

// 1. Criar ciclos ativos
console.log("📅 Criando ciclos ativos...");

// Ciclo Vega (Estufa B) - Semana 3 de vegetação
const vegaStartDate = new Date(weekAgo);
vegaStartDate.setDate(vegaStartDate.getDate() - 14); // Começou há 3 semanas

const [cycleVegaResult] = await db.insert(schema.cycles).values({
  tentId: tentB.id,
  strainId: strainOG.id,
  startDate: vegaStartDate,
  status: "ACTIVE",
});
const cycleVegaId = Number(cycleVegaResult.insertId);

// Ciclo Flora (Estufa C) - Semana 5 de floração
const floraStartDate = new Date(weekAgo);
floraStartDate.setDate(floraStartDate.getDate() - 42); // Começou há 7 semanas (2 vega + 5 flora)
const floraTransitionDate = new Date(floraStartDate);
floraTransitionDate.setDate(floraTransitionDate.getDate() + 14); // Transição após 2 semanas de vega

const [cycleFloraResult] = await db.insert(schema.cycles).values({
  tentId: tentC.id,
  strainId: strainBlue.id,
  startDate: floraStartDate,
  floraStartDate: floraTransitionDate,
  status: "ACTIVE",
});
const cycleFloraId = Number(cycleFloraResult.insertId);

console.log(`  ✅ Ciclo Vega criado (ID: ${cycleVegaId})`);
console.log(`  ✅ Ciclo Flora criado (ID: ${cycleFloraId})\n`);

// 2. Criar plantas
console.log("🌿 Criando plantas...");

const plants = [
  // Estufa A (Manutenção) - 2 plantas mãe
  { currentTentId: tentA.id, strainId: strainOG.id, name: "Mãe OG #1", status: "ACTIVE", plantedDate: new Date("2025-01-01") },
  { currentTentId: tentA.id, strainId: strainBlue.id, name: "Mãe Blue #1", status: "ACTIVE", plantedDate: new Date("2025-01-01") },
  
  // Estufa B (Vega) - 2 plantas em vegetação
  { currentTentId: tentB.id, strainId: strainOG.id, name: "OG Vega #1", status: "ACTIVE", plantedDate: vegaStartDate },
  { currentTentId: tentB.id, strainId: strainOG.id, name: "OG Vega #2", status: "ACTIVE", plantedDate: vegaStartDate },
  
  // Estufa C (Flora) - 2 plantas em floração
  { currentTentId: tentC.id, strainId: strainBlue.id, name: "Blue Flora #1", status: "ACTIVE", plantedDate: floraStartDate },
  { currentTentId: tentC.id, strainId: strainBlue.id, name: "Blue Flora #2", status: "ACTIVE", plantedDate: floraStartDate },
];

const plantIds = [];
for (const plant of plants) {
  const [result] = await db.insert(schema.plants).values(plant);
  plantIds.push(Number(result.insertId));
}

console.log(`  ✅ ${plantIds.length} plantas criadas\n`);

// 3. Gerar registros diários (últimos 7 dias)
console.log("📊 Gerando registros diários...");

for (let day = 0; day < 7; day++) {
  const logDate = new Date(weekAgo);
  logDate.setDate(logDate.getDate() + day);
  
  // Registros para cada estufa (AM e PM)
  for (const tent of [tentA, tentB, tentC]) {
    for (const turn of ["AM", "PM"]) {
      const temp = 22 + Math.random() * 4; // 22-26°C
      const rh = 55 + Math.random() * 10; // 55-65%
      const ppfd = 400 + Math.random() * 200; // 400-600 µmol/m²/s
      
      await db.insert(schema.dailyLogs).values({
        tentId: tent.id,
        logDate,
        turn,
        temperature: temp.toFixed(1),
        relativeHumidity: rh.toFixed(1),
        ppfd: ppfd.toFixed(0),
      });
    }
  }
}

console.log(`  ✅ 42 registros diários criados (7 dias × 3 estufas × 2 turnos)\n`);

// 4. Gerar registros de saúde de plantas
console.log("💚 Gerando registros de saúde...");

for (let day = 0; day < 7; day += 2) { // A cada 2 dias
  const checkDate = new Date(weekAgo);
  checkDate.setDate(checkDate.getDate() + day);
  
  for (const plantId of plantIds) {
    await db.insert(schema.plantHealthLogs).values({
      plantId,
      checkDate,
      overallHealth: ["EXCELLENT", "GOOD", "FAIR"][Math.floor(Math.random() * 3)],
      leafColor: ["DARK_GREEN", "LIGHT_GREEN"][Math.floor(Math.random() * 2)],
      notes: day === 0 ? "Início da semana - plantas saudáveis" : null,
    });
  }
}

console.log(`  ✅ ${plantIds.length * 4} registros de saúde criados\n`);

// 5. Gerar registros de tricomas (apenas plantas em flora)
console.log("🔬 Gerando registros de tricomas...");

const floraPlantIds = plantIds.slice(4, 6); // Últimas 2 plantas (Flora)

for (let day = 0; day < 7; day += 3) { // A cada 3 dias
  const checkDate = new Date(weekAgo);
  checkDate.setDate(checkDate.getDate() + day);
  
  for (const plantId of floraPlantIds) {
    await db.insert(schema.plantTrichomeLogs).values({
      plantId,
      checkDate,
      clearPercent: 30 - (day * 3),
      cloudyPercent: 50 + (day * 2),
      amberPercent: 20 + (day * 1),
      notes: day >= 6 ? "Próximo da colheita" : null,
    });
  }
}

console.log(`  ✅ ${floraPlantIds.length * 3} registros de tricomas criados\n`);

// 6. Gerar registros de LST (apenas plantas em vega)
console.log("🪢 Gerando registros de LST...");

const vegaPlantIds = plantIds.slice(2, 4); // Plantas 3 e 4 (Vega)

for (let day = 0; day < 7; day += 2) { // A cada 2 dias
  const logDate = new Date(weekAgo);
  logDate.setDate(logDate.getDate() + day);
  
  for (const plantId of vegaPlantIds) {
    await db.insert(schema.plantLSTLogs).values({
      plantId,
      logDate,
      technique: "LST",
      response: "GOOD",
      notes: `LST dia ${day + 1}`,
    });
  }
}

console.log(`  ✅ ${vegaPlantIds.length * 4} registros de LST criados\n`);

// 7. Criar receitas de fertilização
console.log("🧪 Criando receitas de fertilização...");

for (let day = 0; day < 7; day += 2) { // A cada 2 dias
  const logDate = new Date(weekAgo);
  logDate.setDate(logDate.getDate() + day);
  
  // Receita para Estufa B (Vega)
  await db.insert(schema.recipes).values({
    tentId: tentB.id,
    logDate,
    turn: "AM",
    volumeTotalL: "50.00",
    ecTarget: "1.2",
    phTarget: "6.0",
    productsJson: JSON.stringify([
      { name: "Nitrato de Cálcio", grams: 25.0 },
      { name: "Nitrato de Potássio", grams: 15.0 },
      { name: "MKP", grams: 8.0 },
    ]),
    notes: "Fertilização vegetativa",
  });
  
  // Receita para Estufa C (Flora)
  await db.insert(schema.recipes).values({
    tentId: tentC.id,
    logDate,
    turn: "AM",
    volumeTotalL: "50.00",
    ecTarget: "1.8",
    phTarget: "6.2",
    productsJson: JSON.stringify([
      { name: "MKP", grams: 30.0 },
      { name: "Nitrato de Potássio", grams: 20.0 },
      { name: "Sulfato de Magnésio", grams: 12.0 },
    ]),
    notes: "Fertilização floração",
  });
}

console.log(`  ✅ 8 receitas de fertilização criadas\n`);

// 8. Criar templates de tarefas
console.log("📋 Criando templates de tarefas...");

const taskTemplates = [
  // Manutenção (Estufa A)
  { context: "TENT_A", phase: "MAINTENANCE", weekNumber: null, title: "Verificar plantas mãe", description: "Inspecionar saúde geral e podar se necessário" },
  { context: "TENT_A", phase: "MAINTENANCE", weekNumber: null, title: "Preparar clones", description: "Cortar e enraizar novos clones" },
  
  // Vegetação (Estufa B)
  { context: "TENT_BC", phase: "VEGA", weekNumber: 3, title: "LST e defoliação", description: "Aplicar LST e remover folhas inferiores" },
  { context: "TENT_BC", phase: "VEGA", weekNumber: 3, title: "Ajustar nutrientes", description: "Aumentar EC para 1.2-1.4" },
  
  // Floração (Estufa C)
  { context: "TENT_BC", phase: "FLORA", weekNumber: 5, title: "Verificar tricomas", description: "Inspecionar maturação dos tricomas" },
  { context: "TENT_BC", phase: "FLORA", weekNumber: 5, title: "Flush preparação", description: "Preparar para flush final" },
];

for (const template of taskTemplates) {
  await db.insert(schema.taskTemplates).values(template);
}

console.log(`  ✅ ${taskTemplates.length} templates de tarefas criados\n`);

// 9. Criar instâncias de tarefas
console.log("✅ Criando instâncias de tarefas...");

const occurrenceDate = new Date(today);
occurrenceDate.setDate(occurrenceDate.getDate() + 1); // Amanhã

// Buscar IDs dos templates criados
const templates = await db.select().from(schema.taskTemplates);

await db.insert(schema.taskInstances).values([
  { tentId: tentA.id, taskTemplateId: templates[0].id, occurrenceDate, isDone: false },
  { tentId: tentB.id, taskTemplateId: templates[2].id, occurrenceDate, isDone: false },
  { tentId: tentC.id, taskTemplateId: templates[4].id, occurrenceDate, isDone: false },
]);

console.log(`  ✅ 3 tarefas pendentes criadas\n`);

await connection.end();

console.log("🎉 Seed completo! Dados de uma semana criados com sucesso!");
console.log("\n📊 Resumo:");
console.log(`  - 2 ciclos ativos`);
console.log(`  - 6 plantas (2 por estufa)`);
console.log(`  - 42 registros diários`);
console.log(`  - ${plantIds.length * 4} registros de saúde`);
console.log(`  - ${floraPlantIds.length * 3} registros de tricomas`);
console.log(`  - ${vegaPlantIds.length * 4} registros de LST`);
console.log(`  - 8 receitas de fertilização`);
console.log(`  - ${taskTemplates.length} templates de tarefas`);
console.log(`  - 3 tarefas pendentes`);
