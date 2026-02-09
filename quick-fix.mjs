import Database from 'better-sqlite3';

console.log('🔧 Aplicando correções rápidas ao banco de dados...\n');

const db = new Database('./local.db');

try {
  // Add missing alertSettings table
  console.log('📄 Criando tabela alertSettings...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS alertSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tentId INTEGER NOT NULL REFERENCES tents(id),
      alertType TEXT NOT NULL,
      isEnabled INTEGER DEFAULT 1 NOT NULL,
      threshold REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE(tentId, alertType)
    )
  `);
  console.log('✅ Tabela alertSettings criada\n');

  console.log('✅ Correções aplicadas com sucesso!');
  console.log('🚀 Agora você pode criar estufas normalmente.\n');

} catch (err) {
  console.error('❌ Erro:', err.message);
  process.exit(1);
}

db.close();
