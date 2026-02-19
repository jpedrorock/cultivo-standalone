import cron from 'node-cron';
import { checkAlertsForTent } from '../db';
import { getAllTents } from '../db';

/**
 * Verifica alertas para todas as estufas ativas
 * Retorna número de estufas verificadas e total de novos alertas gerados
 */
export async function checkAllTentsAlerts(): Promise<{
  tentsChecked: number;
  totalNewAlerts: number;
  results: Array<{ tentId: number; tentName: string; alertsGenerated: number }>;
}> {
  console.log('[AlertsChecker] Iniciando verificação automática de alertas...');
  
  try {
    // Busca todas as estufas
    const tents = await getAllTents();
    
    const results: Array<{ tentId: number; tentName: string; alertsGenerated: number }> = [];
    let totalNewAlerts = 0;
    
    // Verifica alertas para cada estufa
    for (const tent of tents) {
      try {
        const result = await checkAlertsForTent(tent.id);
        
        results.push({
          tentId: tent.id,
          tentName: tent.name,
          alertsGenerated: result.alertsGenerated,
        });
        
        totalNewAlerts += result.alertsGenerated;
        
        if (result.alertsGenerated > 0) {
          console.log(`[AlertsChecker] Estufa "${tent.name}": ${result.alertsGenerated} novos alertas gerados`);
        }
      } catch (error) {
        console.error(`[AlertsChecker] Erro ao verificar estufa "${tent.name}":`, error);
      }
    }
    
    console.log(`[AlertsChecker] Verificação concluída: ${tents.length} estufas verificadas, ${totalNewAlerts} novos alertas gerados`);
    
    return {
      tentsChecked: tents.length,
      totalNewAlerts,
      results,
    };
  } catch (error) {
    console.error('[AlertsChecker] Erro ao verificar alertas:', error);
    throw error;
  }
}

/**
 * Inicia o cron job de verificação automática de alertas
 * Executa a cada 1 hora (no minuto 0)
 */
export function startAlertsCheckerCron() {
  // Executa a cada 1 hora (no minuto 0)
  // Formato: "minuto hora dia mês dia-da-semana"
  // "0 * * * *" = minuto 0 de cada hora
  const cronSchedule = '0 * * * *';
  
  const task = cron.schedule(cronSchedule, async () => {
    try {
      await checkAllTentsAlerts();
    } catch (error) {
      console.error('[AlertsChecker] Erro na execução do cron job:', error);
    }
  });
  
  console.log('[AlertsChecker] Cron job iniciado: verificação automática a cada 1 hora');
  
  return task;
}
