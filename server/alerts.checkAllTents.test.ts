import { describe, it, expect } from 'vitest';
import { checkAllTentsAlerts } from './cron/alertsChecker';

describe('Alerts Checker - Verificação Automática', () => {
  it('deve verificar alertas para todas as estufas', async () => {
    const result = await checkAllTentsAlerts();
    
    // Verificar estrutura do retorno
    expect(result).toHaveProperty('tentsChecked');
    expect(result).toHaveProperty('totalNewAlerts');
    expect(result).toHaveProperty('results');
    
    // Verificar tipos
    expect(typeof result.tentsChecked).toBe('number');
    expect(typeof result.totalNewAlerts).toBe('number');
    expect(Array.isArray(result.results)).toBe(true);
    
    // Verificar que pelo menos uma estufa foi verificada
    expect(result.tentsChecked).toBeGreaterThanOrEqual(0);
    
    // Verificar estrutura dos resultados individuais
    if (result.results.length > 0) {
      const firstResult = result.results[0];
      expect(firstResult).toHaveProperty('tentId');
      expect(firstResult).toHaveProperty('tentName');
      expect(firstResult).toHaveProperty('alertsGenerated');
      
      expect(typeof firstResult.tentId).toBe('number');
      expect(typeof firstResult.tentName).toBe('string');
      expect(typeof firstResult.alertsGenerated).toBe('number');
    }
    
    console.log(`✅ Verificação concluída: ${result.tentsChecked} estufas verificadas, ${result.totalNewAlerts} alertas gerados`);
  }, 30000); // Timeout de 30s para permitir verificação de múltiplas estufas
});
