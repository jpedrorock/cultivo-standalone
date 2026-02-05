import { drizzle } from "drizzle-orm/mysql2";
import { strains } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const testStrains = [
  {
    name: "Northern Lights",
    description: "Strain clássica indica com alto rendimento e resistência",
  },
  {
    name: "Sour Diesel",
    description: "Sativa energética com aroma cítrico característico",
  },
  {
    name: "OG Kush",
    description: "Híbrida balanceada, popular e versátil",
  },
];

console.log("🌱 Populando strains de teste...");

for (const strain of testStrains) {
  await db.insert(strains).values(strain);
  console.log(`✅ Strain criada: ${strain.name}`);
}

console.log("🎉 Strains populadas com sucesso!");
