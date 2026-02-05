import { drizzle } from "drizzle-orm/mysql2";
import { weeklyTargets, strains } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function seedTargets() {
  console.log("🌱 Populando targets semanais...");

  // Get first strain (Northern Lights)
  const allStrains = await db.select().from(strains).limit(1);
  if (allStrains.length === 0) {
    console.log("❌ Nenhuma strain encontrada. Execute seed-strains.mjs primeiro.");
    return;
  }

  const strainId = allStrains[0].id;
  console.log(`✅ Usando strain: ${allStrains[0].name} (ID: ${strainId})`);

  // VEGA - 6 semanas
  const vegaTargets = [
    // Semana 1
    {
      strainId,
      phase: "VEGA",
      weekNumber: 1,
      tempMin: "22.0",
      tempMax: "26.0",
      rhMin: "60.0",
      rhMax: "70.0",
      ppfdMin: 300,
      ppfdMax: 400,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "0.8",
      ecMax: "1.2",
      notes: "Início da fase vegetativa - valores moderados",
    },
    // Semana 2
    {
      strainId,
      phase: "VEGA",
      weekNumber: 2,
      tempMin: "23.0",
      tempMax: "27.0",
      rhMin: "60.0",
      rhMax: "70.0",
      ppfdMin: 400,
      ppfdMax: 500,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.0",
      ecMax: "1.4",
      notes: "Crescimento acelerado",
    },
    // Semana 3
    {
      strainId,
      phase: "VEGA",
      weekNumber: 3,
      tempMin: "24.0",
      tempMax: "28.0",
      rhMin: "55.0",
      rhMax: "65.0",
      ppfdMin: 450,
      ppfdMax: 550,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.2",
      ecMax: "1.6",
      notes: "Pico de crescimento vegetativo",
    },
    // Semana 4
    {
      strainId,
      phase: "VEGA",
      weekNumber: 4,
      tempMin: "24.0",
      tempMax: "28.0",
      rhMin: "55.0",
      rhMax: "65.0",
      ppfdMin: 500,
      ppfdMax: 600,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.4",
      ecMax: "1.8",
      notes: "Manutenção do crescimento",
    },
    // Semana 5
    {
      strainId,
      phase: "VEGA",
      weekNumber: 5,
      tempMin: "23.0",
      tempMax: "27.0",
      rhMin: "50.0",
      rhMax: "60.0",
      ppfdMin: 500,
      ppfdMax: "600",
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.4",
      ecMax: "1.8",
      notes: "Preparação para floração",
    },
    // Semana 6
    {
      strainId,
      phase: "VEGA",
      weekNumber: 6,
      tempMin: "22.0",
      tempMax: "26.0",
      rhMin: "50.0",
      rhMax: "60.0",
      ppfdMin: 450,
      ppfdMax: 550,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.2",
      ecMax: "1.6",
      notes: "Última semana vegetativa",
    },
  ];

  // FLORA - 8 semanas
  const floraTargets = [
    // Semana 1
    {
      strainId,
      phase: "FLORA",
      weekNumber: 1,
      tempMin: "21.0",
      tempMax: "25.0",
      rhMin: "45.0",
      rhMax: "55.0",
      ppfdMin: 500,
      ppfdMax: 600,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.4",
      ecMax: "1.8",
      notes: "Início da floração - transição",
    },
    // Semana 2
    {
      strainId,
      phase: "FLORA",
      weekNumber: 2,
      tempMin: "22.0",
      tempMax: "26.0",
      rhMin: "45.0",
      rhMax: "55.0",
      ppfdMin: 550,
      ppfdMax: 650,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.6",
      ecMax: "2.0",
      notes: "Formação de flores",
    },
    // Semana 3
    {
      strainId,
      phase: "FLORA",
      weekNumber: 3,
      tempMin: "22.0",
      tempMax: "26.0",
      rhMin: "40.0",
      rhMax: "50.0",
      ppfdMin: 600,
      ppfdMax: 700,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.8",
      ecMax: "2.2",
      notes: "Desenvolvimento de buds",
    },
    // Semana 4
    {
      strainId,
      phase: "FLORA",
      weekNumber: 4,
      tempMin: "21.0",
      tempMax: "25.0",
      rhMin: "40.0",
      rhMax: "50.0",
      ppfdMin: 600,
      ppfdMax: 700,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.8",
      ecMax: "2.2",
      notes: "Pico de floração",
    },
    // Semana 5
    {
      strainId,
      phase: "FLORA",
      weekNumber: 5,
      tempMin: "20.0",
      tempMax: "24.0",
      rhMin: "35.0",
      rhMax: "45.0",
      ppfdMin: 550,
      ppfdMax: 650,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.6",
      ecMax: "2.0",
      notes: "Engorda dos buds",
    },
    // Semana 6
    {
      strainId,
      phase: "FLORA",
      weekNumber: 6,
      tempMin: "20.0",
      tempMax: "24.0",
      rhMin: "35.0",
      rhMax: "45.0",
      ppfdMin: 500,
      ppfdMax: 600,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.4",
      ecMax: "1.8",
      notes: "Maturação",
    },
    // Semana 7
    {
      strainId,
      phase: "FLORA",
      weekNumber: 7,
      tempMin: "19.0",
      tempMax: "23.0",
      rhMin: "30.0",
      rhMax: "40.0",
      ppfdMin: 450,
      ppfdMax: 550,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "1.0",
      ecMax: "1.4",
      notes: "Flush - redução de nutrientes",
    },
    // Semana 8
    {
      strainId,
      phase: "FLORA",
      weekNumber: 8,
      tempMin: "18.0",
      tempMax: "22.0",
      rhMin: "30.0",
      rhMax: "40.0",
      ppfdMin: 400,
      ppfdMax: 500,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: "0.0",
      ecMax: "0.5",
      notes: "Última semana - flush final",
    },
  ];

  // CLONING - 2 semanas
  const cloningTargets = [
    {
      strainId,
      phase: "CLONING",
      weekNumber: 1,
      tempMin: "22.0",
      tempMax: "25.0",
      rhMin: "70.0",
      rhMax: "80.0",
      ppfdMin: 100,
      ppfdMax: 200,
      photoperiod: "18/6",
      phMin: "5.5",
      phMax: "6.0",
      ecMin: "0.4",
      ecMax: "0.8",
      notes: "Enraizamento inicial",
    },
    {
      strainId,
      phase: "CLONING",
      weekNumber: 2,
      tempMin: "22.0",
      tempMax: "25.0",
      rhMin: "65.0",
      rhMax: "75.0",
      ppfdMin: 150,
      ppfdMax: 250,
      photoperiod: "18/6",
      phMin: "5.5",
      phMax: "6.0",
      ecMin: "0.6",
      ecMax: "1.0",
      notes: "Desenvolvimento de raízes",
    },
  ];

  // MAINTENANCE (plantas mães)
  const maintenanceTargets = [
    {
      strainId,
      phase: "MAINTENANCE",
      weekNumber: 1,
      tempMin: "22.0",
      tempMax: "26.0",
      rhMin: "55.0",
      rhMax: "65.0",
      ppfdMin: 300,
      ppfdMax: 400,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.0",
      ecMax: "1.4",
      notes: "Manutenção das plantas mães",
    },
  ];

  const allTargets = [...vegaTargets, ...floraTargets, ...cloningTargets, ...maintenanceTargets];

  for (const target of allTargets) {
    await db.insert(weeklyTargets).values(target);
  }

  console.log(`✅ ${allTargets.length} targets criados com sucesso!`);
  console.log("   - VEGA: 6 semanas");
  console.log("   - FLORA: 8 semanas");
  console.log("   - CLONING: 2 semanas");
  console.log("   - MAINTENANCE: 1 configuração");

  process.exit(0);
}

seedTargets().catch((error) => {
  console.error("❌ Erro ao popular targets:", error);
  process.exit(1);
});
