import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

export async function getAllTents(): Promise<Tent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tents);
}

export async function getTentById(id: number): Promise<Tent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tents).where(eq(tents.id, id)).limit(1);
  return result[0];
}

// ============ STRAIN FUNCTIONS ============

export async function getAllStrains(): Promise<Strain[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(strains).where(eq(strains.isActive, true));
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
  tentId: number,
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
        eq(weeklyTargets.tentId, tentId),
        eq(weeklyTargets.phase, phase),
        eq(weeklyTargets.weekNumber, weekNumber)
      )
    )
    .limit(1);
  return result[0];
}

export async function getWeeklyTargetsByTent(tentId: number): Promise<WeeklyTarget[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyTargets).where(eq(weeklyTargets.tentId, tentId));
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
