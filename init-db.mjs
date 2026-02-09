import Database from 'better-sqlite3';

console.log('🔧 Inicializando banco de dados SQLite...\n');

// Create database file
const db = new Database('./local.db');

console.log('📄 Criando tabelas essenciais...\n');

try {
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys=OFF');

  // Users table
  db.exec(`
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
    )
  `);

  // Tents table
  db.exec(`
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
    )
  `);

  // Strains table
  db.exec(`
    CREATE TABLE IF NOT EXISTS strains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      vegaWeeks INTEGER DEFAULT 4 NOT NULL,
      floraWeeks INTEGER DEFAULT 8 NOT NULL,
      isActive INTEGER DEFAULT 1 NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // Cycles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      strainId INTEGER NOT NULL REFERENCES strains(id),
      startDate TEXT NOT NULL,
      floraStartDate TEXT,
      status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK(status IN ('ACTIVE', 'FINISHED')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // DailyLogs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dailyLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      logDate TEXT NOT NULL,
      turn TEXT NOT NULL CHECK(turn IN ('AM', 'PM')),
      tempC REAL,
      rhPct REAL,
      ppfd INTEGER,
      notes TEXT,
      ph REAL,
      ec REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE(tentId, logDate, turn)
    )
  `);

  // WeeklyTargets table
  db.exec(`
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
    )
  `);

  // TentAState table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tentAState (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL UNIQUE REFERENCES tents(id),
      mode TEXT DEFAULT 'MAINTENANCE' NOT NULL CHECK(mode IN ('MAINTENANCE', 'CLONING')),
      activeCloningEventId INTEGER REFERENCES cloningEvents(id),
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // CloningEvents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cloningEvents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK(status IN ('ACTIVE', 'FINISHED')),
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // SafetyLimits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS safetyLimits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      context TEXT NOT NULL CHECK(context IN ('GLOBAL', 'TENT_TYPE_A', 'TENT_TYPE_B', 'TENT_TYPE_C')),
      phase TEXT NOT NULL CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'ALL')),
      tempMinLimit REAL,
      tempMaxLimit REAL,
      rhMinLimit REAL,
      rhMaxLimit REAL,
      ppfdMinLimit INTEGER,
      ppfdMaxLimit INTEGER,
      phMinLimit REAL,
      phMaxLimit REAL,
      ecMinLimit REAL,
      ecMaxLimit REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE(context, phase)
    )
  `);

  // Recipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      name TEXT NOT NULL,
      description TEXT,
      ingredients TEXT,
      instructions TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // TaskTemplates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS taskTemplates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      tentType TEXT CHECK(tentType IN ('A', 'B', 'C', 'ALL')),
      phase TEXT CHECK(phase IN ('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'ALL')),
      weekNumber INTEGER,
      dayOfWeek INTEGER,
      isActive INTEGER DEFAULT 1 NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // TaskInstances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS taskInstances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      taskTemplateId INTEGER REFERENCES taskTemplates(id),
      name TEXT NOT NULL,
      description TEXT,
      dueDate TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' NOT NULL CHECK(status IN ('PENDING', 'COMPLETED', 'SKIPPED')),
      completedAt TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // Alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      alertType TEXT NOT NULL CHECK(alertType IN ('TEMP_HIGH', 'TEMP_LOW', 'RH_HIGH', 'RH_LOW', 'PPFD_HIGH', 'PPFD_LOW', 'PH_HIGH', 'PH_LOW', 'EC_HIGH', 'EC_LOW', 'TASK_OVERDUE', 'CUSTOM')),
      severity TEXT DEFAULT 'WARNING' NOT NULL CHECK(severity IN ('INFO', 'WARNING', 'CRITICAL')),
      message TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE' NOT NULL CHECK(status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      acknowledgedAt TEXT,
      resolvedAt TEXT
    )
  `);

  // AlertHistory table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alertHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      alertType TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      triggeredAt TEXT NOT NULL,
      resolvedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS cycles_tentIdx ON cycles(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS cycles_strainIdx ON cycles(strainId)');
  db.exec('CREATE INDEX IF NOT EXISTS dailyLogs_tentIdx ON dailyLogs(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS dailyLogs_dateIdx ON dailyLogs(logDate)');
  db.exec('CREATE INDEX IF NOT EXISTS weeklyTargets_strainIdx ON weeklyTargets(strainId)');
  db.exec('CREATE INDEX IF NOT EXISTS cloningEvents_tentIdx ON cloningEvents(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS recipes_tentIdx ON recipes(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS taskInstances_tentIdx ON taskInstances(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS taskInstances_dateIdx ON taskInstances(dueDate)');
  db.exec('CREATE INDEX IF NOT EXISTS alerts_tentIdx ON alerts(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS alerts_statusIdx ON alerts(status)');
  db.exec('CREATE INDEX IF NOT EXISTS alerts_dateIdx ON alerts(createdAt)');
  db.exec('CREATE INDEX IF NOT EXISTS alertHistory_tentIdx ON alertHistory(tentId)');
  db.exec('CREATE INDEX IF NOT EXISTS alertHistory_dateIdx ON alertHistory(triggeredAt)');

  console.log('✅ Tabelas criadas com sucesso!\n');

  // Insert sample data
  console.log('📊 Inserindo dados de exemplo...\n');

  // Sample tent
  const insertTent = db.prepare(`
    INSERT OR IGNORE INTO tents (id, name, tentType, width, depth, height, volume, powerW)
    VALUES (1, 'Estufa Principal', 'B', 120, 120, 200, 2.88, 600)
  `);
  insertTent.run();

  // Sample strain
  const insertStrain = db.prepare(`
    INSERT OR IGNORE INTO strains (id, name, description, vegaWeeks, floraWeeks, isActive)
    VALUES (1, 'Strain Exemplo', 'Strain de exemplo para testes', 4, 8, 1)
  `);
  insertStrain.run();

  // Sample cycle
  const insertCycle = db.prepare(`
    INSERT OR IGNORE INTO cycles (id, tentId, strainId, startDate, floraStartDate, status)
    VALUES (1, 1, 1, datetime('now', '-30 days'), datetime('now', '-2 days'), 'ACTIVE')
  `);
  insertCycle.run();

  // Sample daily logs (last 14 days)
  const insertLog = db.prepare(`
    INSERT OR IGNORE INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd, ph, ec)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // AM reading
    insertLog.run(
      1,
      dateStr,
      'AM',
      22 + Math.random() * 4,
      55 + Math.random() * 10,
      400 + Math.floor(Math.random() * 200),
      5.8 + Math.random() * 0.6,
      1.2 + Math.random() * 0.4
    );
    
    // PM reading
    insertLog.run(
      1,
      dateStr,
      'PM',
      24 + Math.random() * 4,
      50 + Math.random() * 15,
      450 + Math.floor(Math.random() * 250),
      5.9 + Math.random() * 0.5,
      1.3 + Math.random() * 0.3
    );
  }

  // Sample weekly targets for VEGA phase
  const insertTarget = db.prepare(`
    INSERT OR IGNORE INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let week = 1; week <= 4; week++) {
    insertTarget.run(1, 'VEGA', week, 20, 26, 50, 70, 400, 600, '18/6', 5.8, 6.3, 1.0, 1.8);
  }

  for (let week = 1; week <= 8; week++) {
    insertTarget.run(1, 'FLORA', week, 20, 28, 40, 60, 600, 900, '12/12', 6.0, 6.5, 1.5, 2.5);
  }

  console.log('✅ Dados de exemplo inseridos!\n');
  console.log('📊 Banco inicializado com:');
  console.log('   ✅ 14 tabelas criadas');
  console.log('   ✅ 1 estufa de exemplo');
  console.log('   ✅ 1 strain de exemplo');
  console.log('   ✅ 1 ciclo ativo');
  console.log('   ✅ 30 registros de logs (15 dias, AM + PM)');
  console.log('   ✅ 12 targets semanais (4 VEGA + 8 FLORA)\n');

} catch (err) {
  console.error('❌ Erro ao criar banco:', err.message);
  process.exit(1);
}

db.close();

console.log('🚀 Banco de dados pronto! Agora rode: npm run dev\n');
