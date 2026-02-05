import { drizzle } from "drizzle-orm/mysql2";
import { cycles, tents, strains } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("🔄 Criando ciclo de teste...");

  // Buscar IDs
  const allTents = await db.select().from(tents);
  const tentB = allTents.find((t) => t.name === "Estufa B");

  const allStrains = await db.select().from(strains);
  const strain = allStrains[0]; // Pega a primeira strain disponível

  if (!tentB || !strain) {
    console.error("❌ Estufa B ou strain não encontrada!");
    process.exit(1);
  }

  // Criar ciclo ativo na Estufa B (iniciado há 2 semanas)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14); // 2 semanas atrás

  await db.insert(cycles).values({
    tentId: tentB.id,
    strainId: strain.id,
    startDate: startDate,
    status: "ACTIVE",
  });

  console.log("✅ Ciclo de teste criado na Estufa B (Semana 3 de VEGA)");
  console.log(`   Strain: ${strain.name}`);
  console.log(`   Data de início: ${startDate.toISOString()}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
