import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const now = new Date();

console.log('🗑️  Limpando banco de dados...');

// Limpar todas as tabelas na ordem correta (respeitando foreign keys)
await connection.query('SET FOREIGN_KEY_CHECKS = 0');

const tablesToClear = ['dailyLogs', 'plants', 'cycles', 'tents', 'strains', 'recipes', 'taskTemplates', 'taskInstances'];
for (const table of tablesToClear) {
  try {
    await connection.query(`TRUNCATE TABLE ${table}`);
    console.log(`  ✓ Tabela ${table} limpa`);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log(`  ⊘ Tabela ${table} não existe (pulando)`);
    } else {
      throw err;
    }
  }
}

await connection.query('SET FOREIGN_KEY_CHECKS = 1');

console.log('✅ Banco limpo!');
console.log('');
console.log('🌱 Criando strains...');

// Criar 8 strains
const strains = [
  { name: '24K Gold', description: 'Híbrido premium com alto teor de THC e aroma cítrico', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'OG Kush', description: 'Clássico híbrido californiano com efeito potente', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'Blue Dream', description: 'Sativa dominante com aroma de frutas vermelhas', vegaWeeks: 5, floraWeeks: 9 },
  { name: 'Northern Lights', description: 'Indica pura com efeito relaxante e floração rápida', vegaWeeks: 3, floraWeeks: 7 },
  { name: 'Gorilla Glue #4', description: 'Híbrido potente com produção massiva de resina', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'White Widow', description: 'Híbrido holandês clássico com tricomas brancos', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'Amnesia Haze', description: 'Sativa potente com floração longa e yield alto', vegaWeeks: 5, floraWeeks: 10 },
  { name: 'Purple Punch', description: 'Indica com aroma de uva e efeito sedativo', vegaWeeks: 4, floraWeeks: 8 }
];

const strainIds = [];
for (const strain of strains) {
  const [result] = await connection.query(
    `INSERT INTO strains (name, description, vegaWeeks, floraWeeks, isActive)
     VALUES (?, ?, ?, ?, true)`,
    [strain.name, strain.description, strain.vegaWeeks, strain.floraWeeks]
  );
  strainIds.push({ name: strain.name, id: result.insertId });
  console.log(`  ✓ ${strain.name}`);
}

console.log('');
console.log('🏠 Criando estufas...');

// Criar 3 estufas
const tents = [
  {
    name: 'Estufa Manutenção',
    category: 'MAINTENANCE',
    width: 45,
    depth: 75,
    height: 90,
    volume: (45 * 75 * 90) / 1000000, // m³
    powerW: 65
  },
  {
    name: 'Estufa Vegetativa',
    category: 'VEGA',
    width: 60,
    depth: 60,
    height: 120,
    volume: (60 * 60 * 120) / 1000000,
    powerW: 240
  },
  {
    name: 'Estufa Floração',
    category: 'FLORA',
    width: 60,
    depth: 120,
    height: 150,
    volume: (60 * 120 * 150) / 1000000,
    powerW: 320
  }
];

const tentIds = [];
for (const tent of tents) {
  const [result] = await connection.query(
    `INSERT INTO tents (name, category, width, depth, height, volume, powerW)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tent.name, tent.category, tent.width, tent.depth, tent.height, tent.volume, tent.powerW]
  );
  tentIds.push({ name: tent.name, id: result.insertId, category: tent.category });
  console.log(`  ✓ ${tent.name} (${tent.width}x${tent.depth}x${tent.height}cm, ${tent.powerW}W)`);
}

console.log('');
console.log('🌿 Criando plantas...');

// Criar 8 plantas
const plants = [
  // Estufa Manutenção (2 plantas)
  { name: '24K Gold Mãe #1', code: 'M-24K-01', strainName: '24K Gold', tentName: 'Estufa Manutenção', notes: 'Planta mãe para clonagem' },
  { name: 'OG Kush Mãe #1', code: 'M-OGK-01', strainName: 'OG Kush', tentName: 'Estufa Manutenção', notes: 'Planta mãe backup' },
  
  // Estufa Vegetativa (3 plantas)
  { name: '24K Gold Clone #1', code: 'V-24K-01', strainName: '24K Gold', tentName: 'Estufa Vegetativa', notes: 'Clone da M-24K-01, semana 3' },
  { name: '24K Gold Clone #2', code: 'V-24K-02', strainName: '24K Gold', tentName: 'Estufa Vegetativa', notes: 'Clone da M-24K-01, semana 3' },
  { name: '24K Gold Clone #3', code: 'V-24K-03', strainName: '24K Gold', tentName: 'Estufa Vegetativa', notes: 'Clone da M-24K-01, semana 3' },
  
  // Estufa Floração (3 plantas)
  { name: 'OG Kush Flora #1', code: 'F-OGK-01', strainName: 'OG Kush', tentName: 'Estufa Floração', notes: 'Semana 5 de floração' },
  { name: 'OG Kush Flora #2', code: 'F-OGK-02', strainName: 'OG Kush', tentName: 'Estufa Floração', notes: 'Semana 5 de floração' },
  { name: 'OG Kush Flora #3', code: 'F-OGK-03', strainName: 'OG Kush', tentName: 'Estufa Floração', notes: 'Semana 5 de floração' }
];

const plantIds = [];
for (const plant of plants) {
  const strain = strainIds.find(s => s.name === plant.strainName);
  const tent = tentIds.find(t => t.name === plant.tentName);
  
  const [result] = await connection.query(
    `INSERT INTO plants (name, code, strainId, currentTentId, status, notes)
     VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
    [plant.name, plant.code, strain.id, tent.id, plant.notes]
  );
  plantIds.push({ code: plant.code, id: result.insertId, tentId: tent.id });
  console.log(`  ✓ ${plant.code} (${plant.strainName}) → ${plant.tentName}`);
}

console.log('');
console.log('🔄 Criando ciclos ativos...');

// Criar ciclo para Estufa Vegetativa (iniciado 3 semanas atrás)
const vegaTent = tentIds.find(t => t.category === 'VEGA');
const vegaStrain = strainIds.find(s => s.name === '24K Gold');
const vegaStartDate = new Date(now);
vegaStartDate.setDate(vegaStartDate.getDate() - 21); // 3 semanas atrás
vegaStartDate.setHours(0, 0, 0, 0);

const [vegaCycleResult] = await connection.query(
  `INSERT INTO cycles (tentId, strainId, startDate, status)
   VALUES (?, ?, ?, 'ACTIVE')`,
  [vegaTent.id, vegaStrain.id, vegaStartDate]
);
console.log(`  ✓ Ciclo VEGA criado (Estufa Vegetativa, 24K Gold, semana 3)`);

// Criar ciclo para Estufa Floração (iniciado 5 semanas atrás em vega, floração há 5 semanas)
const floraTent = tentIds.find(t => t.category === 'FLORA');
const floraStrain = strainIds.find(s => s.name === 'OG Kush');
const floraStartDate = new Date(now);
floraStartDate.setDate(floraStartDate.getDate() - 70); // 10 semanas atrás (4 vega + 5 flora + 1 transição)
floraStartDate.setHours(0, 0, 0, 0);

const floraStartDateFlora = new Date(now);
floraStartDateFlora.setDate(floraStartDateFlora.getDate() - 35); // 5 semanas atrás
floraStartDateFlora.setHours(0, 0, 0, 0);

const [floraCycleResult] = await connection.query(
  `INSERT INTO cycles (tentId, strainId, startDate, floraStartDate, status)
   VALUES (?, ?, ?, ?, 'ACTIVE')`,
  [floraTent.id, floraStrain.id, floraStartDate, floraStartDateFlora]
);
console.log(`  ✓ Ciclo FLORA criado (Estufa Floração, OG Kush, semana 5 de floração)`);

console.log('');
console.log('📊 Gerando histórico de 7 dias (manhã e noite)...');

// Gerar 7 dias de histórico para cada estufa (AM e PM)
let logCount = 0;

for (let day = 6; day >= 0; day--) {
  const date = new Date(now);
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  
  for (const tent of tentIds) {
    // Parâmetros base por categoria
    let baseTemp, baseRh, basePpfd;
    if (tent.category === 'MAINTENANCE') {
      baseTemp = 24; baseRh = 60; basePpfd = 300;
    } else if (tent.category === 'VEGA') {
      baseTemp = 25; baseRh = 65; basePpfd = 500;
    } else { // FLORA
      baseTemp = 23; baseRh = 48; basePpfd = 750;
    }
    
    // Registro AM (manhã)
    const amDate = new Date(date);
    amDate.setHours(8, 0, 0, 0);
    const tempAM = baseTemp + (Math.random() * 4 - 2);
    const rhAM = baseRh + (Math.random() * 10 - 5);
    const ppfdAM = basePpfd + (Math.random() * 100 - 50);
    
    await connection.query(
      `INSERT INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd)
       VALUES (?, ?, 'AM', ?, ?, ?)`,
      [tent.id, amDate, tempAM.toFixed(1), rhAM.toFixed(1), Math.round(ppfdAM)]
    );
    logCount++;
    
    // Registro PM (noite)
    const pmDate = new Date(date);
    pmDate.setHours(20, 0, 0, 0);
    const tempPM = baseTemp + (Math.random() * 4 - 2);
    const rhPM = baseRh + (Math.random() * 10 - 5);
    const ppfdPM = basePpfd + (Math.random() * 100 - 50);
    
    await connection.query(
      `INSERT INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd)
       VALUES (?, ?, 'PM', ?, ?, ?)`,
      [tent.id, pmDate, tempPM.toFixed(1), rhPM.toFixed(1), Math.round(ppfdPM)]
    );
    logCount++;
  }
  
  console.log(`  ✓ Dia ${7 - day}/7 (${date.toISOString().split('T')[0]}) - AM e PM`);
}

console.log('');
console.log('✅ Seed concluído com sucesso!');
console.log('');
console.log('📈 Resumo:');
console.log(`  • ${strains.length} strains criadas`);
console.log(`  • ${tents.length} estufas configuradas`);
console.log(`  • 2 ciclos ativos (VEGA semana 3, FLORA semana 5)`);
console.log(`  • ${plants.length} plantas ativas`);
console.log(`  • ${logCount} registros de histórico (7 dias × 2 turnos × 3 estufas)`);
console.log('');
console.log('💡 Dados criados:');
console.log('  Estufa Manutenção: 2 plantas (24K Gold, OG Kush) - 65W');
console.log('  Estufa Vegetativa: 3 plantas (todas 24K Gold) - 240W');
console.log('  Estufa Floração: 3 plantas (todas OG Kush) - 320W');

await connection.end();
