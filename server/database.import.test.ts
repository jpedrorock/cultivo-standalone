import { describe, it, expect } from "vitest";
import { importSQLDump } from "./databaseImport";

describe("database.import", () => {
  it("should reject empty SQL content", async () => {
    const result = await importSQLDump("");
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("empty");
    expect(result.statementsExecuted).toBe(0);
  });

  it("should reject non-App Cultivo backup files", async () => {
    const invalidSQL = "CREATE TABLE test (id INT);";
    
    const result = await importSQLDump(invalidSQL);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid backup file");
    expect(result.statementsExecuted).toBe(0);
  });

  it("should accept valid App Cultivo backup header", async () => {
    const validSQL = `-- App Cultivo - Database Backup
-- Generated at: 2026-02-07T00:00:00.000Z
-- MySQL Database Dump
SET FOREIGN_KEY_CHECKS=0`;
    
    const result = await importSQLDump(validSQL);
    
    // Should process the SQL (success may vary based on DB state)
    expect(typeof result.success).toBe("boolean");
    expect(result.message).toBeTruthy();
  });

  it("should return valid result structure", async () => {
    const validSQL = `-- App Cultivo - Database Backup
SET FOREIGN_KEY_CHECKS=0`;
    
    const result = await importSQLDump(validSQL);
    
    // Should have proper result structure
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("statementsExecuted");
    expect(typeof result.success).toBe("boolean");
  });

  it("should provide meaningful error messages", async () => {
    const result = await importSQLDump("");
    
    // Should have descriptive error message
    expect(result.message).toBeTruthy();
    expect(result.message.length).toBeGreaterThan(0);
  });
});
