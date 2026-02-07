import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get all tables except migrations
const [tables] = await connection.query(`
  SELECT TABLE_NAME 
  FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME != '__drizzle_migrations'
  ORDER BY TABLE_NAME
`);

console.log('-- Dados exportados do banco Manus');
console.log('-- Gerado em:', new Date().toISOString());
console.log('');

for (const row of tables) {
  const tableName = row.TABLE_NAME;
  
  // Get data
  const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
  
  if (rows.length === 0) continue;
  
  console.log(`-- Data for table: ${tableName}`);
  
  // Get column names
  const columns = Object.keys(rows[0]);
  
  for (const dataRow of rows) {
    const values = columns.map(col => {
      const val = dataRow[col];
      if (val === null) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      if (typeof val === 'boolean') return val ? '1' : '0';
      return val;
    });
    
    console.log(`INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});`);
  }
  
  console.log('');
}

await connection.end();
