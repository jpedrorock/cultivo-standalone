import { describe, it, expect } from "vitest";
import { generateSQLDump } from "./databaseExport";

describe("database.export", () => {
  it("deve gerar dump SQL com header correto", async () => {
    const sqlDump = await generateSQLDump();

    expect(sqlDump).toContain("-- App Cultivo - Database Backup");
    expect(sqlDump).toContain("-- MySQL Database Dump");
    expect(sqlDump).toContain("SET FOREIGN_KEY_CHECKS=0;");
    expect(sqlDump).toContain("SET FOREIGN_KEY_CHECKS=1;");
    expect(sqlDump).toContain("-- End of dump");
  });

  it("deve incluir todas as tabelas principais", async () => {
    const sqlDump = await generateSQLDump();

    // Verificar menção às tabelas principais
    expect(sqlDump).toContain("strains");
    expect(sqlDump).toContain("tents");
    expect(sqlDump).toContain("cycles");
    expect(sqlDump).toContain("dailyLogs");
    expect(sqlDump).toContain("weeklyTargets");
    expect(sqlDump).toContain("taskTemplates");
    expect(sqlDump).toContain("taskInstances");
  });

  it("deve gerar INSERTs válidos para dados existentes", async () => {
    const sqlDump = await generateSQLDump();

    // Verificar formato de INSERT (se houver dados)
    if (sqlDump.includes("INSERT INTO")) {
      // Deve ter formato correto: INSERT INTO table (col1, col2) VALUES (val1, val2);
      expect(sqlDump).toMatch(/INSERT INTO \w+ \([^)]+\) VALUES \([^)]+\);/);
    }
  });

  it("deve ter formato SQL válido sem erros de sintaxe", async () => {
    const sqlDump = await generateSQLDump();

    // Verificar que não há erros óbvios de sintaxe
    expect(sqlDump).not.toContain("undefined");
    expect(sqlDump).not.toContain("[object Object]");
    expect(sqlDump).not.toContain("NaN");
  });

  it("deve ser um dump SQL válido (não vazio)", async () => {
    const sqlDump = await generateSQLDump();

    expect(sqlDump.length).toBeGreaterThan(100);
    expect(typeof sqlDump).toBe("string");
  });
});
