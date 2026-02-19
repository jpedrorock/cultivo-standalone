import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import {
  InsertUser,
  users,
  tents,
  strains,
  cycles,
  tentAState,
  cloningEvents,
  weeklyTargets,
  dailyLogs,
  recipes,
  recipeTemplates,
  taskTemplates,
  taskInstances,
  alerts,
  safetyLimits,
  plants,
  type Tent,
  type Strain,
  type Cycle,
  type TentAState,
  type CloningEvent,
  type WeeklyTarget,
  type DailyLog,
  type Recipe,
  type RecipeTemplate,
  type TaskTemplate,
  type TaskInstance,
  type Alert,
  type SafetyLimit,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL || "file:./local.db";
    const isSQLite = connectionString.startsWith("file:");
    
    try {
      if (isSQLite) {
        // SQLite connection (local)
        const dbPath = connectionString.replace("file:", "");
        const sqlite = new Database(dbPath);
        _db = drizzleSqlite(sqlite);
        console.log(`[Database] Connected to SQLite: ${dbPath}`);
      } else {
        // MySQL connection (production) - using pool for auto-reconnection
        const pool = mysql.createPool({
          uri: connectionString,
          waitForConnections: true,
          connectionLimit: 10,
          idleTimeout: 60000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 30000,
        });
        _db = drizzleMysql(pool);
        console.log(`[Database] Connected to MySQL (pool)`);
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ TENT FUNCTIONS ============

export async function getAllTents(): Promise<(Tent & { plantCount?: number })[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar estufas
  const allTents = await db.select().from(tents);
  
  // Para cada estufa, contar plantas ativas e buscar strains
  const tentsWithPlantCount = await Promise.all(
    allTents.map(async (tent: any) => {
      try {
        const plantCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(plants)
          .where(and(
            eq(plants.currentTentId, tent.id),
            eq(plants.status, "ACTIVE")
          ));
        
        const plantCount = plantCountResult[0]?.count || 0;
        
        // Buscar strains únicas das plantas ativas na estufa
        const tentPlants = await db
          .select({ strainId: plants.strainId })
          .from(plants)
          .where(and(
            eq(plants.currentTentId, tent.id),
            eq(plants.status, "ACTIVE")
          ));
        const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId)));
        let tentStrains: any[] = [];
        if (uniqueStrainIds.length > 0) {
          tentStrains = await db.select().from(strains).where(sql`${strains.id} IN (${sql.join(uniqueStrainIds.map((id: any) => sql`${id}`), sql`, `)})`);
        }
        
        return { ...tent, plantCount, tentStrains };
      } catch (error) {
        // Se a tabela plants não existir ainda, retornar 0
        return { ...tent, plantCount: 0, tentStrains: [] };
      }
    })
  );
  
  return tentsWithPlantCount;
}

export async function getTentById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) return undefined;
  
  // Buscar estufa com ciclo ativo
  const result = await db
    .select({
      id: tents.id,
      name: tents.name,
      category: tents.category,
      width: tents.width,
      depth: tents.depth,
      height: tents.height,
      volume: tents.volume,
      powerW: tents.powerW,
      createdAt: tents.createdAt,
      updatedAt: tents.updatedAt,
      // Dados do ciclo ativo
      cycleId: cycles.id,
      cycleStartDate: cycles.startDate,
      cycleFloraStartDate: cycles.floraStartDate,
    })
    .from(tents)
    .leftJoin(cycles, and(
      eq(cycles.tentId, tents.id),
      eq(cycles.status, "ACTIVE")
    ))
    .where(eq(tents.id, id))
    .limit(1);
  
  const tent = result[0];
  if (!tent) return undefined;
  
  // Buscar strains únicas das plantas ativas na estufa
  const tentPlants = await db
    .select({ strainId: plants.strainId })
    .from(plants)
    .where(and(
      eq(plants.currentTentId, id),
      eq(plants.status, "ACTIVE")
    ));
  const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId)));
  let tentStrains: any[] = [];
  if (uniqueStrainIds.length > 0) {
    tentStrains = await db.select().from(strains).where(sql`${strains.id} IN (${sql.join(uniqueStrainIds.map((sid: any) => sql`${sid}`), sql`, `)})`);
  }
  
  // Calcular fase e semana atual se houver ciclo ativo
  if (tent.cycleStartDate) {
    const now = new Date();
    const startDate = new Date(tent.cycleStartDate);
    const floraStartDate = tent.cycleFloraStartDate ? new Date(tent.cycleFloraStartDate) : null;
    
    let currentPhase: "VEGA" | "FLORA";
    let currentWeek: number;
    
    if (floraStartDate && now >= floraStartDate) {
      currentPhase = "FLORA";
      const weeksSinceFlora = Math.floor(
        (now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      currentWeek = weeksSinceFlora + 1;
    } else {
      currentPhase = "VEGA";
      const weeksSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      currentWeek = weeksSinceStart + 1;
    }
    
    return {
      ...tent,
      currentPhase,
      currentWeek,
      tentStrains,
    };
  }
  
  return { ...tent, tentStrains };
}

// ============ STRAIN FUNCTIONS ============

export async function getAllStrains(): Promise<Strain[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(strains).where(sql`${strains.isActive} = 1`);
}

export async function getStrainById(id: number): Promise<Strain | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(strains).where(eq(strains.id, id)).limit(1);
  return result[0];
}

// ============ CYCLE FUNCTIONS ============

export async function getActiveCycles(): Promise<Cycle[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cycles).where(eq(cycles.status, "ACTIVE"));
}

export async function getCycleByTentId(tentId: number): Promise<Cycle | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(cycles)
    .where(and(eq(cycles.tentId, tentId), eq(cycles.status, "ACTIVE")))
    .limit(1);
  return result[0] ?? null;
}

// ============ TENT A STATE FUNCTIONS ============

export async function getTentAState(tentId: number): Promise<TentAState | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tentAState).where(eq(tentAState.tentId, tentId)).limit(1);
  return result[0];
}

// ============ CLONING EVENT FUNCTIONS ============

export async function getActiveCloningEvent(tentId: number): Promise<CloningEvent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(cloningEvents)
    .where(and(eq(cloningEvents.tentId, tentId), eq(cloningEvents.status, "ACTIVE")))
    .limit(1);
  return result[0];
}

// ============ WEEKLY TARGET FUNCTIONS ============

export async function getWeeklyTarget(
  strainId: number,
  phase: "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE",
  weekNumber: number
): Promise<WeeklyTarget | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(weeklyTargets)
    .where(
      and(
        eq(weeklyTargets.strainId, strainId),
        eq(weeklyTargets.phase, phase),
        eq(weeklyTargets.weekNumber, weekNumber)
      )
    )
    .limit(1);
  return result[0];
}

export async function getWeeklyTargetsByStrain(strainId: number): Promise<WeeklyTarget[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyTargets).where(eq(weeklyTargets.strainId, strainId));
}

// ============ DAILY LOG FUNCTIONS ============

export async function getDailyLogs(
  tentId: number,
  startDate?: Date,
  endDate?: Date
): Promise<DailyLog[]> {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return db
      .select()
      .from(dailyLogs)
      .where(
        and(eq(dailyLogs.tentId, tentId), gte(dailyLogs.logDate, startDate), lte(dailyLogs.logDate, endDate))
      )
      .orderBy(desc(dailyLogs.logDate), desc(dailyLogs.turn));
  }

  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.tentId, tentId))
    .orderBy(desc(dailyLogs.logDate), desc(dailyLogs.turn));
}

/**
 * Calcula a média dos weekly targets de múltiplas strains.
 * Agrupa por phase+weekNumber e calcula a média de cada métrica.
 */
function averageWeeklyTargets(allTargets: WeeklyTarget[], strainCount: number): WeeklyTarget[] {
  const grouped = new Map<string, WeeklyTarget[]>();
  
  for (const t of allTargets) {
    const key = `${t.phase}-${t.weekNumber}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }
  
  const averaged: WeeklyTarget[] = [];
  grouped.forEach((targets, _key) => {
    const count = targets.length;
    const avgDecimal = (field: keyof WeeklyTarget) => {
      const vals = targets.map(t => t[field]).filter(v => v !== null && v !== undefined);
      if (vals.length === 0) return null;
      const sum = vals.reduce((a: number, b: any) => a + parseFloat(String(b)), 0);
      return (sum / vals.length).toFixed(1);
    };
    const avgInt = (field: keyof WeeklyTarget) => {
      const vals = targets.map(t => t[field]).filter(v => v !== null && v !== undefined);
      if (vals.length === 0) return null;
      const sum = vals.reduce((a: number, b: any) => a + Number(b), 0);
      return Math.round(sum / vals.length);
    };
    
    averaged.push({
      ...targets[0], // base (id, strainId, phase, weekNumber, etc.)
      tempMin: avgDecimal('tempMin') as any,
      tempMax: avgDecimal('tempMax') as any,
      rhMin: avgDecimal('rhMin') as any,
      rhMax: avgDecimal('rhMax') as any,
      ppfdMin: avgInt('ppfdMin') as any,
      ppfdMax: avgInt('ppfdMax') as any,
      phMin: avgDecimal('phMin') as any,
      phMax: avgDecimal('phMax') as any,
      ecMin: avgDecimal('ecMin') as any,
      ecMax: avgDecimal('ecMax') as any,
    });
  });
  
  return averaged;
}

export async function getHistoricalDataWithTargets(tentId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return { logs: [], targets: [], cycle: null };

  // Get current active cycle
  const cycle = await getCycleByTentId(tentId);
  if (!cycle) return { logs: [], targets: [], cycle: null };

  // Get logs from last N days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const logs = await getDailyLogs(tentId, startDate);

  // Get targets: se ciclo tem strainId, usar essa strain; senão, calcular média das strains das plantas
  let targets: WeeklyTarget[] = [];
  if (cycle?.strainId) {
    targets = await getWeeklyTargetsByStrain(cycle.strainId);
  } else {
    // Buscar strains únicas das plantas ativas na estufa
    const tentPlants = await db
      .select({ strainId: plants.strainId })
      .from(plants)
      .where(and(
        eq(plants.currentTentId, tentId),
        eq(plants.status, "ACTIVE")
      ));
    const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId)));
    
    if (uniqueStrainIds.length === 1) {
      // Uma única strain, usar targets diretamente
      targets = await getWeeklyTargetsByStrain(uniqueStrainIds[0] as number);
    } else if (uniqueStrainIds.length > 1) {
      // Múltiplas strains: calcular média dos targets
      const allTargets = await Promise.all(
        uniqueStrainIds.map((sid: any) => getWeeklyTargetsByStrain(sid))
      );
      targets = averageWeeklyTargets(allTargets.flat(), uniqueStrainIds.length);
    }
  }

  return { logs, targets, cycle };
}

export async function getDailyLog(
  tentId: number,
  logDate: Date,
  turn: "AM" | "PM"
): Promise<DailyLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.tentId, tentId), eq(dailyLogs.logDate, logDate), eq(dailyLogs.turn, turn)))
    .limit(1);
  return result[0];
}

// ============ RECIPE FUNCTIONS ============

export async function getRecipe(
  tentId: number,
  logDate: Date,
  turn: "AM" | "PM"
): Promise<Recipe | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.tentId, tentId), eq(recipes.logDate, logDate), eq(recipes.turn, turn)))
    .limit(1);
  return result[0];
}

export async function getAllRecipeTemplates(): Promise<RecipeTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recipeTemplates);
}

// ============ TASK FUNCTIONS ============

export async function getTaskTemplates(
  context: "TENT_A" | "TENT_BC",
  phase: "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE",
  weekNumber?: number
): Promise<TaskTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  if (weekNumber !== undefined) {
    return db
      .select()
      .from(taskTemplates)
      .where(
        and(
          eq(taskTemplates.context, context),
          eq(taskTemplates.phase, phase),
          eq(taskTemplates.weekNumber, weekNumber)
        )
      );
  }

  return db
    .select()
    .from(taskTemplates)
    .where(and(eq(taskTemplates.context, context), eq(taskTemplates.phase, phase)));
}

export async function getTaskInstances(
  tentId: number,
  startDate?: Date,
  endDate?: Date
): Promise<TaskInstance[]> {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return db
      .select()
      .from(taskInstances)
      .where(
        and(
          eq(taskInstances.tentId, tentId),
          gte(taskInstances.occurrenceDate, startDate),
          lte(taskInstances.occurrenceDate, endDate)
        )
      )
      .orderBy(desc(taskInstances.occurrenceDate));
  }

  return db
    .select()
    .from(taskInstances)
    .where(eq(taskInstances.tentId, tentId))
    .orderBy(desc(taskInstances.occurrenceDate));
}

// ============ ALERT FUNCTIONS ============

export async function getAlerts(
  tentId?: number,
  status?: "NEW" | "SEEN"
): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (tentId !== undefined) {
    conditions.push(eq(alerts.tentId, tentId));
  }
  if (status !== undefined) {
    conditions.push(eq(alerts.status, status));
  }

  if (conditions.length === 0) {
    return db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  return db
    .select()
    .from(alerts)
    .where(and(...conditions))
    .orderBy(desc(alerts.createdAt));
}

export async function getNewAlertsCount(tentId?: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let conditions = [eq(alerts.status, "NEW")];
  if (tentId !== undefined) {
    conditions.push(eq(alerts.tentId, tentId));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(alerts)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

// ============ SAFETY LIMIT FUNCTIONS ============

export async function getSafetyLimit(
  context: "TENT_A" | "TENT_BC",
  phase: "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE",
  metric: "TEMP" | "RH" | "PPFD"
): Promise<SafetyLimit | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(safetyLimits)
    .where(
      and(
        eq(safetyLimits.context, context),
        eq(safetyLimits.phase, phase),
        eq(safetyLimits.metric, metric)
      )
    )
    .limit(1);
  return result[0];
}
