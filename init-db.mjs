import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Inicializando banco de dados SQLite...\n');

// Create database file
const db = new Database('./local.db');

// Read and execute schema
const schemaPath = join(__dirname, 'schema-sqlite.sql');
console.log('📄 Lendo schema do banco...');

try {
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Split by semicolon and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  console.log(`📝 Executando ${statements.length} comandos SQL...\n`);
  
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
  
  console.log('✅ Banco de dados inicializado com sucesso!');
  console.log('📊 Tabelas criadas: tents, cycles, logs, alerts, tasks, strains, etc.\n');
  console.log('🚀 Agora você pode rodar: pnpm dev\n');
  
} catch (err) {
  console.error('❌ Erro ao ler schema:', err.message);
  process.exit(1);
} finally {
  db.close();
}
