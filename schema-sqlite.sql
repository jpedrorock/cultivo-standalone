-- App Cultivo - SQLite Schema
-- Complete database schema for local installation

PRAGMA foreign_keys=OFF;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openId TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  loginMethod TEXT,
  role TEXT DEFAULT 'user' NOT NULL CHECK(role IN ('user', 'admin')),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tents table
CREATE TABLE IF NOT EXISTS tents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tentType TEXT NOT NULL CHECK(tentType IN ('A', 'B', 'C')),
  width INTEGER NOT NULL,
  depth INTEGER NOT NULL,
  height INTEGER NOT NULL,
  volume REAL NOT NULL,
  powerW INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Strains table
CREATE TABLE IF NOT EXISTS strains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  vegaWeeks INTEGER DEFAULT 4 NOT NULL,
  floraWeeks INTEGER DEFAULT 8 NOT NULL,
  isActive INTEGER DEFAULT 1 NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Cycles table
CREATE TABLE IF NOT EXISTS cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  strainId INTEGER NOT NULL REFERENCES strains(id),
  startDate TEXT NOT NULL,
  floraStartDate TEXT,
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK(status IN ('ACTIVE', 'FINISHED')),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS tentIdx ON cycles(tentId);
CREATE INDEX IF NOT EXISTS strainIdx ON cycles(strainId);

-- TentAState table
CREATE TABLE IF NOT EXISTS tentAState (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL UNIQUE REFERENCES tents(id),
  mode TEXT DEFAULT 'MAINTENANCE' NOT NULL CHECK(mode IN ('MAINTENANCE', 'CLONING')),
  activeCloningEventId INTEGER REFERENCES cloningEvents(id),
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CloningEvents table
CREATE TABLE IF NOT EXISTS cloningEvents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK(status IN ('ACTIVE', 'FINISHED')),
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS cloningEvents_tentIdx ON cloningEvents(tentId);

-- WeeklyTargets table
CREATE TABLE IF NOT EXISTS weeklyTargets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strainId INTEGER NOT NULL REFERENCES strains(id),
  phase TEXT NOT NULL CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE')),
  weekNumber INTEGER NOT NULL,
  tempMin REAL,
  tempMax REAL,
  rhMin REAL,
  rhMax REAL,
  ppfdMin INTEGER,
  ppfdMax INTEGER,
  photoperiod TEXT,
  phMin REAL,
  phMax REAL,
  ecMin REAL,
  ecMax REAL,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(strainId, phase, weekNumber)
);
CREATE INDEX IF NOT EXISTS weeklyTargets_strainIdx ON weeklyTargets(strainId);

-- DailyLogs table
CREATE TABLE IF NOT EXISTS dailyLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  logDate TEXT NOT NULL,
  turn TEXT NOT NULL CHECK(turn IN ('AM', 'PM')),
  tempC REAL,
  rhPct REAL,
  ppfd INTEGER,
  ph REAL,
  ec REAL,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(tentId, logDate, turn)
);
CREATE INDEX IF NOT EXISTS dailyLogs_tentIdx ON dailyLogs(tentId);
CREATE INDEX IF NOT EXISTS dailyLogs_dateIdx ON dailyLogs(logDate);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  logDate TEXT NOT NULL,
  turn TEXT NOT NULL CHECK(turn IN ('AM', 'PM')),
  volumeTotalL REAL,
  ecTarget REAL,
  phTarget REAL,
  productsJson TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(tentId, logDate, turn)
);
CREATE INDEX IF NOT EXISTS recipes_tentIdx ON recipes(tentId);

-- RecipeTemplates table
CREATE TABLE IF NOT EXISTS recipeTemplates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE')),
  weekNumber INTEGER,
  volumeTotalL REAL,
  ecTarget REAL,
  phTarget REAL,
  productsJson TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- TaskTemplates table
CREATE TABLE IF NOT EXISTS taskTemplates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  context TEXT NOT NULL CHECK(context IN ('TENT_A', 'TENT_BC')),
  phase TEXT NOT NULL CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE')),
  weekNumber INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- TaskInstances table
CREATE TABLE IF NOT EXISTS taskInstances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  taskTemplateId INTEGER NOT NULL REFERENCES taskTemplates(id),
  occurrenceDate TEXT NOT NULL,
  isDone INTEGER DEFAULT 0 NOT NULL,
  completedAt TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(tentId, taskTemplateId, occurrenceDate)
);
CREATE INDEX IF NOT EXISTS taskInstances_tentIdx ON taskInstances(tentId);
CREATE INDEX IF NOT EXISTS taskInstances_dateIdx ON taskInstances(occurrenceDate);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  alertType TEXT NOT NULL CHECK(alertType IN ('OUT_OF_RANGE', 'SAFETY_LIMIT', 'TREND')),
  metric TEXT NOT NULL CHECK(metric IN ('TEMP', 'RH', 'PPFD')),
  logDate TEXT NOT NULL,
  turn TEXT CHECK(turn IN ('AM', 'PM')),
  value REAL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW' NOT NULL CHECK(status IN ('NEW', 'SEEN')),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS alerts_tentIdx ON alerts(tentId);
CREATE INDEX IF NOT EXISTS alerts_statusIdx ON alerts(status);
CREATE INDEX IF NOT EXISTS alerts_dateIdx ON alerts(logDate);

-- SafetyLimits table
CREATE TABLE IF NOT EXISTS safetyLimits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  context TEXT NOT NULL CHECK(context IN ('TENT_A', 'TENT_BC')),
  phase TEXT NOT NULL CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE')),
  metric TEXT NOT NULL CHECK(metric IN ('TEMP', 'RH', 'PPFD')),
  minValue REAL,
  maxValue REAL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(context, phase, metric)
);

-- AlertSettings table
CREATE TABLE IF NOT EXISTS alertSettings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  alertsEnabled INTEGER DEFAULT 1 NOT NULL,
  tempEnabled INTEGER DEFAULT 1 NOT NULL,
  rhEnabled INTEGER DEFAULT 1 NOT NULL,
  ppfdEnabled INTEGER DEFAULT 1 NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- AlertHistory table
CREATE TABLE IF NOT EXISTS alertHistory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tentId INTEGER NOT NULL REFERENCES tents(id),
  metric TEXT NOT NULL CHECK(metric IN ('TEMP', 'RH', 'PPFD')),
  value REAL NOT NULL,
  targetMin REAL,
  targetMax REAL,
  message TEXT NOT NULL,
  notificationSent INTEGER DEFAULT 0 NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS alertHistory_tentIdx ON alertHistory(tentId);
CREATE INDEX IF NOT EXISTS alertHistory_dateIdx ON alertHistory(createdAt);

PRAGMA foreign_keys=ON;
