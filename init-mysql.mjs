import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Inicializando banco de dados MySQL...\n');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada no .env');
  process.exit(1);
}

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
const urlMatch = DATABASE_URL.match(/mysql:\/\/([^:]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ DATABASE_URL inválida. Formato esperado: mysql://user:pass@host:port/dbname');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

const config = {
  host,
  port: parseInt(port),
  user,
  password: password || '',
  database,
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao MySQL\n');

    // Create tables using Drizzle schema
    console.log('📄 Criando tabelas...\n');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        tentType ENUM('A', 'B', 'C') NOT NULL,
        width INT NOT NULL,
        depth INT NOT NULL,
        height INT NOT NULL,
        volume DECIMAL(10,3) NOT NULL,
        powerW INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Strains table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS strains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        vegaWeeks INT DEFAULT 4 NOT NULL,
        floraWeeks INT DEFAULT 8 NOT NULL,
        isActive BOOLEAN DEFAULT TRUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Cycles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        strainId INT NOT NULL,
        startDate TIMESTAMP NOT NULL,
        floraStartDate TIMESTAMP,
        status ENUM('ACTIVE', 'FINISHED') DEFAULT 'ACTIVE' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        FOREIGN KEY (strainId) REFERENCES strains(id),
        INDEX tentIdx (tentId),
        INDEX strainIdx (strainId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // DailyLogs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dailyLogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        logDate TIMESTAMP NOT NULL,
        turn ENUM('AM', 'PM') NOT NULL,
        tempC DECIMAL(4,1),
        rhPct DECIMAL(4,1),
        ppfd INT,
        ph DECIMAL(3,1),
        ec DECIMAL(4,2),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        UNIQUE KEY tentDateTurnUnique (tentId, logDate, turn),
        INDEX tentIdx (tentId),
        INDEX dateIdx (logDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // WeeklyTargets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS weeklyTargets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        strainId INT NOT NULL,
        phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
        weekNumber INT NOT NULL,
        tempMin DECIMAL(4,1),
        tempMax DECIMAL(4,1),
        rhMin DECIMAL(4,1),
        rhMax DECIMAL(4,1),
        ppfdMin INT,
        ppfdMax INT,
        photoperiod VARCHAR(10),
        phMin DECIMAL(3,1),
        phMax DECIMAL(3,1),
        ecMin DECIMAL(3,1),
        ecMax DECIMAL(3,1),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (strainId) REFERENCES strains(id),
        UNIQUE KEY strainPhaseWeekUnique (strainId, phase, weekNumber),
        INDEX strainIdx (strainId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // TentAState table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tentAState (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL UNIQUE,
        mode ENUM('MAINTENANCE', 'CLONING') DEFAULT 'MAINTENANCE' NOT NULL,
        activeCloningEventId INT,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // CloningEvents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cloningEvents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        startDate TIMESTAMP NOT NULL,
        endDate TIMESTAMP NOT NULL,
        status ENUM('ACTIVE', 'FINISHED') DEFAULT 'ACTIVE' NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        INDEX tentIdx (tentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // SafetyLimits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS safetyLimits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        context ENUM('GLOBAL', 'TENT_TYPE_A', 'TENT_TYPE_B', 'TENT_TYPE_C') NOT NULL,
        phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'ALL') NOT NULL,
        tempMinLimit DECIMAL(4,1),
        tempMaxLimit DECIMAL(4,1),
        rhMinLimit DECIMAL(4,1),
        rhMaxLimit DECIMAL(4,1),
        ppfdMinLimit INT,
        ppfdMaxLimit INT,
        phMinLimit DECIMAL(3,1),
        phMaxLimit DECIMAL(3,1),
        ecMinLimit DECIMAL(3,1),
        ecMaxLimit DECIMAL(3,1),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY contextPhaseUnique (context, phase)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // AlertSettings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alertSettings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        alertType VARCHAR(50) NOT NULL,
        isEnabled BOOLEAN DEFAULT TRUE NOT NULL,
        threshold DECIMAL(10,2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        UNIQUE KEY tentAlertTypeUnique (tentId, alertType)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recipes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        logDate TIMESTAMP NOT NULL,
        turn ENUM('AM', 'PM') NOT NULL,
        volumeTotalL DECIMAL(6,2),
        ecTarget DECIMAL(4,2),
        phTarget DECIMAL(3,1),
        productsJson TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        UNIQUE KEY tentDateTurnUnique (tentId, logDate, turn),
        INDEX tentIdx (tentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // RecipeTemplates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipeTemplates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
        weekNumber INT,
        volumeTotalL DECIMAL(6,2),
        ecTarget DECIMAL(4,2),
        phTarget DECIMAL(3,1),
        productsJson TEXT NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // TaskTemplates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS taskTemplates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        context ENUM('TENT_A', 'TENT_BC') NOT NULL,
        phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
        weekNumber INT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // TaskInstances table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS taskInstances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        taskTemplateId INT NOT NULL,
        occurrenceDate TIMESTAMP NOT NULL,
        isDone BOOLEAN DEFAULT FALSE NOT NULL,
        completedAt TIMESTAMP,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        FOREIGN KEY (taskTemplateId) REFERENCES taskTemplates(id),
        UNIQUE KEY tentTaskDateUnique (tentId, taskTemplateId, occurrenceDate),
        INDEX tentIdx (tentId),
        INDEX dateIdx (occurrenceDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Alerts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        alertType VARCHAR(50) NOT NULL,
        severity ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'WARNING' NOT NULL,
        message TEXT NOT NULL,
        status ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'ACTIVE' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        acknowledgedAt TIMESTAMP,
        resolvedAt TIMESTAMP,
        FOREIGN KEY (tentId) REFERENCES tents(id),
        INDEX tentIdx (tentId),
        INDEX statusIdx (status),
        INDEX dateIdx (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabelas criadas com sucesso!\n');

    // Insert sample data
    console.log('📊 Inserindo dados de exemplo...\n');

    // Sample tent
    await connection.execute(`
      INSERT IGNORE INTO tents (id, name, tentType, width, depth, height, volume, powerW)
      VALUES (1, 'Estufa Principal', 'B', 120, 120, 200, 2.880, 600)
    `);

    // Sample strain
    await connection.execute(`
      INSERT IGNORE INTO strains (id, name, description, vegaWeeks, floraWeeks, isActive)
      VALUES (1, 'Strain Exemplo', 'Strain de exemplo para testes', 4, 8, TRUE)
    `);

    // Sample cycle
    await connection.execute(`
      INSERT IGNORE INTO cycles (id, tentId, strainId, startDate, floraStartDate, status)
      VALUES (1, 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'ACTIVE')
    `);

    // Sample daily logs (last 15 days, AM + PM)
    for (let i = 14; i >= 0; i--) {
      const tempAM = 22 + Math.random() * 4;
      const rhAM = 55 + Math.random() * 10;
      const ppfdAM = 400 + Math.floor(Math.random() * 200);
      const phAM = 5.8 + Math.random() * 0.6;
      const ecAM = 1.2 + Math.random() * 0.4;

      const tempPM = 24 + Math.random() * 4;
      const rhPM = 50 + Math.random() * 15;
      const ppfdPM = 450 + Math.floor(Math.random() * 250);
      const phPM = 5.9 + Math.random() * 0.5;
      const ecPM = 1.3 + Math.random() * 0.3;

      await connection.execute(`
        INSERT IGNORE INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd, ph, ec)
        VALUES 
          (1, DATE_SUB(CURDATE(), INTERVAL ${i} DAY), 'AM', ${tempAM.toFixed(1)}, ${rhAM.toFixed(1)}, ${ppfdAM}, ${phAM.toFixed(1)}, ${ecAM.toFixed(2)}),
          (1, DATE_SUB(CURDATE(), INTERVAL ${i} DAY), 'PM', ${tempPM.toFixed(1)}, ${rhPM.toFixed(1)}, ${ppfdPM}, ${phPM.toFixed(1)}, ${ecPM.toFixed(2)})
      `);
    }

    // Sample weekly targets for VEGA phase
    for (let week = 1; week <= 4; week++) {
      await connection.execute(`
        INSERT IGNORE INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
        VALUES (1, 'VEGA', ${week}, 20.0, 26.0, 50.0, 70.0, 400, 600, '18/6', 5.8, 6.3, 1.0, 1.8)
      `);
    }

    // Sample weekly targets for FLORA phase
    for (let week = 1; week <= 8; week++) {
      await connection.execute(`
        INSERT IGNORE INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
        VALUES (1, 'FLORA', ${week}, 20.0, 28.0, 40.0, 60.0, 600, 900, '12/12', 6.0, 6.5, 1.5, 2.5)
      `);
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
    console.error('❌ Erro ao inicializar banco:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase().then(() => {
  console.log('🚀 Banco de dados pronto! Agora rode: npm run dev\n');
  process.exit(0);
});
