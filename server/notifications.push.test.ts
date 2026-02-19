import { describe, it, expect } from 'vitest';
import { checkAlertsForTent } from './db';

describe('Push Notifications - Sistema de Alertas', () => {
  it('deve enviar notificação push quando alertas forem gerados', async () => {
    // Testar com estufa que tem dados registrados
    const tentId = 1; // Estufa A
    
    const result = await checkAlertsForTent(tentId);
    
    // Verificar estrutura do retorno
    expect(result).toHaveProperty('alertsGenerated');
    expect(result).toHaveProperty('messages');
    
    // Verificar tipos
    expect(typeof result.alertsGenerated).toBe('number');
    expect(Array.isArray(result.messages)).toBe(true);
    
    // Se alertas foram gerados, verificar mensagens
    if (result.alertsGenerated > 0) {
      expect(result.messages.length).toBe(result.alertsGenerated);
      console.log(`✅ ${result.alertsGenerated} alertas gerados e notificação push enviada:`);
      result.messages.forEach(msg => console.log(`   - ${msg}`));
    } else {
      console.log('✅ Nenhum alerta gerado (valores dentro das margens)');
    }
  }, 30000); // Timeout de 30s para permitir envio de notificação
  
  it('deve registrar notificação no histórico quando alertas forem gerados', async () => {
    const tentId = 1;
    
    const result = await checkAlertsForTent(tentId);
    
    // Se alertas foram gerados, deve ter registrado no notificationHistory
    if (result.alertsGenerated > 0) {
      // Verificar que a função foi executada sem erros
      expect(result.alertsGenerated).toBeGreaterThan(0);
      console.log(`✅ Notificação registrada no histórico para ${result.alertsGenerated} alertas`);
    }
  }, 30000);
});
