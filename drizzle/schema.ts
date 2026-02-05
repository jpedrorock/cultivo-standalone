import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  unique,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Estufas (A, B, C)
 */
export const tents = mysqlTable("tents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  tentType: mysqlEnum("tentType", ["A", "B", "C"]).notNull(),
  width: int("width").notNull(),
  depth: int("depth").notNull(),
  height: int("height").notNull(),
  volume: decimal("volume", { precision: 10, scale: 3 }).notNull(),
  powerW: int("powerW"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tent = typeof tents.$inferSelect;
export type InsertTent = typeof tents.$inferInsert;

/**
 * Strains (variedades genéticas)
 */
export const strains = mysqlTable("strains", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  vegaWeeks: int("vegaWeeks").default(4).notNull(),
  floraWeeks: int("floraWeeks").default(8).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Strain = typeof strains.$inferSelect;
export type InsertStrain = typeof strains.$inferInsert;

/**
 * Ciclos ativos (Estufas B e C)
 */
export const cycles = mysqlTable(
  "cycles",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    strainId: int("strainId")
      .notNull()
      .references(() => strains.id),
    startDate: timestamp("startDate").notNull(),
    floraStartDate: timestamp("floraStartDate"),
    status: mysqlEnum("status", ["ACTIVE", "FINISHED"]).default("ACTIVE").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tentIdx: index("tentIdx").on(table.tentId),
    strainIdx: index("strainIdx").on(table.strainId),
  })
);

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = typeof cycles.$inferInsert;

/**
 * Estado da Estufa A (Manutenção ou Clonagem)
 */
export const tentAState = mysqlTable("tentAState", {
  id: int("id").autoincrement().primaryKey(),
  tentId: int("tentId")
    .notNull()
    .references(() => tents.id)
    .unique(),
  mode: mysqlEnum("mode", ["MAINTENANCE", "CLONING"]).default("MAINTENANCE").notNull(),
  activeCloningEventId: int("activeCloningEventId").references(() => cloningEvents.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TentAState = typeof tentAState.$inferSelect;
export type InsertTentAState = typeof tentAState.$inferInsert;

/**
 * Eventos de Clonagem (Estufa A)
 */
export const cloningEvents = mysqlTable(
  "cloningEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    status: mysqlEnum("status", ["ACTIVE", "FINISHED"]).default("ACTIVE").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tentIdx: index("tentIdx").on(table.tentId),
  })
);

export type CloningEvent = typeof cloningEvents.$inferSelect;
export type InsertCloningEvent = typeof cloningEvents.$inferInsert;

/**
 * Padrões Semanais (targets por strain, fase e semana)
 */
export const weeklyTargets = mysqlTable(
  "weeklyTargets",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    phase: mysqlEnum("phase", ["CLONING", "VEGA", "FLORA", "MAINTENANCE"]).notNull(),
    weekNumber: int("weekNumber").notNull(),
    tempMin: decimal("tempMin", { precision: 4, scale: 1 }),
    tempMax: decimal("tempMax", { precision: 4, scale: 1 }),
    rhMin: decimal("rhMin", { precision: 4, scale: 1 }),
    rhMax: decimal("rhMax", { precision: 4, scale: 1 }),
    ppfdMin: int("ppfdMin"),
    ppfdMax: int("ppfdMax"),
    photoperiod: varchar("photoperiod", { length: 10 }), // Ex: "18/6", "12/12"
    phMin: decimal("phMin", { precision: 3, scale: 1 }),
    phMax: decimal("phMax", { precision: 3, scale: 1 }),
    ecMin: decimal("ecMin", { precision: 3, scale: 1 }),
    ecMax: decimal("ecMax", { precision: 3, scale: 1 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tentPhaseWeekUnique: unique("tentPhaseWeekUnique").on(
      table.tentId,
      table.phase,
      table.weekNumber
    ),
    tentIdx: index("tentIdx").on(table.tentId),
  })
);

export type WeeklyTarget = typeof weeklyTargets.$inferSelect;
export type InsertWeeklyTarget = typeof weeklyTargets.$inferInsert;

/**
 * Registros Diários (manhã e noite)
 */
export const dailyLogs = mysqlTable(
  "dailyLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    logDate: timestamp("logDate").notNull(),
    turn: mysqlEnum("turn", ["AM", "PM"]).notNull(),
    tempC: decimal("tempC", { precision: 4, scale: 1 }),
    rhPct: decimal("rhPct", { precision: 4, scale: 1 }),
    ppfd: int("ppfd"),
    ph: decimal("ph", { precision: 3, scale: 1 }),
    ec: decimal("ec", { precision: 4, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tentDateTurnUnique: unique("tentDateTurnUnique").on(table.tentId, table.logDate, table.turn),
    tentIdx: index("tentIdx").on(table.tentId),
    dateIdx: index("dateIdx").on(table.logDate),
  })
);

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

/**
 * Receitas (fertilização do dia)
 */
export const recipes = mysqlTable(
  "recipes",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    logDate: timestamp("logDate").notNull(),
    turn: mysqlEnum("turn", ["AM", "PM"]).notNull(),
    volumeTotalL: decimal("volumeTotalL", { precision: 6, scale: 2 }),
    ecTarget: decimal("ecTarget", { precision: 4, scale: 2 }),
    phTarget: decimal("phTarget", { precision: 3, scale: 1 }),
    productsJson: text("productsJson"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tentDateTurnUnique: unique("tentDateTurnUnique").on(table.tentId, table.logDate, table.turn),
    tentIdx: index("tentIdx").on(table.tentId),
  })
);

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

/**
 * Templates de Receitas (biblioteca)
 */
export const recipeTemplates = mysqlTable("recipeTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phase: mysqlEnum("phase", ["CLONING", "VEGA", "FLORA", "MAINTENANCE"]).notNull(),
  weekNumber: int("weekNumber"),
  volumeTotalL: decimal("volumeTotalL", { precision: 6, scale: 2 }),
  ecTarget: decimal("ecTarget", { precision: 4, scale: 2 }),
  phTarget: decimal("phTarget", { precision: 3, scale: 1 }),
  productsJson: text("productsJson").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecipeTemplate = typeof recipeTemplates.$inferSelect;
export type InsertRecipeTemplate = typeof recipeTemplates.$inferInsert;

/**
 * Templates de Tarefas (fixas por fase/semana)
 */
export const taskTemplates = mysqlTable("taskTemplates", {
  id: int("id").autoincrement().primaryKey(),
  context: mysqlEnum("context", ["TENT_A", "TENT_BC"]).notNull(),
  phase: mysqlEnum("phase", ["CLONING", "VEGA", "FLORA", "MAINTENANCE"]).notNull(),
  weekNumber: int("weekNumber"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskTemplate = typeof taskTemplates.$inferSelect;
export type InsertTaskTemplate = typeof taskTemplates.$inferInsert;

/**
 * Instâncias de Tarefas (execução)
 */
export const taskInstances = mysqlTable(
  "taskInstances",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    taskTemplateId: int("taskTemplateId")
      .notNull()
      .references(() => taskTemplates.id),
    occurrenceDate: timestamp("occurrenceDate").notNull(),
    isDone: boolean("isDone").default(false).notNull(),
    completedAt: timestamp("completedAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tentTaskDateUnique: unique("tentTaskDateUnique").on(
      table.tentId,
      table.taskTemplateId,
      table.occurrenceDate
    ),
    tentIdx: index("tentIdx").on(table.tentId),
    dateIdx: index("dateIdx").on(table.occurrenceDate),
  })
);

export type TaskInstance = typeof taskInstances.$inferSelect;
export type InsertTaskInstance = typeof taskInstances.$inferInsert;

/**
 * Alertas
 */
export const alerts = mysqlTable(
  "alerts",
  {
    id: int("id").autoincrement().primaryKey(),
    tentId: int("tentId")
      .notNull()
      .references(() => tents.id),
    alertType: mysqlEnum("alertType", ["OUT_OF_RANGE", "SAFETY_LIMIT", "TREND"]).notNull(),
    metric: mysqlEnum("metric", ["TEMP", "RH", "PPFD"]).notNull(),
    logDate: timestamp("logDate").notNull(),
    turn: mysqlEnum("turn", ["AM", "PM"]),
    value: decimal("value", { precision: 10, scale: 2 }),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["NEW", "SEEN"]).default("NEW").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tentIdx: index("tentIdx").on(table.tentId),
    statusIdx: index("statusIdx").on(table.status),
    dateIdx: index("dateIdx").on(table.logDate),
  })
);

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Limites de Segurança (hard limits por fase)
 */
export const safetyLimits = mysqlTable(
  "safetyLimits",
  {
    id: int("id").autoincrement().primaryKey(),
    context: mysqlEnum("context", ["TENT_A", "TENT_BC"]).notNull(),
    phase: mysqlEnum("phase", ["CLONING", "VEGA", "FLORA", "MAINTENANCE"]).notNull(),
    metric: mysqlEnum("metric", ["TEMP", "RH", "PPFD"]).notNull(),
    minValue: decimal("minValue", { precision: 10, scale: 2 }),
    maxValue: decimal("maxValue", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    contextPhaseMetricUnique: unique("contextPhaseMetricUnique").on(
      table.context,
      table.phase,
      table.metric
    ),
  })
);

export type SafetyLimit = typeof safetyLimits.$inferSelect;
export type InsertSafetyLimit = typeof safetyLimits.$inferInsert;