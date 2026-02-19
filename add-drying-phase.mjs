import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Adding DRYING to phase enum...");

try {
  // Adicionar DRYING ao enum de taskTemplates
  await connection.execute(`
    ALTER TABLE taskTemplates 
    MODIFY COLUMN phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL
  `);
  console.log("✅ taskTemplates.phase updated");

  // Adicionar DRYING ao enum de recipeTemplates
  await connection.execute(`
    ALTER TABLE recipeTemplates 
    MODIFY COLUMN phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL
  `);
  console.log("✅ recipeTemplates.phase updated");

  console.log("✅ Migration completed!");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
} finally {
  await connection.end();
}
