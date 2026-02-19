import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function createNotificationSettingsTable() {
  const connection = await mysql.createConnection(connectionString);
  
  try {
    console.log('[Migration] Criando tabela notificationSettings...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notificationSettings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        tempAlertsEnabled BOOLEAN NOT NULL DEFAULT TRUE,
        rhAlertsEnabled BOOLEAN NOT NULL DEFAULT TRUE,
        ppfdAlertsEnabled BOOLEAN NOT NULL DEFAULT TRUE,
        phAlertsEnabled BOOLEAN NOT NULL DEFAULT TRUE,
        taskRemindersEnabled BOOLEAN NOT NULL DEFAULT TRUE,
        dailySummaryEnabled BOOLEAN NOT NULL DEFAULT FALSE,
        dailySummaryTime VARCHAR(5) DEFAULT '09:00',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX userId_idx (userId)
      )
    `);
    
    console.log('✅ Tabela notificationSettings criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createNotificationSettingsTable().catch(console.error);
