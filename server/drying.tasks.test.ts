import { describe, it, expect } from 'vitest';
import { getDb } from './db';
import { taskTemplates } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('DRYING Task Templates', () => {
  it('should have 5 task templates for DRYING phase', async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not available');

    const dryingTemplates = await database
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.phase, 'DRYING'));

    expect(dryingTemplates.length).toBeGreaterThanOrEqual(5);
  }, 30000);

  it('should have all expected DRYING task titles', async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not available');

    const dryingTemplates = await database
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.phase, 'DRYING'));

    const titles = dryingTemplates.map(t => t.title);

    expect(titles).toContain('Controle de Ambiente');
    expect(titles).toContain('Inspeção de Mofo');
    expect(titles).toContain('Teste de Cura (Snap Test)');
    expect(titles).toContain('Rotação de Material');
    expect(titles).toContain('Preparação para Armazenamento');
  }, 30000);

  it('should have DRYING templates with TENT_BC context', async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not available');

    const dryingTemplates = await database
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.phase, 'DRYING'));

    dryingTemplates.forEach(template => {
      expect(template.context).toBe('TENT_BC');
      expect(template.weekNumber).toBeNull(); // DRYING não usa weekNumber
    });
  }, 30000);

  it('should have descriptive content for each DRYING task', async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not available');

    const dryingTemplates = await database
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.phase, 'DRYING'));

    dryingTemplates.forEach(template => {
      expect(template.description).toBeTruthy();
      expect(template.description!.length).toBeGreaterThan(20); // Descrição significativa
    });
  }, 30000);
});
