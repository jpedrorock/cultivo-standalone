import { drizzle } from "drizzle-orm/mysql2";
import { tents, safetyLimits, tentAState } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Inserir as 3 estufas
  console.log("Inserindo estufas...");
  await db.insert(tents).values([
    {
      name: "Estufa A",
      tentType: "A",
      width: 45,
      depth: 75,
      height: 90,
      volume: "0.304",
      powerW: null,
    },
    {
      name: "Estufa B",
      tentType: "B",
      width: 60,
      depth: 60,
      height: 120,
      volume: "0.432",
      powerW: null,
    },
    {
      name: "Estufa C",
      tentType: "C",
      width: 60,
      depth: 120,
      height: 150,
      volume: "1.080",
      powerW: null,
    },
  ]);

  console.log("✅ Estufas inseridas!");

  // Inserir limites de segurança
  console.log("Inserindo limites de segurança...");
  await db.insert(safetyLimits).values([
    // TENT_A - CLONING
    {
      context: "TENT_A",
      phase: "CLONING",
      metric: "TEMP",
      minValue: "18.0",
      maxValue: "28.0",
    },
    {
      context: "TENT_A",
      phase: "CLONING",
      metric: "RH",
      minValue: "60.0",
      maxValue: "90.0",
    },
    {
      context: "TENT_A",
      phase: "CLONING",
      metric: "PPFD",
      minValue: "100",
      maxValue: "300",
    },
    // TENT_A - MAINTENANCE
    {
      context: "TENT_A",
      phase: "MAINTENANCE",
      metric: "TEMP",
      minValue: "18.0",
      maxValue: "26.0",
    },
    {
      context: "TENT_A",
      phase: "MAINTENANCE",
      metric: "RH",
      minValue: "40.0",
      maxValue: "70.0",
    },
    {
      context: "TENT_A",
      phase: "MAINTENANCE",
      metric: "PPFD",
      minValue: "200",
      maxValue: "400",
    },
    // TENT_BC - CLONING
    {
      context: "TENT_BC",
      phase: "CLONING",
      metric: "TEMP",
      minValue: "20.0",
      maxValue: "26.0",
    },
    {
      context: "TENT_BC",
      phase: "CLONING",
      metric: "RH",
      minValue: "70.0",
      maxValue: "85.0",
    },
    {
      context: "TENT_BC",
      phase: "CLONING",
      metric: "PPFD",
      minValue: "150",
      maxValue: "300",
    },
    // TENT_BC - VEGA
    {
      context: "TENT_BC",
      phase: "VEGA",
      metric: "TEMP",
      minValue: "20.0",
      maxValue: "28.0",
    },
    {
      context: "TENT_BC",
      phase: "VEGA",
      metric: "RH",
      minValue: "50.0",
      maxValue: "70.0",
    },
    {
      context: "TENT_BC",
      phase: "VEGA",
      metric: "PPFD",
      minValue: "300",
      maxValue: "600",
    },
    // TENT_BC - FLORA
    {
      context: "TENT_BC",
      phase: "FLORA",
      metric: "TEMP",
      minValue: "18.0",
      maxValue: "26.0",
    },
    {
      context: "TENT_BC",
      phase: "FLORA",
      metric: "RH",
      minValue: "40.0",
      maxValue: "55.0",
    },
    {
      context: "TENT_BC",
      phase: "FLORA",
      metric: "PPFD",
      minValue: "600",
      maxValue: "1000",
    },
  ]);

  console.log("✅ Limites de segurança inseridos!");

  // Inicializar estado da Estufa A
  console.log("Inicializando estado da Estufa A...");
  await db.insert(tentAState).values({
    tentId: 1, // Estufa A
    mode: "MAINTENANCE",
    activeCloningEventId: null,
  });

  console.log("✅ Estado da Estufa A inicializado!");

  console.log("🎉 Seed concluído com sucesso!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao executar seed:", error);
  process.exit(1);
});
