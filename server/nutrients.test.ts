import { describe, it, expect } from 'vitest';
import {
  convertECtoPPM,
  convertPPMtoEC,
  calculatepHAdjustment,
  calculateNutrientMix,
  getRecommendedRecipe,
  type NutrientProduct,
} from './nutrients';

describe('Nutrient Calculations', () => {
  describe('EC ↔ PPM Conversions', () => {
    it('should convert EC to PPM correctly (scale 640)', () => {
      expect(convertECtoPPM(1.0)).toBe(640); // 1 mS/cm = 640 ppm
      expect(convertECtoPPM(1.5)).toBe(960); // 1.5 mS/cm = 960 ppm
      expect(convertECtoPPM(2.0)).toBe(1280); // 2 mS/cm = 1280 ppm
      expect(convertECtoPPM(0.5)).toBe(320); // 0.5 mS/cm = 320 ppm
    });

    it('should convert PPM to EC correctly (scale 640)', () => {
      expect(convertPPMtoEC(640)).toBe(1.0); // 640 ppm = 1 mS/cm
      expect(convertPPMtoEC(960)).toBe(1.5); // 960 ppm = 1.5 mS/cm
      expect(convertPPMtoEC(1280)).toBe(2.0); // 1280 ppm = 2 mS/cm
      expect(convertPPMtoEC(320)).toBe(0.5); // 320 ppm = 0.5 mS/cm
    });

    it('should round conversions to 2 decimal places', () => {
      expect(convertPPMtoEC(700)).toBe(1.09); // 700 / 640 = 1.09375 → 1.09
      expect(convertPPMtoEC(850)).toBe(1.33); // 850 / 640 = 1.328125 → 1.33
    });
  });

  describe('pH Adjustment Calculations', () => {
    it('should calculate pH Up amount correctly', () => {
      const result = calculatepHAdjustment(5.5, 6.0, 10);
      expect(result.direction).toBe('up');
      expect(result.amountMl).toBeGreaterThan(0);
    });

    it('should calculate pH Down amount correctly', () => {
      const result = calculatepHAdjustment(7.0, 6.0, 10);
      expect(result.direction).toBe('down');
      expect(result.amountMl).toBeGreaterThan(0);
    });

    it('should return none when pH difference is minimal', () => {
      const result = calculatepHAdjustment(6.0, 6.05, 10);
      expect(result.direction).toBe('none');
      expect(result.amountMl).toBe(0);
    });

    it('should scale adjustment amount with volume', () => {
      const result10L = calculatepHAdjustment(5.5, 6.0, 10);
      const result20L = calculatepHAdjustment(5.5, 6.0, 20);
      
      expect(result20L.amountMl).toBeGreaterThan(result10L.amountMl);
      expect(result20L.amountMl).toBeCloseTo(result10L.amountMl * 2, 1);
    });
  });

  describe('Nutrient Mix Calculations', () => {
    it('should calculate NPK totals correctly', () => {
      const products: NutrientProduct[] = [
        { name: 'Nitrato de Cálcio', amountG: 5, npk: '15.5-0-0', ca: 19 }, // 5g em 10L
      ];

      const mix = calculateNutrientMix(products, 10);

      expect(mix.npkTotal.n).toBeGreaterThan(0);
      expect(mix.micronutrients.ca).toBeGreaterThan(0);
    });

    it('should calculate micronutrients correctly', () => {
      const products: NutrientProduct[] = [
        { name: 'Sulfato de Magnésio', amountG: 3, mg: 10, s: 13 },
        { name: 'Micronutrientes', amountG: 0.5, fe: 6 },
      ];

      const mix = calculateNutrientMix(products, 10);

      expect(mix.micronutrients.mg).toBeGreaterThan(0);
      expect(mix.micronutrients.fe).toBeGreaterThan(0);
      expect(mix.micronutrients.s).toBeGreaterThan(0);
    });

    it('should estimate EC based on total nutrients', () => {
      const products: NutrientProduct[] = [
        { name: 'Nitrato de Cálcio', amountG: 5, npk: '15.5-0-0', ca: 19 },
        { name: 'Sulfato de Magnésio', amountG: 3, mg: 10, s: 13 },
      ];

      const mix = calculateNutrientMix(products, 10);

      expect(mix.ecEstimated).toBeGreaterThan(0);
      expect(mix.ecEstimated).toBeLessThan(5); // Reasonable EC range
    });

    it('should return correct structure', () => {
      const products: NutrientProduct[] = [
        { name: 'Test', amountG: 5, npk: '15-0-0' },
      ];

      const mix = calculateNutrientMix(products, 10);

      expect(mix).toHaveProperty('products');
      expect(mix).toHaveProperty('volumeTotalL');
      expect(mix).toHaveProperty('ecEstimated');
      expect(mix).toHaveProperty('phEstimated');
      expect(mix).toHaveProperty('npkTotal');
      expect(mix).toHaveProperty('micronutrients');
    });
  });

  describe('Recommended Recipes', () => {
    it('should generate CLONING recipe with low EC', () => {
      const recipe = getRecommendedRecipe('CLONING', 1, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      expect(recipe.volumeTotalL).toBe(10);
      expect(recipe.ecEstimated).toBeLessThan(1.5); // Low EC for clones
    });

    it('should generate VEGA recipe with increasing intensity', () => {
      const week1 = getRecommendedRecipe('VEGA', 1, 10);
      const week4 = getRecommendedRecipe('VEGA', 4, 10);

      // Week 4 should have higher EC than week 1
      expect(week4.ecEstimated).toBeGreaterThanOrEqual(week1.ecEstimated);
    });

    it('should generate FLORA recipe with high P-K', () => {
      const recipe = getRecommendedRecipe('FLORA', 4, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      expect(recipe.npkTotal.p).toBeGreaterThan(0); // Phosphorus
      expect(recipe.npkTotal.k).toBeGreaterThan(0); // Potassium
    });

    it('should generate MAINTENANCE recipe with balanced NPK', () => {
      const recipe = getRecommendedRecipe('MAINTENANCE', 1, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      expect(recipe.ecEstimated).toBeLessThan(1.5); // Moderate EC
    });

    it('should generate DRYING recipe with no nutrients (flush)', () => {
      const recipe = getRecommendedRecipe('DRYING', 1, 10);

      expect(recipe.products.length).toBe(0); // No products
      expect(recipe.ecEstimated).toBe(0); // EC = 0
    });

    it('should scale recipe with volume', () => {
      const recipe10L = getRecommendedRecipe('VEGA', 2, 10);
      const recipe20L = getRecommendedRecipe('VEGA', 2, 20);

      // Products should scale proportionally
      expect(recipe20L.products[0].amountG).toBeGreaterThan(recipe10L.products[0].amountG);
      expect(recipe20L.products[0].amountG).toBeCloseTo(recipe10L.products[0].amountG * 2, 1);
    });
  });
});
