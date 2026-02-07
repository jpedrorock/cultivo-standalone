#!/usr/bin/env node

/**
 * Script de Seed Data para App Cultivo
 * Popula o banco de dados com estufas e strains de exemplo
 * 
 * Uso: node seed-data.mjs
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no arquivo .env');
  process.exit(1);
}

// Parse DATABASE_URL (formato: mysql://user:password@host:port/database)
const urlMatch = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ DATABASE_URL inválida. Formato esperado: mysql://user:password@host:port/database');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

async function seedDatabase() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });
    
    console.log('✅ Conectado com sucesso!\n');

    // ============================================
    // 1. POPULAR ESTUFAS
    // ============================================
    console.log('🏗️  Populando estufas...');
    
    const tents = [
      {
        name: 'Estufa A',
        tentType: 'A',
        width: 45,
        depth: 75,
        height: 90,
        volume: ((45 * 75 * 90) / 1000).toFixed(3),
        powerW: 100,
      },
      {
        name: 'Estufa B',
        tentType: 'B',
        width: 60,
        depth: 60,
        height: 120,
        volume: ((60 * 60 * 120) / 1000).toFixed(3),
        powerW: 300,
      },
      {
        name: 'Estufa C',
        tentType: 'C',
        width: 60,
        depth: 120,
        height: 150,
        volume: ((60 * 120 * 150) / 1000).toFixed(3),
        powerW: 600,
      },
    ];

    for (const tent of tents) {
      const [existing] = await connection.query(
        'SELECT id FROM tents WHERE name = ?',
        [tent.name]
      );
      
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO tents (name, tentType, width, depth, height, volume, powerW) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [tent.name, tent.tentType, tent.width, tent.depth, tent.height, tent.volume, tent.powerW]
        );
        console.log(`  ✓ ${tent.name} criada (${tent.width}×${tent.depth}×${tent.height}cm, ${tent.volume}L)`);
      } else {
        console.log(`  ⊙ ${tent.name} já existe`);
      }
    }

    // ============================================
    // 2. POPULAR STRAINS
    // ============================================
    console.log('\n🌿 Populando strains...');
    
    const strains = [
      {
        name: 'OG Kush',
        description: 'Híbrida clássica com alto THC e efeito relaxante',
        vegaWeeks: 6,
        floraWeeks: 8,
      },
      {
        name: 'Blue Dream',
        description: 'Sativa dominante, energética e criativa',
        vegaWeeks: 6,
        floraWeeks: 9,
      },
      {
        name: 'Northern Lights',
        description: 'Indica pura, ideal para relaxamento profundo',
        vegaWeeks: 5,
        floraWeeks: 7,
      },
      {
        name: 'White Widow',
        description: 'Híbrida balanceada com alto rendimento',
        vegaWeeks: 6,
        floraWeeks: 8,
      },
      {
        name: 'Girl Scout Cookies',
        description: 'Híbrida potente com sabor doce',
        vegaWeeks: 5,
        floraWeeks: 9,
      },
    ];

    for (const strain of strains) {
      const [existing] = await connection.query(
        'SELECT id FROM strains WHERE name = ?',
        [strain.name]
      );
      
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO strains (name, description, vegaWeeks, floraWeeks) VALUES (?, ?, ?, ?)',
          [strain.name, strain.description, strain.vegaWeeks, strain.floraWeeks]
        );
        console.log(`  ✓ ${strain.name} (${strain.vegaWeeks}w vega, ${strain.floraWeeks}w flora)`);
      } else {
        console.log(`  ⊙ ${strain.name} já existe`);
      }
    }

    // ============================================
    // 3. POPULAR TARGETS PARA OG KUSH
    // ============================================
    console.log('\n📊 Populando targets para OG Kush...');
    
    const [ogKush] = await connection.query('SELECT id FROM strains WHERE name = "OG Kush"');
    if (ogKush.length > 0) {
      const strainId = ogKush[0].id;
      
      const targets = [
        // VEGA (6 semanas)
        { strainId, phase: 'VEGA', weekNumber: 1, ppfdMin: 200, ppfdMax: 400, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 60, rhMax: 70, phMin: 5.8, phMax: 6.2, ecMin: 0.8, ecMax: 1.2 },
        { strainId, phase: 'VEGA', weekNumber: 2, ppfdMin: 300, ppfdMax: 500, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 60, rhMax: 70, phMin: 5.8, phMax: 6.2, ecMin: 1.0, ecMax: 1.4 },
        { strainId, phase: 'VEGA', weekNumber: 3, ppfdMin: 400, ppfdMax: 600, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 55, rhMax: 65, phMin: 5.8, phMax: 6.2, ecMin: 1.2, ecMax: 1.6 },
        { strainId, phase: 'VEGA', weekNumber: 4, ppfdMin: 500, ppfdMax: 700, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 55, rhMax: 65, phMin: 5.8, phMax: 6.2, ecMin: 1.4, ecMax: 1.8 },
        { strainId, phase: 'VEGA', weekNumber: 5, ppfdMin: 600, ppfdMax: 800, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 50, rhMax: 60, phMin: 5.8, phMax: 6.2, ecMin: 1.6, ecMax: 2.0 },
        { strainId, phase: 'VEGA', weekNumber: 6, ppfdMin: 700, ppfdMax: 900, photoperiod: 18, tempMin: 22, tempMax: 26, rhMin: 50, rhMax: 60, phMin: 5.8, phMax: 6.2, ecMin: 1.8, ecMax: 2.2 },
        
        // FLORA (8 semanas)
        { strainId, phase: 'FLORA', weekNumber: 1, ppfdMin: 600, ppfdMax: 800, photoperiod: 12, tempMin: 20, tempMax: 24, rhMin: 50, rhMax: 60, phMin: 6.0, phMax: 6.5, ecMin: 1.8, ecMax: 2.2 },
        { strainId, phase: 'FLORA', weekNumber: 2, ppfdMin: 700, ppfdMax: 900, photoperiod: 12, tempMin: 20, tempMax: 24, rhMin: 45, rhMax: 55, phMin: 6.0, phMax: 6.5, ecMin: 2.0, ecMax: 2.4 },
        { strainId, phase: 'FLORA', weekNumber: 3, ppfdMin: 800, ppfdMax: 1000, photoperiod: 12, tempMin: 20, tempMax: 24, rhMin: 45, rhMax: 55, phMin: 6.0, phMax: 6.5, ecMin: 2.2, ecMax: 2.6 },
        { strainId, phase: 'FLORA', weekNumber: 4, ppfdMin: 900, ppfdMax: 1100, photoperiod: 12, tempMin: 20, tempMax: 24, rhMin: 40, rhMax: 50, phMin: 6.0, phMax: 6.5, ecMin: 2.2, ecMax: 2.6 },
        { strainId, phase: 'FLORA', weekNumber: 5, ppfdMin: 900, ppfdMax: 1100, photoperiod: 12, tempMin: 18, tempMax: 22, rhMin: 40, rhMax: 50, phMin: 6.0, phMax: 6.5, ecMin: 2.0, ecMax: 2.4 },
        { strainId, phase: 'FLORA', weekNumber: 6, ppfdMin: 800, ppfdMax: 1000, photoperiod: 12, tempMin: 18, tempMax: 22, rhMin: 35, rhMax: 45, phMin: 6.0, phMax: 6.5, ecMin: 1.8, ecMax: 2.2 },
        { strainId, phase: 'FLORA', weekNumber: 7, ppfdMin: 700, ppfdMax: 900, photoperiod: 12, tempMin: 18, tempMax: 22, rhMin: 35, rhMax: 45, phMin: 6.0, phMax: 6.5, ecMin: 1.4, ecMax: 1.8 },
        { strainId, phase: 'FLORA', weekNumber: 8, ppfdMin: 600, ppfdMax: 800, photoperiod: 12, tempMin: 18, tempMax: 22, rhMin: 30, rhMax: 40, phMin: 6.0, phMax: 6.5, ecMin: 1.0, ecMax: 1.4 },
      ];

      for (const target of targets) {
        const [existing] = await connection.query(
          'SELECT id FROM weeklyTargets WHERE strainId = ? AND phase = ? AND weekNumber = ?',
          [target.strainId, target.phase, target.weekNumber]
        );
        
        if (existing.length === 0) {
          await connection.query(
            `INSERT INTO weeklyTargets 
            (strainId, phase, weekNumber, ppfdMin, ppfdMax, photoperiod, tempMin, tempMax, rhMin, rhMax, phMin, phMax, ecMin, ecMax) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              target.strainId, target.phase, target.weekNumber,
              target.ppfdMin, target.ppfdMax, target.photoperiod,
              target.tempMin, target.tempMax, target.rhMin, target.rhMax,
              target.phMin, target.phMax, target.ecMin, target.ecMax
            ]
          );
          console.log(`  ✓ ${target.phase} Semana ${target.weekNumber}`);
        }
      }
    }

    console.log('\n✅ Seed data populado com sucesso!');
    console.log('\n📝 Resumo:');
    console.log('  • 3 estufas (A, B, C)');
    console.log('  • 5 strains (OG Kush, Blue Dream, Northern Lights, White Widow, GSC)');
    console.log('  • 14 targets para OG Kush (6 vega + 8 flora)');
    console.log('\n🚀 Você pode agora iniciar o aplicativo e criar ciclos!');
    
  } catch (error) {
    console.error('\n❌ Erro ao popular banco de dados:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
