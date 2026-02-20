import { writeFileSync } from 'fs';

console.log('📦 Exportando backup do banco via tRPC...\n');

const response = await fetch('http://localhost:3000/api/trpc/backup.export', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

if (!response.ok) {
  console.error('❌ Erro ao exportar backup:', response.statusText);
  process.exit(1);
}

const result = await response.json();
const backup = result.result.data;

writeFileSync('backup-seed-data.json', JSON.stringify(backup, null, 2));

let totalRecords = 0;
for (const [table, records] of Object.entries(backup)) {
  if (records.length > 0) {
    console.log(`  ✅ ${table}: ${records.length} registros`);
    totalRecords += records.length;
  }
}

console.log(`\n🎉 Backup completo exportado!`);
console.log(`📊 Total: ${totalRecords} registros`);
console.log(`📁 Arquivo: backup-seed-data.json\n`);

process.exit(0);
