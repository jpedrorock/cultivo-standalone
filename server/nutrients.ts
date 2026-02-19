/**
 * Funções auxiliares para cálculos de nutrientes (Sais Minerais Sólidos)
 */

export interface NutrientProduct {
  name: string;
  amountG: number; // Quantidade em gramas
  npk?: string; // Ex: "15-0-0" (composição química do sal)
  ca?: number; // Cálcio %
  mg?: number; // Magnésio %
  fe?: number; // Ferro %
  s?: number; // Enxofre %
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
    s: number; // Enxofre (ppm)
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
 * Calcula NPK total e micronutrientes de uma mistura de sais minerais
 * 
 * @param products Lista de produtos (sais) com quantidades em gramas
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
  let sTotal = 0;
  
  // Calcular contribuição de cada produto
  for (const product of products) {
    if (product.npk) {
      const [n, p, k] = product.npk.split('-').map(Number);
      
      // Converter % para ppm baseado na quantidade de produto em gramas
      // 1g de produto com X% de nutriente em 1L = (X/100) * 1000 ppm
      const gPerLiter = product.amountG / volumeTotalL;
      
      nTotal += (n / 100) * gPerLiter * 1000; // Converte % para ppm
      pTotal += (p / 100) * gPerLiter * 1000;
      kTotal += (k / 100) * gPerLiter * 1000;
    }
    
    if (product.ca) {
      const gPerLiter = product.amountG / volumeTotalL;
      caTotal += (product.ca / 100) * gPerLiter * 1000;
    }
    
    if (product.mg) {
      const gPerLiter = product.mg / volumeTotalL;
      mgTotal += (product.mg / 100) * gPerLiter * 1000;
    }
    
    if (product.fe) {
      const gPerLiter = product.amountG / volumeTotalL;
      feTotal += (product.fe / 100) * gPerLiter * 1000;
    }
    
    if (product.s) {
      const gPerLiter = product.amountG / volumeTotalL;
      sTotal += (product.s / 100) * gPerLiter * 1000;
    }
  }
  
  // Estimar EC baseado no total de sais dissolvidos
  // Para sais minerais: EC ≈ (total de sais em g/L) × fator de conversão
  // Baseado em dados empíricos: ~2.2g/L de sais → 2.0 mS/cm (fator ≈ 0.91)
  const totalSaltsGPerL = products.reduce((sum, p) => sum + (p.amountG / volumeTotalL), 0);
  const ecEstimated = Math.round(totalSaltsGPerL * 0.91 * 100) / 100;
  
  // pH estimado (simplificado - sais minerais geralmente baixam o pH para 5.5-6.5)
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
      s: Math.round(sTotal),
    },
  };
}

/**
 * Gera receita recomendada para uma fase específica usando sais minerais
 * 
 * Composição química dos sais:
 * - Nitrato de Cálcio: Ca(NO₃)₂ → 15.5% N, 19% Ca
 * - Nitrato de Potássio: KNO₃ → 13% N, 38% K
 * - MKP (Fosfato Monopotássico): KH₂PO₄ → 22% P, 28% K
 * - Sulfato de Magnésio: MgSO₄ → 10% Mg, 13% S
 * - Micronutrientes: Mix comercial → 6% Fe
 */
export function getRecommendedRecipe(
  phase: 'CLONING' | 'VEGA' | 'FLORA' | 'MAINTENANCE' | 'DRYING',
  weekNumber: number,
  volumeL: number = 10
): NutrientMix {
  let products: NutrientProduct[] = [];
  
  switch (phase) {
    case 'CLONING':
      // Clonagem: baixo NPK, EC ~0.8 mS/cm
      products = [
        { name: 'Nitrato de Cálcio', amountG: 0.3 * volumeL, npk: '15.5-0-0', ca: 19 },
        { name: 'Nitrato de Potássio', amountG: 0.2 * volumeL, npk: '13-0-38' },
        { name: 'MKP (Fosfato Monopotássico)', amountG: 0.1 * volumeL, npk: '0-22-28' },
        { name: 'Sulfato de Magnésio', amountG: 0.2 * volumeL, mg: 10, s: 13 },
      ];
      break;
      
    case 'VEGA':
      // Vegetativa: alto N, EC ~1.2-1.6 mS/cm
      const vegaWeek = Math.min(weekNumber, 4);
      const vegaMultiplier = 0.7 + (vegaWeek / 4) * 0.3; // 0.7 a 1.0
      
      products = [
        { name: 'Nitrato de Cálcio', amountG: 0.9 * vegaMultiplier * volumeL, npk: '15.5-0-0', ca: 19 },
        { name: 'Nitrato de Potássio', amountG: 0.4 * vegaMultiplier * volumeL, npk: '13-0-38' },
        { name: 'MKP (Fosfato Monopotássico)', amountG: 0.19 * vegaMultiplier * volumeL, npk: '0-22-28' },
        { name: 'Sulfato de Magnésio', amountG: 0.64 * vegaMultiplier * volumeL, mg: 10, s: 13 },
        { name: 'Micronutrientes', amountG: 0.05 * vegaMultiplier * volumeL, fe: 6 },
      ];
      break;
      
    case 'FLORA':
      // Floração: baixo N, alto P-K, EC ~1.4-1.8 mS/cm
      const floraWeek = Math.min(weekNumber, 8);
      const floraMultiplier = 0.8 + (floraWeek / 8) * 0.4; // 0.8 a 1.2
      
      products = [
        { name: 'Nitrato de Cálcio', amountG: 0.4 * floraMultiplier * volumeL, npk: '15.5-0-0', ca: 19 },
        { name: 'Nitrato de Potássio', amountG: 0.7 * floraMultiplier * volumeL, npk: '13-0-38' },
        { name: 'MKP (Fosfato Monopotássico)', amountG: 0.6 * floraMultiplier * volumeL, npk: '0-22-28' },
        { name: 'Sulfato de Magnésio', amountG: 0.5 * floraMultiplier * volumeL, mg: 10, s: 13 },
        { name: 'Micronutrientes', amountG: 0.05 * floraMultiplier * volumeL, fe: 6 },
      ];
      break;
      
    case 'MAINTENANCE':
      // Manutenção: NPK balanceado, EC ~1.0 mS/cm
      products = [
        { name: 'Nitrato de Cálcio', amountG: 0.5 * volumeL, npk: '15.5-0-0', ca: 19 },
        { name: 'Nitrato de Potássio', amountG: 0.3 * volumeL, npk: '13-0-38' },
        { name: 'MKP (Fosfato Monopotássico)', amountG: 0.15 * volumeL, npk: '0-22-28' },
        { name: 'Sulfato de Magnésio', amountG: 0.3 * volumeL, mg: 10, s: 13 },
      ];
      break;
      
    case 'DRYING':
      // Secagem: apenas água (flush)
      products = [];
      break;
  }
  
  return calculateNutrientMix(products, volumeL);
}
