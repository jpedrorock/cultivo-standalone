import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';
import { config } from 'dotenv';

config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Export CREATE TABLE statements
const tables = await connection.query(`
  SELECT TABLE_NAME 
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = DATABASE()
  ORDER BY TABLE_NAME
`);

console.log('-- Schema exportado do banco Manus');
console.log('-- Gerado em:', new Date().toISOString());
console.log('');

for (const row of tables[0]) {
  const tableName = row.TABLE_NAME;
  const createTable = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
  console.log(createTable[0][0]['Create Table'] + ';');
  console.log('');
}

await connection.end();
