import { getDb } from "./db";
import { wateringApplications, type InsertWateringApplication } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Salvar uma aplicação de rega
 */
export async function saveWateringApplication(data: InsertWateringApplication) {
  const db = await getDb();
  const [result] = await db.insert(wateringApplications).values(data);
  return result.insertId;
}

/**
 * Listar aplicações de rega com filtros opcionais
 */
export async function listWateringApplications(params: {
  tentId?: number;
  cycleId?: number;
  limit?: number;
}) {
  const { tentId, cycleId, limit = 50 } = params;
  const db = await getDb();
  
  let query = db.select().from(wateringApplications);
  
  const conditions = [];
  if (tentId) conditions.push(eq(wateringApplications.tentId, tentId));
  if (cycleId) conditions.push(eq(wateringApplications.cycleId, cycleId));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query
    .orderBy(desc(wateringApplications.applicationDate))
    .limit(limit);
  
  return results;
}
