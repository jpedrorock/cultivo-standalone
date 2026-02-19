import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🔄 Aplicando migrations...\n');

try {
  // 1. Criar tabela alertPreferences
  console.log('✓ Criando tabela alertPreferences...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS alertPreferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // 2. Adicionar colunas em alertSettings
  console.log('✓ Adicionando colunas em alertSettings...');
  
  // phEnabled
  try {
    await connection.execute(`
      ALTER TABLE alertSettings 
      ADD COLUMN phEnabled BOOLEAN DEFAULT TRUE NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - phEnabled já existe');
  }

  // tempMargin
  try {
    await connection.execute(`
      ALTER TABLE alertSettings 
      ADD COLUMN tempMargin DECIMAL(3,1) DEFAULT 2.0 NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - tempMargin já existe');
  }

  // rhMargin
  try {
    await connection.execute(`
      ALTER TABLE alertSettings 
      ADD COLUMN rhMargin DECIMAL(3,1) DEFAULT 5.0 NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - rhMargin já existe');
  }

  // ppfdMargin
  try {
    await connection.execute(`
      ALTER TABLE alertSettings 
      ADD COLUMN ppfdMargin INT DEFAULT 50 NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - ppfdMargin já existe');
  }

  // phMargin
  try {
    await connection.execute(`
      ALTER TABLE alertSettings 
      ADD COLUMN phMargin DECIMAL(2,1) DEFAULT 0.2 NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - phMargin já existe');
  }

  // 3. Modificar tabela tents (tentType → category)
  console.log('✓ Atualizando tabela tents...');
  
  // Adicionar coluna category
  try {
    await connection.execute(`
      ALTER TABLE tents 
      ADD COLUMN category ENUM('MAINTENANCE', 'VEGA', 'FLORA', 'DRYING') NOT NULL DEFAULT 'VEGA'
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - category já existe');
  }

  // Migrar dados tentType → category
  await connection.execute(`
    UPDATE tents 
    SET category = CASE 
      WHEN tentType = 'A' THEN 'MAINTENANCE'
      WHEN tentType = 'B' THEN 'VEGA'
      WHEN tentType = 'C' THEN 'FLORA'
      ELSE 'VEGA'
    END
    WHERE category = 'VEGA'
  `);

  // Remover coluna tentType
  try {
    await connection.execute(`
      ALTER TABLE tents 
      DROP COLUMN tentType
    `);
  } catch (e) {
    if (!e.message.includes("Can't DROP")) throw e;
    console.log('  - tentType já foi removido');
  }

  // Adicionar updatedAt
  try {
    await connection.execute(`
      ALTER TABLE tents 
      ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    `);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
    console.log('  - updatedAt já existe');
  }

  // 4. Adicionar DRYING em weeklyTargets, taskTemplates, safetyLimits
  console.log('✓ Atualizando enums de fase...');
  
  // weeklyTargets
  try {
    await connection.execute(`
      ALTER TABLE weeklyTargets 
      MODIFY COLUMN phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL
    `);
  } catch (e) {
    console.log('  - weeklyTargets.phase já atualizado');
  }

  // taskTemplates
  try {
    await connection.execute(`
      ALTER TABLE taskTemplates 
      MODIFY COLUMN phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL
    `);
  } catch (e) {
    console.log('  - taskTemplates.phase já atualizado');
  }

  // safetyLimits
  try {
    await connection.execute(`
      ALTER TABLE safetyLimits 
      MODIFY COLUMN phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL
    `);
  } catch (e) {
    console.log('  - safetyLimits.phase já atualizado');
  }

  console.log('\n✅ Migrations aplicadas com sucesso!');

} catch (error) {
  console.error('\n❌ Erro ao aplicar migrations:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
