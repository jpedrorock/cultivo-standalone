/**
 * Seed Script - Dados de Demonstração do App Cultivo
 * 
 * Limpa todos os dados existentes e cria:
 * - 6 strains principais
 * - 3 estufas (A Manutenção, B Vega, C Floração)
 * - Ciclos ativos para B e C
 * - 8 plantas distribuídas nas estufas
 * - Registros diários de 1 semana (12-18/fev) para B e C
 * - Registros de saúde de 1 semana para todas as plantas
 * - Registros de tricomas para plantas em floração (C)
 * - Registros de LST para plantas em vega (B)
 * - Observações para algumas plantas
 * - Predefinições de fertilização e rega para vasos de 5L
 * - Weekly targets para as strains usadas
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Helper: format date for MySQL
function mysqlDate(d) {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper: random float between min and max with precision
function rand(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Helper: random int between min and max
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: pick random from array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

console.log('🗑️  Limpando dados existentes...');

// Disable FK checks for clean truncation
await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

const tablesToClean = [
  'plantHealthLogs', 'plantTrichomeLogs', 'plantLSTLogs', 'plantObservations',
  'plantPhotos', 'plantRunoffLogs', 'plantTentHistory',
  'plants', 'taskInstances', 'taskTemplates',
  'dailyLogs', 'recipes', 'recipeTemplates',
  'alerts', 'alertHistory', 'alertSettings', 'notificationHistory',
  'weeklyTargets', 'tentAState', 'cloningEvents',
  'cycles', 'fertilizationPresets', 'wateringPresets',
  'safetyLimits', 'tents', 'strains'
];

for (const table of tablesToClean) {
  try {
    await conn.execute(`DELETE FROM ${table}`);
    await conn.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    console.log(`  ✓ ${table} limpa`);
  } catch (e) {
    console.log(`  ⚠ ${table}: ${e.message}`);
  }
}

await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
console.log('');

// ============================================================
// 1. STRAINS
// ============================================================
console.log('🌱 Criando 6 strains...');

const strainsData = [
  { name: '24K Gold', description: 'Indica dominante. Aroma doce e terroso com tons cítricos. Efeito relaxante e sedativo. Excelente para cultivo indoor com boa produção de resina.', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'Candy Kush', description: 'Híbrida equilibrada. Sabor doce de baunilha e frutas. Efeito relaxante mas funcional. Boa resistência a pragas e fácil de cultivar.', vegaWeeks: 4, floraWeeks: 9 },
  { name: 'Northern Lights', description: 'Indica clássica. Uma das strains mais famosas do mundo. Aroma terroso e pinheiro. Floração rápida e alta produção. Ideal para iniciantes.', vegaWeeks: 3, floraWeeks: 7 },
  { name: 'White Widow', description: 'Híbrida lendária. Cobertura densa de tricomas brancos. Aroma terroso e amadeirado. Efeito potente e duradouro. Boa para extrações.', vegaWeeks: 4, floraWeeks: 8 },
  { name: 'Gorilla Glue', description: 'Híbrida potente. Altos níveis de resina, extremamente pegajosa. Aroma diesel e chocolate. Produção abundante em espaços pequenos.', vegaWeeks: 4, floraWeeks: 9 },
  { name: 'Amnesia Haze', description: 'Sativa dominante. Aroma cítrico e terroso intenso. Efeito energético e criativo. Floração mais longa mas recompensadora em qualidade.', vegaWeeks: 5, floraWeeks: 10 },
];

for (const s of strainsData) {
  await conn.execute(
    'INSERT INTO strains (name, description, vegaWeeks, floraWeeks, isActive) VALUES (?, ?, ?, ?, 1)',
    [s.name, s.description, s.vegaWeeks, s.floraWeeks]
  );
}

// Get strain IDs
const [strainRows] = await conn.execute('SELECT id, name FROM strains ORDER BY id');
const strainMap = {};
for (const r of strainRows) {
  strainMap[r.name] = r.id;
}
console.log('  ✓ Strains criadas:', Object.keys(strainMap).join(', '));

// ============================================================
// 2. ESTUFAS
// ============================================================
console.log('🏠 Criando 3 estufas...');

const tentsData = [
  { name: 'Estufa A', tentType: 'A', width: 45, depth: 75, height: 90, powerW: 65 },
  { name: 'Estufa B', tentType: 'B', width: 60, depth: 60, height: 120, powerW: 240 },
  { name: 'Estufa C', tentType: 'C', width: 60, depth: 120, height: 150, powerW: 320 },
];

for (const t of tentsData) {
  const volume = (t.width * t.depth * t.height) / 1000;
  await conn.execute(
    'INSERT INTO tents (name, tentType, width, depth, height, volume, powerW) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [t.name, t.tentType, t.width, t.depth, t.height, volume.toFixed(3), t.powerW]
  );
}

const [tentRows] = await conn.execute('SELECT id, name FROM tents ORDER BY id');
const tentMap = {};
for (const r of tentRows) {
  tentMap[r.name] = r.id;
}
console.log('  ✓ Estufas criadas:', Object.keys(tentMap).join(', '));

// ============================================================
// 3. TENT A STATE (Manutenção)
// ============================================================
console.log('🔧 Configurando estado da Estufa A (Manutenção)...');

await conn.execute(
  'INSERT INTO tentAState (tentId, mode) VALUES (?, ?)',
  [tentMap['Estufa A'], 'MAINTENANCE']
);
console.log('  ✓ Estufa A em modo MAINTENANCE');

// ============================================================
// 4. CICLOS ATIVOS
// ============================================================
console.log('🔄 Criando ciclos ativos...');

// Estufa B: Vega semana 3 (começou ~3 semanas atrás)
const vegaStart = new Date('2026-01-29T00:00:00Z'); // ~3 semanas antes de 19/fev
await conn.execute(
  'INSERT INTO cycles (tentId, strainId, startDate, status) VALUES (?, ?, ?, ?)',
  [tentMap['Estufa B'], strainMap['Candy Kush'], mysqlDate(vegaStart), 'ACTIVE']
);

// Estufa C: Flora semana 5 (começou vega ~9 semanas atrás, flora ~5 semanas atrás)
const floraVegaStart = new Date('2025-12-18T00:00:00Z'); // vega começou ~9 semanas atrás
const floraStart = new Date('2026-01-15T00:00:00Z'); // flora começou ~5 semanas atrás
await conn.execute(
  'INSERT INTO cycles (tentId, strainId, startDate, floraStartDate, status) VALUES (?, ?, ?, ?, ?)',
  [tentMap['Estufa C'], strainMap['24K Gold'], mysqlDate(floraVegaStart), mysqlDate(floraStart), 'ACTIVE']
);

console.log('  ✓ Estufa B: Candy Kush em Vega (semana 3)');
console.log('  ✓ Estufa C: 24K Gold em Flora (semana 5)');

// ============================================================
// 5. PLANTAS
// ============================================================
console.log('🌿 Criando 8 plantas...');

const plantsData = [
  // Estufa A - Manutenção (2 plantas, 2 strains)
  { name: '24K Gold #1', code: '24K-M01', strainName: '24K Gold', tentName: 'Estufa A', notes: 'Planta mãe em manutenção. Boa estrutura para clones.' },
  { name: 'Candy Kush #1', code: 'CK-M01', strainName: 'Candy Kush', tentName: 'Estufa A', notes: 'Planta mãe em manutenção. Fenótipo doce selecionado.' },
  
  // Estufa B - Vega (3 plantas Candy Kush)
  { name: 'Candy Kush #2', code: 'CK-V02', strainName: 'Candy Kush', tentName: 'Estufa B', notes: 'Clone da CK-M01. Crescimento vigoroso.' },
  { name: 'Candy Kush #3', code: 'CK-V03', strainName: 'Candy Kush', tentName: 'Estufa B', notes: 'Clone da CK-M01. Estrutura compacta.' },
  { name: 'Candy Kush #4', code: 'CK-V04', strainName: 'Candy Kush', tentName: 'Estufa B', notes: 'Clone da CK-M01. Mais lenta que as irmãs.' },
  
  // Estufa C - Flora (3 plantas 24K Gold)
  { name: '24K Gold #2', code: '24K-F02', strainName: '24K Gold', tentName: 'Estufa C', notes: 'Floração semana 5. Boa formação de buds.' },
  { name: '24K Gold #3', code: '24K-F03', strainName: '24K Gold', tentName: 'Estufa C', notes: 'Floração semana 5. Mais alta que as irmãs, precisou de LST.' },
  { name: '24K Gold #4', code: '24K-F04', strainName: '24K Gold', tentName: 'Estufa C', notes: 'Floração semana 5. Fenótipo mais roxo.' },
];

for (const p of plantsData) {
  await conn.execute(
    'INSERT INTO plants (name, code, strainId, currentTentId, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [p.name, p.code, strainMap[p.strainName], tentMap[p.tentName], 'ACTIVE', p.notes]
  );
}

const [plantRows] = await conn.execute('SELECT id, name, currentTentId FROM plants ORDER BY id');
const plantMap = {};
for (const r of plantRows) {
  plantMap[r.name] = { id: r.id, tentId: r.currentTentId };
}
console.log('  ✓ 8 plantas criadas');

// ============================================================
// 6. REGISTROS DIÁRIOS (12-18/fev, AM e PM) para Estufas B e C
// ============================================================
console.log('📊 Criando registros diários (12-18/fev)...');

let dailyCount = 0;
for (let day = 12; day <= 18; day++) {
  const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T12:00:00Z`);
  
  for (const turn of ['AM', 'PM']) {
    // Estufa B (Vega) - temp 24-28, RH 55-70, PPFD 400-600, pH 5.8-6.2, EC 1.0-1.4
    const bTemp = turn === 'AM' ? rand(24, 26) : rand(26, 28);
    const bRh = turn === 'AM' ? rand(60, 70) : rand(55, 65);
    const bPpfd = turn === 'AM' ? randInt(400, 500) : randInt(500, 600);
    
    await conn.execute(
      'INSERT INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd, ph, ec, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tentMap['Estufa B'], mysqlDate(logDate), turn, bTemp, bRh, bPpfd, rand(5.8, 6.1), rand(1.0, 1.3, 2), 
       day === 15 && turn === 'AM' ? 'Umidade um pouco alta hoje, aumentei ventilação' : null]
    );
    
    // Estufa C (Flora) - temp 22-26, RH 40-55, PPFD 600-900, pH 6.0-6.3, EC 1.4-1.8
    const cTemp = turn === 'AM' ? rand(22, 24) : rand(24, 26);
    const cRh = turn === 'AM' ? rand(45, 55) : rand(40, 50);
    const cPpfd = turn === 'AM' ? randInt(600, 750) : randInt(750, 900);
    
    await conn.execute(
      'INSERT INTO dailyLogs (tentId, logDate, turn, tempC, rhPct, ppfd, ph, ec, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tentMap['Estufa C'], mysqlDate(logDate), turn, cTemp, cRh, cPpfd, rand(6.0, 6.3), rand(1.4, 1.7, 2),
       day === 17 && turn === 'PM' ? 'Temperatura subiu um pouco, abri a estufa por 10min' : null]
    );
    
    dailyCount += 2;
  }
}
console.log(`  ✓ ${dailyCount} registros diários criados`);

// ============================================================
// 7. REGISTROS DE SAÚDE (1 semana para todas as plantas)
// ============================================================
console.log('💚 Criando registros de saúde...');

let healthCount = 0;

// Plantas Estufa A (manutenção) - geralmente saudáveis
for (const plantName of ['24K Gold #1', 'Candy Kush #1']) {
  const plant = plantMap[plantName];
  
  // 3 registros na semana
  const healthDays = [12, 15, 18];
  for (const day of healthDays) {
    const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T10:00:00Z`);
    const status = day === 15 ? 'STRESSED' : 'HEALTHY';
    const symptoms = day === 15 ? 'Leve amarelamento nas folhas inferiores' : null;
    const treatment = day === 15 ? 'Ajuste de pH da solução nutritiva' : null;
    const notes = day === 12 ? 'Planta mãe em bom estado geral' : 
                  day === 15 ? 'Monitorar resposta ao ajuste de pH' :
                  'Recuperou bem, folhas novas verdes e saudáveis';
    
    await conn.execute(
      'INSERT INTO plantHealthLogs (plantId, logDate, healthStatus, symptoms, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [plant.id, mysqlDate(logDate), status, symptoms, treatment, notes]
    );
    healthCount++;
  }
}

// Plantas Estufa B (vega) - crescimento ativo
for (const plantName of ['Candy Kush #2', 'Candy Kush #3', 'Candy Kush #4']) {
  const plant = plantMap[plantName];
  
  const healthDays = [12, 14, 16, 18];
  for (const day of healthDays) {
    const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T10:00:00Z`);
    
    let status, symptoms, treatment, notes;
    
    if (plantName === 'Candy Kush #4' && day === 14) {
      status = 'STRESSED';
      symptoms = 'Crescimento mais lento, folhas ligeiramente caídas';
      treatment = 'Aumentar frequência de rega, verificar raízes';
      notes = 'Pode ser excesso de compactação no substrato';
    } else if (plantName === 'Candy Kush #4' && day === 16) {
      status = 'RECOVERING';
      symptoms = 'Folhas recuperando turgidez';
      treatment = 'Mantendo rega mais frequente';
      notes = 'Respondendo bem ao ajuste de rega';
    } else {
      status = 'HEALTHY';
      symptoms = null;
      treatment = null;
      notes = day === 12 ? 'Crescimento vigoroso, internódios curtos' :
              day === 14 ? 'Bom desenvolvimento lateral' :
              day === 16 ? 'Folhagem densa e verde escuro' :
              'Pronta para mais uma semana de vega';
    }
    
    await conn.execute(
      'INSERT INTO plantHealthLogs (plantId, logDate, healthStatus, symptoms, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [plant.id, mysqlDate(logDate), status, symptoms, treatment, notes]
    );
    healthCount++;
  }
}

// Plantas Estufa C (flora) - formação de buds
for (const plantName of ['24K Gold #2', '24K Gold #3', '24K Gold #4']) {
  const plant = plantMap[plantName];
  
  const healthDays = [12, 14, 16, 18];
  for (const day of healthDays) {
    const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T10:00:00Z`);
    
    let status, symptoms, treatment, notes;
    
    if (plantName === '24K Gold #3' && day === 16) {
      status = 'STRESSED';
      symptoms = 'Pontas das folhas queimadas (tip burn)';
      treatment = 'Reduzir EC em 0.2, flush leve com água pH 6.0';
      notes = 'Possível excesso de nutrientes, reduzir dosagem';
    } else if (plantName === '24K Gold #3' && day === 18) {
      status = 'RECOVERING';
      symptoms = 'Tip burn estabilizado, sem progressão';
      treatment = 'Mantendo EC reduzido';
      notes = 'Buds continuam engordando normalmente';
    } else {
      status = 'HEALTHY';
      symptoms = null;
      treatment = null;
      notes = day === 12 ? 'Buds começando a engordar, boa produção de resina' :
              day === 14 ? 'Tricomas visíveis a olho nu, aroma intensificando' :
              day === 16 ? 'Desenvolvimento excelente dos buds' :
              'Semana 5 de flora, buds densos e resinosos';
    }
    
    await conn.execute(
      'INSERT INTO plantHealthLogs (plantId, logDate, healthStatus, symptoms, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [plant.id, mysqlDate(logDate), status, symptoms, treatment, notes]
    );
    healthCount++;
  }
}

console.log(`  ✓ ${healthCount} registros de saúde criados`);

// ============================================================
// 8. REGISTROS DE TRICOMAS (plantas em floração - Estufa C)
// ============================================================
console.log('🔬 Criando registros de tricomas...');

let trichomeCount = 0;
for (const plantName of ['24K Gold #2', '24K Gold #3', '24K Gold #4']) {
  const plant = plantMap[plantName];
  
  // 2 registros na semana (flora semana 5 - maioria clear/cloudy)
  const trichDays = [13, 17];
  for (const day of trichDays) {
    const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T14:00:00Z`);
    
    // Semana 5: ~50-60% clear, ~35-45% cloudy, ~5% amber
    const clear = day === 13 ? randInt(55, 65) : randInt(45, 55);
    const amber = day === 13 ? randInt(2, 5) : randInt(5, 8);
    const cloudy = 100 - clear - amber;
    
    const notes = day === 13 ? 'Maioria transparentes, começando a ficar leitosos' :
                               'Transição acelerando, mais leitosos que na última verificação';
    
    await conn.execute(
      'INSERT INTO plantTrichomeLogs (plantId, logDate, clearPercent, cloudyPercent, amberPercent, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [plant.id, mysqlDate(logDate), clear, cloudy, amber, notes]
    );
    trichomeCount++;
  }
}
console.log(`  ✓ ${trichomeCount} registros de tricomas criados`);

// ============================================================
// 9. REGISTROS DE LST (plantas em vega - Estufa B)
// ============================================================
console.log('🌀 Criando registros de LST...');

let lstCount = 0;
const lstData = [
  { plantName: 'Candy Kush #2', day: 13, technique: 'LST', notes: 'Amarração dos ramos laterais para abrir a copa', response: 'Ramos responderam bem em 24h, já apontando para cima' },
  { plantName: 'Candy Kush #2', day: 16, technique: 'Defoliation', notes: 'Remoção de folhas grandes que bloqueavam luz nos sites inferiores', response: 'Boa penetração de luz nos sites internos' },
  { plantName: 'Candy Kush #3', day: 13, technique: 'Topping', notes: 'Corte do ápice principal acima do 5º nó', response: 'Dois novos brotos apareceram em 3 dias' },
  { plantName: 'Candy Kush #3', day: 17, technique: 'LST', notes: 'Amarração dos dois novos líderes para os lados', response: 'Estrutura em Y formando bem' },
  { plantName: 'Candy Kush #4', day: 14, technique: 'LST', notes: 'Amarração leve do caule principal', response: 'Resposta mais lenta que as irmãs, monitorar' },
];

for (const lst of lstData) {
  const plant = plantMap[lst.plantName];
  const logDate = new Date(`2026-02-${lst.day.toString().padStart(2, '0')}T11:00:00Z`);
  
  await conn.execute(
    'INSERT INTO plantLSTLogs (plantId, logDate, technique, notes, response) VALUES (?, ?, ?, ?, ?)',
    [plant.id, mysqlDate(logDate), lst.technique, lst.notes, lst.response]
  );
  lstCount++;
}
console.log(`  ✓ ${lstCount} registros de LST criados`);

// ============================================================
// 10. OBSERVAÇÕES
// ============================================================
console.log('📝 Criando observações...');

let obsCount = 0;
const observations = [
  { plantName: '24K Gold #1', day: 13, content: 'Planta mãe com boa estrutura. 4 ramos principais bem desenvolvidos, ideal para retirar clones na próxima semana.' },
  { plantName: 'Candy Kush #2', day: 14, content: 'Crescimento explosivo após LST. Internódios curtos e folhagem densa. Melhor fenótipo do lote.' },
  { plantName: 'Candy Kush #4', day: 15, content: 'Crescimento mais lento comparado às irmãs. Verificar se o vaso está com boa drenagem.' },
  { plantName: '24K Gold #2', day: 13, content: 'Buds começando a tomar forma. Aroma doce e terroso já perceptível. Resina visível nos sugar leaves.' },
  { plantName: '24K Gold #3', day: 15, content: 'A mais alta das 3. Precisou de suporte extra nos ramos laterais pelo peso dos buds.' },
  { plantName: '24K Gold #4', day: 16, content: 'Fenótipo mais roxo aparecendo nas folhas. Coloração linda, pode ser genética ou resposta à temperatura noturna.' },
  { plantName: 'Candy Kush #3', day: 17, content: 'Topping funcionou perfeitamente. Dois líderes com crescimento simétrico. Boa candidata para ScrOG na próxima rodada.' },
  { plantName: '24K Gold #2', day: 18, content: 'Semana 5 de flora. Buds densos e cobertos de tricomas. Estimativa de mais 3 semanas até colheita.' },
];

for (const obs of observations) {
  const plant = plantMap[obs.plantName];
  const logDate = new Date(`2026-02-${obs.day.toString().padStart(2, '0')}T16:00:00Z`);
  
  await conn.execute(
    'INSERT INTO plantObservations (plantId, observationDate, content) VALUES (?, ?, ?)',
    [plant.id, mysqlDate(logDate), obs.content]
  );
  obsCount++;
}
console.log(`  ✓ ${obsCount} observações criadas`);

// ============================================================
// 11. WEEKLY TARGETS (para 24K Gold e Candy Kush)
// ============================================================
console.log('🎯 Criando weekly targets...');

let targetCount = 0;

// Candy Kush - Vega targets (semanas 1-4)
for (let week = 1; week <= 4; week++) {
  const ecMin = (0.8 + (week - 1) * 0.15).toFixed(1);
  const ecMax = (1.2 + (week - 1) * 0.15).toFixed(1);
  
  await conn.execute(
    `INSERT INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
     VALUES (?, 'VEGA', ?, 22, 28, 55, 70, 300, 600, '18/6', 5.8, 6.2, ?, ?)`,
    [strainMap['Candy Kush'], week, ecMin, ecMax]
  );
  targetCount++;
}

// Candy Kush - Flora targets (semanas 1-9)
for (let week = 1; week <= 9; week++) {
  const ecMin = (1.2 + Math.min(week - 1, 5) * 0.1).toFixed(1);
  const ecMax = (1.6 + Math.min(week - 1, 5) * 0.1).toFixed(1);
  const rhMin = week <= 4 ? 45 : 35;
  const rhMax = week <= 4 ? 55 : 50;
  
  await conn.execute(
    `INSERT INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
     VALUES (?, 'FLORA', ?, 20, 26, ?, ?, 600, 900, '12/12', 6.0, 6.3, ?, ?)`,
    [strainMap['Candy Kush'], week, rhMin, rhMax, ecMin, ecMax]
  );
  targetCount++;
}

// 24K Gold - Vega targets (semanas 1-4)
for (let week = 1; week <= 4; week++) {
  const ecMin = (0.8 + (week - 1) * 0.15).toFixed(1);
  const ecMax = (1.2 + (week - 1) * 0.15).toFixed(1);
  
  await conn.execute(
    `INSERT INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
     VALUES (?, 'VEGA', ?, 22, 28, 55, 70, 300, 600, '18/6', 5.8, 6.2, ?, ?)`,
    [strainMap['24K Gold'], week, ecMin, ecMax]
  );
  targetCount++;
}

// 24K Gold - Flora targets (semanas 1-8)
for (let week = 1; week <= 8; week++) {
  const ecMin = (1.2 + Math.min(week - 1, 5) * 0.1).toFixed(1);
  const ecMax = (1.6 + Math.min(week - 1, 5) * 0.1).toFixed(1);
  const rhMin = week <= 4 ? 45 : 35;
  const rhMax = week <= 4 ? 55 : 50;
  
  await conn.execute(
    `INSERT INTO weeklyTargets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax, photoperiod, phMin, phMax, ecMin, ecMax)
     VALUES (?, 'FLORA', ?, 20, 26, ?, ?, 600, 900, '12/12', 6.0, 6.3, ?, ?)`,
    [strainMap['24K Gold'], week, rhMin, rhMax, ecMin, ecMax]
  );
  targetCount++;
}

console.log(`  ✓ ${targetCount} weekly targets criados`);

// ============================================================
// 12. PREDEFINIÇÕES DE FERTILIZAÇÃO (vasos 5L)
// ============================================================
console.log('🧪 Criando predefinições de fertilização...');

const fertPresets = [
  {
    name: 'Vega Semana 2-3 (5L)',
    waterVolume: 5.0,
    targetEC: 1.2,
    phase: 'VEGA',
    weekNumber: 3,
    irrigationsPerWeek: 3,
    calculationMode: 'per-irrigation',
  },
  {
    name: 'Flora Semana 3-4 (5L)',
    waterVolume: 5.0,
    targetEC: 1.5,
    phase: 'FLORA',
    weekNumber: 4,
    irrigationsPerWeek: 4,
    calculationMode: 'per-irrigation',
  },
  {
    name: 'Flora Semana 5-6 (5L)',
    waterVolume: 5.0,
    targetEC: 1.7,
    phase: 'FLORA',
    weekNumber: 5,
    irrigationsPerWeek: 4,
    calculationMode: 'per-irrigation',
  },
  {
    name: 'Flora Semana 7-8 (5L)',
    waterVolume: 5.0,
    targetEC: 1.8,
    phase: 'FLORA',
    weekNumber: 7,
    irrigationsPerWeek: 5,
    calculationMode: 'per-irrigation',
  },
  {
    name: 'Flush Pré-Colheita (5L)',
    waterVolume: 5.0,
    targetEC: 0.3,
    phase: 'FLORA',
    weekNumber: 8,
    irrigationsPerWeek: 5,
    calculationMode: 'per-irrigation',
  },
];

for (const fp of fertPresets) {
  await conn.execute(
    'INSERT INTO fertilizationPresets (userId, name, waterVolume, targetEC, phase, weekNumber, irrigationsPerWeek, calculationMode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [1, fp.name, fp.waterVolume, fp.targetEC, fp.phase, fp.weekNumber, fp.irrigationsPerWeek, fp.calculationMode]
  );
}
console.log(`  ✓ ${fertPresets.length} predefinições de fertilização criadas`);

// ============================================================
// 13. PREDEFINIÇÕES DE REGA (vasos 5L)
// ============================================================
console.log('💧 Criando predefinições de rega...');

const waterPresets = [
  { name: 'Vega 3 plantas (5L)', plantCount: 3, potSize: 5.0, targetRunoff: 20, phase: 'VEGA', weekNumber: 3 },
  { name: 'Flora 3 plantas (5L)', plantCount: 3, potSize: 5.0, targetRunoff: 20, phase: 'FLORA', weekNumber: 5 },
  { name: 'Flush 3 plantas (5L)', plantCount: 3, potSize: 5.0, targetRunoff: 30, phase: 'FLORA', weekNumber: 8 },
];

for (const wp of waterPresets) {
  await conn.execute(
    'INSERT INTO wateringPresets (userId, name, plantCount, potSize, targetRunoff, phase, weekNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, wp.name, wp.plantCount, wp.potSize, wp.targetRunoff, wp.phase, wp.weekNumber]
  );
}
console.log(`  ✓ ${waterPresets.length} predefinições de rega criadas`);

// ============================================================
// 14. RECEITAS DE FERTILIZAÇÃO (últimos 3 dias)
// ============================================================
console.log('📋 Criando receitas de fertilização...');

let recipeCount = 0;
for (let day = 16; day <= 18; day++) {
  const logDate = new Date(`2026-02-${day.toString().padStart(2, '0')}T08:00:00Z`);
  
  // Estufa B - Vega
  const vegaProducts = JSON.stringify([
    { name: 'Flora Micro', mlPerL: 1.5, totalMl: 7.5 },
    { name: 'Flora Grow', mlPerL: 2.5, totalMl: 12.5 },
    { name: 'Flora Bloom', mlPerL: 0.5, totalMl: 2.5 },
    { name: 'CalMag', mlPerL: 1.0, totalMl: 5.0 },
  ]);
  
  await conn.execute(
    'INSERT INTO recipes (tentId, logDate, turn, volumeTotalL, ecTarget, phTarget, productsJson, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tentMap['Estufa B'], mysqlDate(logDate), 'AM', 5.0, 1.2, 5.9, vegaProducts,
     day === 16 ? 'Receita padrão vega semana 3' : null]
  );
  recipeCount++;
  
  // Estufa C - Flora
  const floraProducts = JSON.stringify([
    { name: 'Flora Micro', mlPerL: 1.5, totalMl: 7.5 },
    { name: 'Flora Grow', mlPerL: 1.0, totalMl: 5.0 },
    { name: 'Flora Bloom', mlPerL: 3.0, totalMl: 15.0 },
    { name: 'CalMag', mlPerL: 0.5, totalMl: 2.5 },
    { name: 'PK 13/14', mlPerL: 0.5, totalMl: 2.5 },
  ]);
  
  await conn.execute(
    'INSERT INTO recipes (tentId, logDate, turn, volumeTotalL, ecTarget, phTarget, productsJson, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tentMap['Estufa C'], mysqlDate(logDate), 'AM', 5.0, 1.7, 6.1, floraProducts,
     day === 16 ? 'Receita flora semana 5 com PK booster' : null]
  );
  recipeCount++;
}
console.log(`  ✓ ${recipeCount} receitas criadas`);

// ============================================================
// 15. RECIPE TEMPLATES (biblioteca)
// ============================================================
console.log('📚 Criando templates de receitas...');

const recipeTemplatesData = [
  {
    name: 'Vega Leve (Semana 1-2)',
    phase: 'VEGA',
    weekNumber: 1,
    volumeTotalL: 5.0,
    ecTarget: 0.8,
    phTarget: 5.9,
    productsJson: JSON.stringify([
      { name: 'Flora Micro', mlPerL: 1.0 },
      { name: 'Flora Grow', mlPerL: 2.0 },
      { name: 'Flora Bloom', mlPerL: 0.3 },
    ]),
    notes: 'Para início de vega, plantas jovens',
  },
  {
    name: 'Vega Completa (Semana 3-4)',
    phase: 'VEGA',
    weekNumber: 3,
    volumeTotalL: 5.0,
    ecTarget: 1.2,
    phTarget: 5.9,
    productsJson: JSON.stringify([
      { name: 'Flora Micro', mlPerL: 1.5 },
      { name: 'Flora Grow', mlPerL: 2.5 },
      { name: 'Flora Bloom', mlPerL: 0.5 },
      { name: 'CalMag', mlPerL: 1.0 },
    ]),
    notes: 'Para vega avançada, crescimento vigoroso',
  },
  {
    name: 'Flora Início (Semana 1-3)',
    phase: 'FLORA',
    weekNumber: 1,
    volumeTotalL: 5.0,
    ecTarget: 1.4,
    phTarget: 6.0,
    productsJson: JSON.stringify([
      { name: 'Flora Micro', mlPerL: 1.5 },
      { name: 'Flora Grow', mlPerL: 1.5 },
      { name: 'Flora Bloom', mlPerL: 2.0 },
      { name: 'CalMag', mlPerL: 0.5 },
    ]),
    notes: 'Transição para flora, aumentar Bloom gradualmente',
  },
  {
    name: 'Flora Pico (Semana 4-6)',
    phase: 'FLORA',
    weekNumber: 5,
    volumeTotalL: 5.0,
    ecTarget: 1.7,
    phTarget: 6.1,
    productsJson: JSON.stringify([
      { name: 'Flora Micro', mlPerL: 1.5 },
      { name: 'Flora Grow', mlPerL: 1.0 },
      { name: 'Flora Bloom', mlPerL: 3.0 },
      { name: 'CalMag', mlPerL: 0.5 },
      { name: 'PK 13/14', mlPerL: 0.5 },
    ]),
    notes: 'Pico de floração com PK booster',
  },
  {
    name: 'Flora Final (Semana 7-8)',
    phase: 'FLORA',
    weekNumber: 7,
    volumeTotalL: 5.0,
    ecTarget: 1.5,
    phTarget: 6.2,
    productsJson: JSON.stringify([
      { name: 'Flora Micro', mlPerL: 1.0 },
      { name: 'Flora Grow', mlPerL: 0.5 },
      { name: 'Flora Bloom', mlPerL: 2.5 },
      { name: 'PK 13/14', mlPerL: 0.3 },
    ]),
    notes: 'Reduzir nutrientes gradualmente antes do flush',
  },
];

for (const rt of recipeTemplatesData) {
  await conn.execute(
    'INSERT INTO recipeTemplates (name, phase, weekNumber, volumeTotalL, ecTarget, phTarget, productsJson, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [rt.name, rt.phase, rt.weekNumber, rt.volumeTotalL, rt.ecTarget, rt.phTarget, rt.productsJson, rt.notes]
  );
}
console.log(`  ✓ ${recipeTemplatesData.length} templates de receitas criados`);

// ============================================================
// 16. ALERT SETTINGS
// ============================================================
console.log('🔔 Criando configurações de alertas...');

for (const tentName of Object.keys(tentMap)) {
  await conn.execute(
    'INSERT INTO alertSettings (tentId, alertsEnabled, tempEnabled, rhEnabled, ppfdEnabled) VALUES (?, ?, ?, ?, ?)',
    [tentMap[tentName], true, true, true, true]
  );
}
console.log(`  ✓ Alertas configurados para ${Object.keys(tentMap).length} estufas`);

// ============================================================
// 17. TASK TEMPLATES
// ============================================================
console.log('✅ Criando templates de tarefas...');

const taskTemplatesData = [
  // VEGA - Semana 1
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 1, title: 'Verificar pH e EC da água', description: 'Medir pH (5.8-6.0) e EC (0.8-1.0) da solução nutritiva' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 1, title: 'Regar plantas', description: 'Regar com 20% de runoff, verificar drenagem' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 1, title: 'Verificar temperatura e umidade', description: 'Temp: 22-26°C, RH: 60-70%' },
  
  // VEGA - Semana 2
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 2, title: 'Verificar pH e EC da água', description: 'Medir pH (5.8-6.0) e EC (1.0-1.2) da solução nutritiva' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 2, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 2, title: 'Aplicar LST (Low Stress Training)', description: 'Dobrar ramos principais para aumentar exposição à luz' },
  
  // VEGA - Semana 3
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 3, title: 'Verificar pH e EC da água', description: 'Medir pH (5.8-6.0) e EC (1.2-1.4) da solução nutritiva' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 3, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 3, title: 'Continuar LST', description: 'Ajustar amarras e dobrar novos ramos' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 3, title: 'Verificar pragas', description: 'Inspecionar folhas (cima e baixo) para detectar pragas' },
  
  // VEGA - Semana 4
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 4, title: 'Verificar pH e EC da água', description: 'Medir pH (5.8-6.0) e EC (1.4-1.6) da solução nutritiva' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 4, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'VEGA', weekNumber: 4, title: 'Preparar para floração', description: 'Verificar se plantas estão prontas para mudar fotoperíodo' },
  
  // FLORA - Semana 1
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 1, title: 'Mudar fotoperíodo para 12/12', description: 'Ajustar timer para 12h luz / 12h escuro' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 1, title: 'Verificar pH e EC da água', description: 'Medir pH (6.0-6.2) e EC (1.6-1.8) da solução nutritiva' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 1, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  
  // FLORA - Semana 2-3
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 2, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 1.8-2.0' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 2, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 2, title: 'Remover folhas baixas', description: 'Desfoliação leve para melhorar circulação de ar' },
  
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 3, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 2.0-2.2' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 3, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  
  // FLORA - Semana 4-5 (pico de floração)
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 4, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 2.2-2.4' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 4, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 4, title: 'Verificar tricomas', description: 'Inspecionar tricomas com lupa (60x) para monitorar maturação' },
  
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 5, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 2.2-2.4' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 5, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 5, title: 'Verificar tricomas', description: 'Inspecionar tricomas para monitorar maturação' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 5, title: 'Verificar pragas e mofo', description: 'Inspecionar buds para detectar mofo ou pragas' },
  
  // FLORA - Semana 6-7 (reta final)
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 6, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 2.0-2.2' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 6, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 6, title: 'Verificar tricomas diariamente', description: 'Monitorar tricomas para decidir ponto de colheita' },
  
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 7, title: 'Verificar pH e EC', description: 'pH: 6.0-6.2, EC: 1.6-1.8 (reduzir nutrientes)' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 7, title: 'Regar plantas', description: 'Regar com 20% de runoff' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 7, title: 'Verificar tricomas', description: 'Decidir ponto de colheita (70-90% leitosos)' },
  
  // FLORA - Semana 8 (flush)
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 8, title: 'Iniciar flush', description: 'Regar apenas com água pH ajustado (sem nutrientes)' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 8, title: 'Regar com água pura', description: 'Flush com 30% de runoff para limpar sais' },
  { context: 'TENT_BC', phase: 'FLORA', weekNumber: 8, title: 'Preparar para colheita', description: 'Organizar ferramentas e espaço de secagem' },
  
  // MAINTENANCE (Estufa A - plantas-mãe)
  { context: 'TENT_A', phase: 'MAINTENANCE', weekNumber: null, title: 'Regar plantas-mãe', description: 'Regar com EC baixo (1.0-1.2) para manter crescimento vegetativo' },
  { context: 'TENT_A', phase: 'MAINTENANCE', weekNumber: null, title: 'Fazer clones', description: 'Cortar e enraizar clones das plantas-mãe' },
  { context: 'TENT_A', phase: 'MAINTENANCE', weekNumber: null, title: 'Podar plantas-mãe', description: 'Remover crescimento excessivo e manter tamanho controlado' },
];

let taskTemplateCount = 0;
for (const tt of taskTemplatesData) {
  await conn.execute(
    'INSERT INTO taskTemplates (context, phase, weekNumber, title, description) VALUES (?, ?, ?, ?, ?)',
    [tt.context, tt.phase, tt.weekNumber, tt.title, tt.description]
  );
  taskTemplateCount++;
}
console.log(`  ✓ ${taskTemplateCount} templates de tarefas criados`);
  
// ============================================================
// RESUMO FINAL
// ============================================================
console.log('');
console.log('═══════════════════════════════════════════');
console.log('✅ SEED COMPLETO!');
console.log('═══════════════════════════════════════════');
console.log(`  🌱 ${strainsData.length} strains`);
console.log(`  🏠 ${tentsData.length} estufas`);
console.log(`  🔄 2 ciclos ativos`);
console.log(`  🌿 ${Object.keys(plantMap).length} plantas`);
console.log(`  📊 ${dailyCount} registros diários`);
console.log(`  💚 ${healthCount} registros de saúde`);
console.log(`  🔬 ${trichomeCount} registros de tricomas`);
console.log(`  🌀 ${lstCount} registros de LST`);
console.log(`  📝 ${obsCount} observações`);
console.log(`  🎯 ${targetCount} weekly targets`);
console.log(`  🧪 ${fertPresets.length} predefinições de fertilização`);
  console.log(`  💧 ${waterPresets.length} predefinições de rega`);
  console.log(`  📋 ${recipeCount} receitas`);
  console.log(`  📚 ${recipeTemplatesData.length} templates de receitas`);
  console.log(`  ✅ ${taskTemplateCount} templates de tarefas`);
  console.log('═══════════════════════════════════════════');

await conn.end();
process.exit(0);
