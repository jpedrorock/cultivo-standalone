import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Imports SQL dump into the database
 * Validates and executes SQL statements safely
 */
export async function importSQLDump(sqlContent: string): Promise<{ success: boolean; message: string; statementsExecuted: number }> {
  const database = await getDb();
  if (!database) {
    return {
      success: false,
      message: "Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.",
      statementsExecuted: 0
    };
  }

  // Basic validation
  if (!sqlContent || sqlContent.trim().length === 0) {
    return { success: false, message: "SQL file is empty", statementsExecuted: 0 };
  }

  // Check if it's a valid App Cultivo backup
  if (!sqlContent.includes("-- App Cultivo - Database Backup")) {
    return { success: false, message: "Invalid backup file. Must be an App Cultivo database backup.", statementsExecuted: 0 };
  }

  // Split SQL content into individual statements
  const statements = sqlContent
    .split(";")
    .map(stmt => stmt.trim())
    .filter(stmt => {
      // Filter out comments and empty statements
      if (!stmt) return false;
      if (stmt.startsWith("--")) return false;
      if (stmt.startsWith("/*")) return false;
      return true;
    });

  if (statements.length === 0) {
    return { success: false, message: "No valid SQL statements found", statementsExecuted: 0 };
  }

  let executedCount = 0;
  const errors: string[] = [];

  try {
    // Execute statements one by one
    for (const statement of statements) {
      try {
        await database.execute(sql.raw(statement));
        executedCount++;
      } catch (error: any) {
        // Log error but continue with other statements
        errors.push(`Statement ${executedCount + 1}: ${error.message}`);
        console.error(`Error executing statement:`, statement.substring(0, 100), error);
      }
    }

    if (errors.length > 0 && executedCount === 0) {
      return {
        success: false,
        message: `Import failed: ${errors[0]}`,
        statementsExecuted: 0
      };
    }

    if (errors.length > 0) {
      return {
        success: true,
        message: `Import completed with ${errors.length} errors. ${executedCount} statements executed successfully.`,
        statementsExecuted: executedCount
      };
    }

    return {
      success: true,
      message: `Import successful! ${executedCount} statements executed.`,
      statementsExecuted: executedCount
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      statementsExecuted: executedCount
    };
  }
}
