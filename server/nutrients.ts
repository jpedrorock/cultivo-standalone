/**
 * Funções auxiliares para cálculos de nutrientes
 */

export interface NutrientProduct {
  name: string;
  amountMl: number; // Quantidade em ml
  npk?: string; // Ex: "5-10-5"
  ca?: number; // Cálcio %
  mg?: number; // Magnésio %
  fe?: number; // Ferro %
}

export interface NutrientMix {
  products: NutrientProduct[];
  volumeTotalL: number;
  ecEstimated: number;
  phEstimated: number;
  npkTotal: {
    n: number; // Nitrogênio total (ppm)
    p: number; // Fósforo total (ppm)
    k: number; // Potássio total (ppm)
  };
  micronutrients: {
    ca: number; // Cálcio (ppm)
    mg: number; // Magnésio (ppm)
    fe: number; // Ferro (ppm)
  };
}

/**
 * Converte EC (mS/cm) para PPM
 * Fator de conversão: 1 mS/cm ≈ 640 ppm (escala 640)
 */
export function convertECtoPPM(ec: number): number {
  return Math.round(ec * 640);
}

/**
 * Converte PPM para EC (mS/cm)
 * Fator de conversão: 1 mS/cm ≈ 640 ppm (escala 640)
 */
export function convertPPMtoEC(ppm: number): number {
  return Math.round((ppm / 640) * 100) / 100; // Arredonda para 2 casas decimais
}

/**
 * Calcula quantidade de pH Up/Down necessária
 * Estimativa simplificada: 1ml de pH Up/Down ajusta ~0.1 pH em 10L de água
 * 
 * @param currentPH pH atual da solução
 * @param targetPH pH desejado
 * @param volumeL Volume total em litros
 * @returns Quantidade em ml de pH Up (positivo) ou pH Down (negativo)
 */
export function calculatepHAdjustment(
  currentPH: number,
  targetPH: number,
  volumeL: number
): { direction: 'up' | 'down' | 'none'; amountMl: number } {
  const diff = targetPH - currentPH;
  
  if (Math.abs(diff) < 0.1) {
    return { direction: 'none', amountMl: 0 };
  }
  
  // Fórmula simplificada: 1ml ajusta 0.1 pH em 10L
  // Para volumeL: (diff / 0.1) * (volumeL / 10)
  const amountMl = Math.abs(diff) * volumeL;
  
  return {
    direction: diff > 0 ? 'up' : 'down',
    amountMl: Math.round(amountMl * 10) / 10, // Arredonda para 1 casa decimal
  };
}

/**
 * Calcula NPK total e micronutrientes de uma mistura
 * 
 * @param products Lista de produtos com quantidades
 * @param volumeTotalL Volume total da solução em litros
 * @returns Mistura calculada com NPK e micronutrientes
 */
export function calculateNutrientMix(
  products: NutrientProduct[],
  volumeTotalL: number
): NutrientMix {
  let nTotal = 0;
  let pTotal = 0;
  let kTotal = 0;
  let caTotal = 0;
  let mgTotal = 0;
  let feTotal = 0;
  
  // Calcular contribuição de cada produto
  for (const product of products) {
    if (product.npk) {
      const [n, p, k] = product.npk.split('-').map(Number);
      
      // Converter % para ppm baseado na quantidade de produto
      // Assumindo densidade ~1g/ml para fertilizantes líquidos
      // 1% em 1ml = 10mg = 10ppm em 1L
      const mlPerLiter = product.amountMl / volumeTotalL;
      
      nTotal += (n / 100) * mlPerLiter * 10000; // Converte % para ppm
      pTotal += (p / 100) * mlPerLiter * 10000;
      kTotal += (k / 100) * mlPerLiter * 10000;
    }
    
    if (product.ca) {
      const mlPerLiter = product.amountMl / volumeTotalL;
      caTotal += (product.ca / 100) * mlPerLiter * 10000;
    }
    
    if (product.mg) {
      const mlPerLiter = product.amountMl / volumeTotalL;
      mgTotal += (product.mg / 100) * mlPerLiter * 10000;
    }
    
    if (product.fe) {
      const mlPerLiter = product.amountMl / volumeTotalL;
      feTotal += (product.fe / 100) * mlPerLiter * 10000;
    }
  }
  
  // Estimar EC baseado no total de nutrientes
  // Regra geral: 1000 ppm ≈ 1.5-2.0 mS/cm (ajustado para 1.5)
  // Dividir por 10 para compensar cálculo superestimado
  const totalPPM = (nTotal + pTotal + kTotal + caTotal + mgTotal + feTotal) / 10;
  const ecEstimated = convertPPMtoEC(totalPPM);
  
  // pH estimado (simplificado - depende muito dos produtos)
  // Fertilizantes geralmente baixam o pH para 5.5-6.5
  const phEstimated = 6.0;
  
  return {
    products,
    volumeTotalL,
    ecEstimated,
    phEstimated,
    npkTotal: {
      n: Math.round(nTotal),
      p: Math.round(pTotal),
      k: Math.round(kTotal),
    },
    micronutrients: {
      ca: Math.round(caTotal),
      mg: Math.round(mgTotal),
      fe: Math.round(feTotal),
    },
  };
}

/**
 * Gera receita recomendada para uma fase específica
 */
export function getRecommendedRecipe(
  phase: 'CLONING' | 'VEGA' | 'FLORA' | 'MAINTENANCE' | 'DRYING',
  weekNumber: number,
  volumeL: number = 10
): NutrientMix {
  let products: NutrientProduct[] = [];
  
  switch (phase) {
    case 'CLONING':
      // Clonagem: baixo NPK, foco em enraizamento
      products = [
        { name: 'Enraizador', amountMl: 2 * volumeL, npk: '1-2-1' },
        { name: 'CalMag', amountMl: 1 * volumeL, ca: 3, mg: 1 },
      ];
      break;
      
    case 'VEGA':
      // Vegetativa: alto N, médio P-K
      const vegaIntensity = Math.min(weekNumber / 4, 1); // Intensidade cresce até semana 4
      products = [
        { name: 'Grow (Vega)', amountMl: (3 + vegaIntensity * 2) * volumeL, npk: '7-4-10' },
        { name: 'CalMag', amountMl: 2 * volumeL, ca: 3, mg: 1 },
        { name: 'Micronutrientes', amountMl: 1 * volumeL, fe: 0.5 },
      ];
      break;
      
    case 'FLORA':
      // Floração: baixo N, alto P-K
      const floraIntensity = Math.min(weekNumber / 8, 1); // Intensidade cresce até semana 8
      products = [
        { name: 'Bloom (Flora)', amountMl: (4 + floraIntensity * 3) * volumeL, npk: '2-8-12' },
        { name: 'PK Booster', amountMl: floraIntensity * 2 * volumeL, npk: '0-13-14' },
        { name: 'CalMag', amountMl: 2 * volumeL, ca: 3, mg: 1 },
      ];
      break;
      
    case 'MAINTENANCE':
      // Manutenção: NPK balanceado, baixa concentração
      products = [
        { name: 'Manutenção Básica', amountMl: 2 * volumeL, npk: '5-5-5' },
        { name: 'CalMag', amountMl: 1 * volumeL, ca: 3, mg: 1 },
      ];
      break;
      
    case 'DRYING':
      // Secagem: apenas água (flush)
      products = [];
      break;
  }
  
  return calculateNutrientMix(products, volumeL);
}
