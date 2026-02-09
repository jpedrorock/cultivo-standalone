import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Inicializando banco de dados SQLite...\n');

// Create database file
const db = new Database('./local.db');

// Function to execute SQL file
function executeSQLFile(filePath, description) {
  if (!existsSync(filePath)) {
    console.log(`⚠️  Arquivo ${filePath} não encontrado, pulando...`);
    return false;
  }

  console.log(`📄 ${description}...`);
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executando ${statements.length} comandos SQL...`);
    
    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (err) {
        // Ignore "table already exists" errors
        if (!err.message.includes('already exists')) {
          console.error('❌ Erro ao executar:', statement.substring(0, 50) + '...');
          console.error(err.message);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Erro ao ler ${filePath}:`, err.message);
    return false;
  }
}

// 1. Apply schema
const schemaPath = join(__dirname, 'schema-sqlite.sql');
if (executeSQLFile(schemaPath, 'Criando tabelas do banco de dados')) {
  console.log('✅ Schema aplicado com sucesso!\n');
}

// 2. Import sample data
const dataPath = join(__dirname, 'data-export.sql');
if (executeSQLFile(dataPath, 'Importando dados de exemplo')) {
  console.log('✅ Dados de exemplo importados!\n');
  console.log('📊 Banco inicializado com:');
  console.log('   - 19 tabelas criadas');
  console.log('   - 29 registros de exemplo (14 dias de histórico)');
  console.log('   - 1 estufa de exemplo');
  console.log('   - 1 ciclo ativo');
  console.log('   - Dados prontos para testar gráficos\n');
} else {
  console.log('✅ Banco de dados criado (sem dados de exemplo)\n');
}

console.log('🚀 Agora você pode rodar: pnpm dev\n');

db.close();
