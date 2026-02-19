import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Applying phaseAlertMargins migration...");

try {
  // Criar tabela phaseAlertMargins
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS phaseAlertMargins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phase ENUM('MAINTENANCE', 'CLONING', 'VEGA', 'FLORA', 'DRYING') NOT NULL UNIQUE,
      tempMargin DECIMAL(3,1) NOT NULL,
      rhMargin DECIMAL(3,1) NOT NULL,
      ppfdMargin INT NOT NULL,
      phMargin DECIMAL(2,1),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log("✅ Table phaseAlertMargins created");

  // Inserir valores padrão
  const margins = [
    ["MAINTENANCE", 3.0, 10.0, 100, 0.3],
    ["CLONING", 2.0, 5.0, 50, 0.2],
    ["VEGA", 2.0, 5.0, 50, 0.2],
    ["FLORA", 2.0, 5.0, 50, 0.2],
    ["DRYING", 1.0, 3.0, 0, null],
  ];

  for (const [phase, temp, rh, ppfd, ph] of margins) {
    await connection.execute(
      `INSERT INTO phaseAlertMargins (phase, tempMargin, rhMargin, ppfdMargin, phMargin) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE tempMargin=VALUES(tempMargin), rhMargin=VALUES(rhMargin), ppfdMargin=VALUES(ppfdMargin), phMargin=VALUES(phMargin)`,
      [phase, temp, rh, ppfd, ph]
    );
    console.log(`✅ Inserted/Updated ${phase} margins`);
  }

  console.log("✅ Migration completed!");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
} finally {
  await connection.end();
}
