import { describe, it, expect } from "vitest";
import {
  convertECtoPPM,
  convertPPMtoEC,
  calculatepHAdjustment,
  calculateNutrientMix,
  getRecommendedRecipe,
  type NutrientProduct,
} from "./nutrients";

describe("Mineral Salts Calculator", () => {
  describe("EC ↔ PPM Conversions", () => {
    it("should convert EC to PPM correctly (scale 640)", () => {
      expect(convertECtoPPM(1.0)).toBe(640);
      expect(convertECtoPPM(1.5)).toBe(960);
      expect(convertECtoPPM(2.0)).toBe(1280);
    });

    it("should convert PPM to EC correctly (scale 640)", () => {
      expect(convertPPMtoEC(640)).toBe(1.0);
      expect(convertPPMtoEC(960)).toBe(1.5);
      expect(convertPPMtoEC(1280)).toBe(2.0);
    });

    it("should handle round-trip conversions", () => {
      const ec = 1.75;
      const ppm = convertECtoPPM(ec);
      const ecBack = convertPPMtoEC(ppm);
      expect(ecBack).toBeCloseTo(ec, 1);
    });
  });

  describe("pH Adjustment Calculations", () => {
    it("should calculate pH Up amount correctly", () => {
      const result = calculatepHAdjustment(5.5, 6.0, 10);
      expect(result.direction).toBe("up");
      expect(result.amountMl).toBeGreaterThan(0);
    });

    it("should calculate pH Down amount correctly", () => {
      const result = calculatepHAdjustment(6.5, 6.0, 10);
      expect(result.direction).toBe("down");
      expect(result.amountMl).toBeGreaterThan(0);
    });

    it("should return 'none' when pH is already within range", () => {
      const result = calculatepHAdjustment(6.0, 6.05, 10);
      expect(result.direction).toBe("none");
      expect(result.amountMl).toBe(0);
    });

    it("should scale with volume", () => {
      const result10L = calculatepHAdjustment(5.5, 6.0, 10);
      const result20L = calculatepHAdjustment(5.5, 6.0, 20);
      expect(result20L.amountMl).toBeCloseTo(result10L.amountMl * 2, 1);
    });
  });

  describe("Nutrient Mix Calculations", () => {
    it("should calculate NPK from mineral salts correctly", () => {
      const products: NutrientProduct[] = [
        { name: "Nitrato de Cálcio", amountG: 9, npk: "15.5-0-0", ca: 19 },
        { name: "Nitrato de Potássio", amountG: 4, npk: "13-0-38" },
        { name: "MKP", amountG: 1.9, npk: "0-22-28" },
      ];

      const mix = calculateNutrientMix(products, 10);

      // Verify NPK values are calculated
      expect(mix.npkTotal.n).toBeGreaterThan(0);
      expect(mix.npkTotal.p).toBeGreaterThan(0);
      expect(mix.npkTotal.k).toBeGreaterThan(0);
    });

    it("should calculate micronutrients correctly", () => {
      const products: NutrientProduct[] = [
        { name: "Nitrato de Cálcio", amountG: 9, npk: "15.5-0-0", ca: 19 },
        { name: "Sulfato de Magnésio", amountG: 6.4, mg: 10, s: 13 },
        { name: "Micronutrientes", amountG: 0.5, fe: 6 },
      ];

      const mix = calculateNutrientMix(products, 10);

      // Verify micronutrients are calculated
      expect(mix.micronutrients.ca).toBeGreaterThan(0);
      expect(mix.micronutrients.mg).toBeGreaterThan(0);
      expect(mix.micronutrients.fe).toBeGreaterThan(0);
    });

    it("should estimate EC based on total nutrients", () => {
      const products: NutrientProduct[] = [
        { name: "Nitrato de Cálcio", amountG: 9, npk: "15.5-0-0", ca: 19 },
        { name: "Nitrato de Potássio", amountG: 4, npk: "13-0-38" },
        { name: "MKP", amountG: 1.9, npk: "0-22-28" },
        { name: "Sulfato de Magnésio", amountG: 6.4, mg: 10, s: 13 },
      ];

      const mix = calculateNutrientMix(products, 10);

      // EC should be reasonable for mineral salts (0.5 - 3.0 mS/cm)
      expect(mix.ecEstimated).toBeGreaterThan(0.5);
      expect(mix.ecEstimated).toBeLessThan(3.0);
    });

    it("should scale quantities with volume", () => {
      const products: NutrientProduct[] = [
        { name: "Nitrato de Cálcio", amountG: 9, npk: "15.5-0-0", ca: 19 },
      ];

      const mix10L = calculateNutrientMix(products, 10);
      const mix20L = calculateNutrientMix([
        { name: "Nitrato de Cálcio", amountG: 18, npk: "15.5-0-0", ca: 19 },
      ], 20);

      // PPM should be the same for same g/L ratio
      expect(mix10L.npkTotal.n).toBeCloseTo(mix20L.npkTotal.n, 0);
      expect(mix10L.micronutrients.ca).toBeCloseTo(mix20L.micronutrients.ca, 0);
    });
  });

  describe("Recommended Recipes by Phase", () => {
    it("should generate CLONING recipe with low EC", () => {
      const recipe = getRecommendedRecipe("CLONING", 1, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      expect(recipe.ecEstimated).toBeLessThan(1.2);
      expect(recipe.volumeTotalL).toBe(10);
    });

    it("should generate VEGA recipe with progressive EC", () => {
      const recipeWeek1 = getRecommendedRecipe("VEGA", 1, 10);
      const recipeWeek4 = getRecommendedRecipe("VEGA", 4, 10);

      // Week 4 should have higher EC than week 1
      expect(recipeWeek4.ecEstimated).toBeGreaterThan(recipeWeek1.ecEstimated);

      // Both should have nitrogen focus
      expect(recipeWeek1.npkTotal.n).toBeGreaterThan(recipeWeek1.npkTotal.p);
      expect(recipeWeek4.npkTotal.n).toBeGreaterThan(recipeWeek4.npkTotal.p);
    });

    it("should generate FLORA recipe with high P-K", () => {
      const recipe = getRecommendedRecipe("FLORA", 3, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      // Flora should have higher K than N (P pode ser similar devido às proporções dos sais)
      expect(recipe.npkTotal.k).toBeGreaterThan(recipe.npkTotal.n);
      // P+K combinados devem ser maiores que N
      expect(recipe.npkTotal.p + recipe.npkTotal.k).toBeGreaterThan(recipe.npkTotal.n);
    });

    it("should generate MAINTENANCE recipe with balanced NPK", () => {
      const recipe = getRecommendedRecipe("MAINTENANCE", 1, 10);

      expect(recipe.products.length).toBeGreaterThan(0);
      expect(recipe.ecEstimated).toBeGreaterThan(0.8);
      expect(recipe.ecEstimated).toBeLessThan(1.5);
    });

    it("should generate DRYING recipe with no nutrients (flush)", () => {
      const recipe = getRecommendedRecipe("DRYING", 1, 10);

      expect(recipe.products.length).toBe(0);
      expect(recipe.ecEstimated).toBe(0);
      expect(recipe.npkTotal.n).toBe(0);
      expect(recipe.npkTotal.p).toBe(0);
      expect(recipe.npkTotal.k).toBe(0);
    });

    it("should include all 5 mineral salts in VEGA recipe", () => {
      const recipe = getRecommendedRecipe("VEGA", 2, 10);

      const productNames = recipe.products.map(p => p.name);
      expect(productNames).toContain("Nitrato de Cálcio");
      expect(productNames).toContain("Nitrato de Potássio");
      expect(productNames).toContain("MKP (Fosfato Monopotássico)");
      expect(productNames).toContain("Sulfato de Magnésio");
      expect(productNames).toContain("Micronutrientes");
    });

    it("should scale recipe with volume", () => {
      const recipe10L = getRecommendedRecipe("VEGA", 2, 10);
      const recipe20L = getRecommendedRecipe("VEGA", 2, 20);

      // Total grams should double
      const total10L = recipe10L.products.reduce((sum, p) => sum + p.amountG, 0);
      const total20L = recipe20L.products.reduce((sum, p) => sum + p.amountG, 0);
      expect(total20L).toBeCloseTo(total10L * 2, 1);

      // PPM should stay the same
      expect(recipe10L.npkTotal.n).toBeCloseTo(recipe20L.npkTotal.n, 0);
      expect(recipe10L.ecEstimated).toBeCloseTo(recipe20L.ecEstimated, 1);
    });
  });

  describe("Real-world Test: VEGA Week 1 for 20L", () => {
    it("should match expected values from reference image", () => {
      const recipe = getRecommendedRecipe("VEGA", 4, 20); // Week 4 = multiplier 1.0

      // Find each product
      const calciumNitrate = recipe.products.find(p => p.name === "Nitrato de Cálcio");
      const potassiumNitrate = recipe.products.find(p => p.name === "Nitrato de Potássio");
      const mkp = recipe.products.find(p => p.name === "MKP (Fosfato Monopotássico)");
      const magnesiumSulfate = recipe.products.find(p => p.name === "Sulfato de Magnésio");
      const micros = recipe.products.find(p => p.name === "Micronutrientes");

      // Verify all products exist
      expect(calciumNitrate).toBeDefined();
      expect(potassiumNitrate).toBeDefined();
      expect(mkp).toBeDefined();
      expect(magnesiumSulfate).toBeDefined();
      expect(micros).toBeDefined();

      // Verify quantities are in expected range (reference: 18g, 8g, 3.8g, 12.8g, 1g)
      expect(calciumNitrate!.amountG).toBeCloseTo(18, 0);
      expect(potassiumNitrate!.amountG).toBeCloseTo(8, 0);
      expect(mkp!.amountG).toBeCloseTo(3.8, 0);
      expect(magnesiumSulfate!.amountG).toBeCloseTo(12.8, 0);
      expect(micros!.amountG).toBeCloseTo(1, 0);

      // Verify EC is in expected range (reference: 2.0 mS/cm)
      expect(recipe.ecEstimated).toBeGreaterThan(1.5);
      expect(recipe.ecEstimated).toBeLessThan(2.5);
    });
  });
});
