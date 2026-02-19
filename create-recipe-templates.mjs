import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const recipeTemplates = [
  // CLONING - Semana única
  {
    name: 'Clonagem Básica',
    phase: 'CLONING',
    weekNumber: null,
    volumeTotalL: 10,
    ecTarget: 0.8,
    phTarget: 5.8,
    products: [
      { name: 'Enraizador (Clone Solution)', amountMl: 20, npk: '1-2-1' },
      { name: 'CalMag', amountMl: 10, ca: 3, mg: 1 },
    ],
    notes: 'Receita leve para promover enraizamento sem estressar clones. Manter EC baixo (0.6-1.0 mS/cm).',
  },
  
  // VEGA - Semanas 1-4
  {
    name: 'Vega Semana 1-2 (Inicial)',
    phase: 'VEGA',
    weekNumber: 1,
    volumeTotalL: 10,
    ecTarget: 1.2,
    phTarget: 6.0,
    products: [
      { name: 'Grow (Vega)', amountMl: 30, npk: '7-4-10' },
      { name: 'CalMag', amountMl: 20, ca: 3, mg: 1 },
      { name: 'Micronutrientes', amountMl: 10, fe: 0.5 },
    ],
    notes: 'Fase inicial vegetativa - EC moderado para adaptação.',
  },
  {
    name: 'Vega Semana 3-4 (Crescimento)',
    phase: 'VEGA',
    weekNumber: 3,
    volumeTotalL: 10,
    ecTarget: 1.6,
    phTarget: 6.0,
    products: [
      { name: 'Grow (Vega)', amountMl: 50, npk: '7-4-10' },
      { name: 'CalMag', amountMl: 20, ca: 3, mg: 1 },
      { name: 'Micronutrientes', amountMl: 10, fe: 0.5 },
    ],
    notes: 'Crescimento vegetativo intenso - aumentar EC gradualmente.',
  },
  
  // FLORA - Semanas 1-8
  {
    name: 'Flora Semana 1-2 (Transição)',
    phase: 'FLORA',
    weekNumber: 1,
    volumeTotalL: 10,
    ecTarget: 1.4,
    phTarget: 6.0,
    products: [
      { name: 'Bloom (Flora)', amountMl: 40, npk: '2-8-12' },
      { name: 'CalMag', amountMl: 20, ca: 3, mg: 1 },
    ],
    notes: 'Transição para floração - reduzir N, aumentar P-K.',
  },
  {
    name: 'Flora Semana 3-5 (Formação de Flores)',
    phase: 'FLORA',
    weekNumber: 3,
    volumeTotalL: 10,
    ecTarget: 1.8,
    phTarget: 6.0,
    products: [
      { name: 'Bloom (Flora)', amountMl: 60, npk: '2-8-12' },
      { name: 'PK Booster', amountMl: 20, npk: '0-13-14' },
      { name: 'CalMag', amountMl: 20, ca: 3, mg: 1 },
    ],
    notes: 'Pico de floração - EC máximo para desenvolvimento de flores.',
  },
  {
    name: 'Flora Semana 6-7 (Engorda)',
    phase: 'FLORA',
    weekNumber: 6,
    volumeTotalL: 10,
    ecTarget: 1.6,
    phTarget: 6.0,
    products: [
      { name: 'Bloom (Flora)', amountMl: 50, npk: '2-8-12' },
      { name: 'PK Booster', amountMl: 15, npk: '0-13-14' },
      { name: 'CalMag', amountMl: 15, ca: 3, mg: 1 },
    ],
    notes: 'Engorda final - reduzir EC gradualmente.',
  },
  {
    name: 'Flora Semana 8+ (Flush)',
    phase: 'FLORA',
    weekNumber: 8,
    volumeTotalL: 10,
    ecTarget: 0.0,
    phTarget: 6.0,
    products: [],
    notes: 'Flush final - apenas água pH ajustado para remover nutrientes residuais.',
  },
  
  // MAINTENANCE
  {
    name: 'Manutenção Plantas Mãe',
    phase: 'MAINTENANCE',
    weekNumber: null,
    volumeTotalL: 10,
    ecTarget: 1.0,
    phTarget: 6.0,
    products: [
      { name: 'Manutenção Básica', amountMl: 20, npk: '5-5-5' },
      { name: 'CalMag', amountMl: 10, ca: 3, mg: 1 },
    ],
    notes: 'NPK balanceado para manter plantas mãe saudáveis sem crescimento excessivo.',
  },
  
  // DRYING
  {
    name: 'Secagem (Flush)',
    phase: 'DRYING',
    weekNumber: null,
    volumeTotalL: 10,
    ecTarget: 0.0,
    phTarget: 6.5,
    products: [],
    notes: 'Apenas água para flush final antes da colheita. Não aplicar nutrientes.',
  },
];

async function populateRecipeTemplates() {
  const connection = await mysql.createConnection(connectionString);
  
  try {
    console.log('[Migration] Populando recipeTemplates com receitas pré-configuradas...');
    
    for (const recipe of recipeTemplates) {
      await connection.execute(
        `INSERT INTO recipeTemplates 
        (name, phase, weekNumber, volumeTotalL, ecTarget, phTarget, productsJson, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.name,
          recipe.phase,
          recipe.weekNumber,
          recipe.volumeTotalL,
          recipe.ecTarget,
          recipe.phTarget,
          JSON.stringify(recipe.products),
          recipe.notes,
        ]
      );
      
      console.log(`✅ Criado: ${recipe.name} (${recipe.phase}${recipe.weekNumber ? ` - Semana ${recipe.weekNumber}` : ''})`);
    }
    
    console.log(`\n✅ ${recipeTemplates.length} templates de receitas criados com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao popular recipeTemplates:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

populateRecipeTemplates().catch(console.error);
