import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function createNutrientApplicationsTable() {
  const connection = await mysql.createConnection(connectionString);
  
  try {
    console.log('[Migration] Criando tabela nutrientApplications...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nutrientApplications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tentId INT NOT NULL,
        cycleId INT,
        recipeTemplateId INT,
        
        applicationDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        recipeName VARCHAR(100) NOT NULL,
        phase ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE', 'DRYING') NOT NULL,
        weekNumber INT,
        
        volumeTotalL DECIMAL(6, 2) NOT NULL,
        ecTarget DECIMAL(4, 2),
        ecActual DECIMAL(4, 2),
        phTarget DECIMAL(3, 1),
        phActual DECIMAL(3, 1),
        
        productsJson TEXT NOT NULL,
        notes TEXT,
        
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        INDEX tentId_idx (tentId),
        INDEX cycleId_idx (cycleId),
        INDEX applicationDate_idx (applicationDate)
      )
    `);
    
    console.log('✅ Tabela nutrientApplications criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createNutrientApplicationsTable().catch(console.error);
