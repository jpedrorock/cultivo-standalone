import { db } from './server/db.js';
import * as schema from './drizzle/schema.js';
import { writeFileSync } from 'fs';

console.log('📦 Exportando backup do banco de dados...\n');

const backup = {};
let totalRecords = 0;

for (const [name, table] of Object.entries(schema)) {
  if (table && typeof table === 'object' && 'name' in table) {
    const data = await db.select().from(table);
    backup[table.name] = data;
    if (data.length > 0) {
      console.log(`  ✅ ${table.name}: ${data.length} registros`);
      totalRecords += data.length;
    }
  }
}

writeFileSync('backup-seed-data.json', JSON.stringify(backup, null, 2));

console.log(`\n🎉 Backup completo exportado!`);
console.log(`📊 Total: ${totalRecords} registros`);
console.log(`📁 Arquivo: backup-seed-data.json\n`);

process.exit(0);
