import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function createDryingTaskTemplates() {
  const connection = await mysql.createConnection(connectionString);
  
  try {
    console.log('[Migration] Criando templates de tarefas de DRYING...');
    
    const dryingTasks = [
      {
        title: 'Controle de Ambiente',
        description: 'Monitorar temperatura (18-21°C) e umidade (45-55% RH). Registrar leituras 2x ao dia.',
        phase: 'DRYING',
        context: 'TENT_BC',
        weekNumber: null,
      },
      {
        title: 'Inspeção de Mofo',
        description: 'Verificar visualmente toda a colheita em busca de sinais de mofo, fungos ou bactérias. Remover material comprometido imediatamente.',
        phase: 'DRYING',
        context: 'TENT_BC',
        weekNumber: null,
      },
      {
        title: 'Teste de Cura (Snap Test)',
        description: 'Testar galhos pequenos: devem quebrar com som de "snap" ao invés de dobrar. Indica ponto ideal de secagem (10-14 dias).',
        phase: 'DRYING',
        context: 'TENT_BC',
        weekNumber: null,
      },
      {
        title: 'Rotação de Material',
        description: 'Girar e reposicionar material pendurado para garantir secagem uniforme. Verificar áreas com pouca circulação de ar.',
        phase: 'DRYING',
        context: 'TENT_BC',
        weekNumber: null,
      },
      {
        title: 'Preparação para Armazenamento',
        description: 'Após snap test positivo: fazer trimming final, remover folhas secas, preparar para cura em potes. Verificar peso final.',
        phase: 'DRYING',
        context: 'TENT_BC',
        weekNumber: null,
      },
    ];
    
    for (const task of dryingTasks) {
      await connection.execute(
        `INSERT INTO taskTemplates (title, description, phase, context, weekNumber)
         VALUES (?, ?, ?, ?, ?)`,
        [task.title, task.description, task.phase, task.context, task.weekNumber]
      );
      console.log(`✅ Template criado: ${task.title}`);
    }
    
    console.log(`\n✅ ${dryingTasks.length} templates de tarefas de DRYING criados com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao criar templates:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createDryingTaskTemplates().catch(console.error);
