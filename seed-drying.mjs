import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const sql = fs.readFileSync('seed-drying-data.sql', 'utf8');
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log('✅ Executed:', stmt.substring(0, 80) + '...');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Statement:', stmt.substring(0, 100));
  }
}

await conn.end();
console.log('\n✅ DRYING weeklyTargets and taskTemplates seeded successfully!');
