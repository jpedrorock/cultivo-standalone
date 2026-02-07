import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Gera um dump SQL completo do banco de dados
 * Inclui estrutura e dados de todas as tabelas
 */
export async function generateSQLDump(): Promise<string> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const sqlLines: string[] = [];
  
  // Header do arquivo
  sqlLines.push("-- App Cultivo - Database Backup");
  sqlLines.push(`-- Generated at: ${new Date().toISOString()}`);
  sqlLines.push("-- MySQL Database Dump");
  sqlLines.push("");
  sqlLines.push("SET FOREIGN_KEY_CHECKS=0;");
  sqlLines.push("");

  // Lista de tabelas na ordem correta (respeitando foreign keys)
  const tables = [
    "strains",
    "tents",
    "cycles",
    "dailyLogs",
    "weeklyTargets",
    "taskTemplates",
    "taskInstances",
    "alertSettings",
    "alertHistory",
  ];

  for (const tableName of tables) {
    try {
      // Buscar dados da tabela
      const result = await database.execute(sql.raw(`SELECT * FROM ${tableName}`));
      const rows = result[0] as unknown as any[];
      
      if (!rows || rows.length === 0) {
        sqlLines.push(`-- Table ${tableName} is empty`);
        sqlLines.push("");
        continue;
      }

      sqlLines.push(`-- Dumping data for table ${tableName}`);
      sqlLines.push(`DELETE FROM ${tableName};`);
      
      // Gerar INSERTs
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const val = (row as any)[col];
          
          if (val === null || val === undefined) {
            return "NULL";
          }
          
          if (typeof val === "string") {
            // Escapar aspas simples
            return `'${val.replace(/'/g, "''")}'`;
          }
          
          if (val instanceof Date) {
            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          }
          
          if (typeof val === "boolean") {
            return val ? "1" : "0";
          }
          
          return String(val);
        });
        
        sqlLines.push(
          `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});`
        );
      }
      
      sqlLines.push("");
    } catch (error) {
      console.error(`Error exporting table ${tableName}:`, error);
      sqlLines.push(`-- Error exporting table ${tableName}: ${error}`);
      sqlLines.push("");
    }
  }

  sqlLines.push("SET FOREIGN_KEY_CHECKS=1;");
  sqlLines.push("");
  sqlLines.push("-- End of dump");

  return sqlLines.join("\n");
}
