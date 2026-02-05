import { drizzle } from "drizzle-orm/mysql2";
import { strains, weeklyTargets, tents } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("🌱 Criando strains padrão para cada estufa...");

  // Criar strains padrão
  const defaultStrains = [
    {
      name: "Estufa A - Padrão",
      description: "Valores ideais padrão para Estufa A (Mães e Clonagem)",
      vegaWeeks: 0,
      floraWeeks: 0,
    },
    {
      name: "Estufa B - Padrão",
      description: "Valores ideais padrão para Estufa B (Vegetativa)",
      vegaWeeks: 6,
      floraWeeks: 0,
    },
    {
      name: "Estufa C - Padrão",
      description: "Valores ideais padrão para Estufa C (Floração)",
      vegaWeeks: 0,
      floraWeeks: 8,
    },
  ];

  for (const strain of defaultStrains) {
    await db.insert(strains).values(strain);
  }

  console.log("✅ Strains padrão criadas!");

  // Buscar IDs das estufas
  const allTents = await db.select().from(tents);
  const tentAId = allTents.find((t) => t.name === "Estufa A")?.id;
  const tentBId = allTents.find((t) => t.name === "Estufa B")?.id;
  const tentCId = allTents.find((t) => t.name === "Estufa C")?.id;

  console.log("🎯 Populando targets por estufa...");

  // Targets para Estufa A (Mães e Clonagem)
  const tentATargets = [
    // MAINTENANCE (Mães)
    {
      tentId: tentAId,
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
    },
    // CLONING (Clones)
    {
      tentId: tentAId,
      phase: "CLONING",
      weekNumber: 1,
      tempMin: "23.0",
      tempMax: "27.0",
      rhMin: "70.0",
      rhMax: "80.0",
      ppfdMin: 200,
      ppfdMax: 300,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "0.8",
      ecMax: "1.2",
    },
    {
      tentId: tentAId,
      phase: "CLONING",
      weekNumber: 2,
      tempMin: "23.0",
      tempMax: "27.0",
      rhMin: "65.0",
      rhMax: "75.0",
      ppfdMin: 250,
      ppfdMax: 350,
      photoperiod: "18/6",
      phMin: "5.8",
      phMax: "6.2",
      ecMin: "1.0",
      ecMax: "1.4",
    },
  ];

  // Targets para Estufa B (Vegetativa - 6 semanas)
  const tentBTargets = [];
  for (let week = 1; week <= 6; week++) {
    tentBTargets.push({
      tentId: tentBId,
      phase: "VEGA",
      weekNumber: week,
      tempMin: String(21 + week * 0.5),
      tempMax: String(25 + week * 0.5),
      rhMin: String(Math.max(45, 65 - week * 2)),
      rhMax: String(Math.max(55, 75 - week * 2)),
      ppfdMin: 400 + week * 50,
      ppfdMax: 500 + week * 50,
      photoperiod: "18/6",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: String(1.2 + week * 0.1),
      ecMax: String(1.6 + week * 0.1),
    });
  }

  // Targets para Estufa C (Floração - 8 semanas)
  const tentCTargets = [];
  for (let week = 1; week <= 8; week++) {
    tentCTargets.push({
      tentId: tentCId,
      phase: "FLORA",
      weekNumber: week,
      tempMin: String(21 - week * 0.3),
      tempMax: String(25 - week * 0.3),
      rhMin: String(Math.max(40, 55 - week * 2)),
      rhMax: String(Math.max(50, 65 - week * 2)),
      ppfdMin: 500 + week * 25,
      ppfdMax: 600 + week * 25,
      photoperiod: "12/12",
      phMin: "6.0",
      phMax: "6.4",
      ecMin: String(1.4 + week * 0.05),
      ecMax: String(1.8 + week * 0.05),
    });
  }

  // Inserir todos os targets
  await db.insert(weeklyTargets).values([...tentATargets, ...tentBTargets, ...tentCTargets]);

  console.log(`✅ ${tentATargets.length + tentBTargets.length + tentCTargets.length} targets criados!`);
  console.log("🎉 Seed completo!");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
