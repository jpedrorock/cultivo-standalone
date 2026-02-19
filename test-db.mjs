import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
console.log('DB URL exists:', !!url);
if (url) {
  console.log('DB URL prefix:', url.substring(0, 30) + '...');
  try {
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.execute('SHOW TABLES');
    console.log('Tables:', rows.map(r => Object.values(r)[0]));
    await conn.end();
  } catch (e) {
    console.error('Connection error:', e.message);
  }
}
