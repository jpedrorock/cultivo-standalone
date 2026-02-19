import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Watering Procedures", () => {
  it("should save watering application with all fields", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.watering.recordApplication({
      tentId: 180001,
      cycleId: null,
      recipeName: "Teste Rega 19/02",
      potSizeL: 11,
      numberOfPots: 4,
      waterPerPotL: 4.36,
      totalWaterL: 17.42,
      targetRunoffPercent: 20,
      expectedRunoffL: 3.48,
      actualRunoffL: 3.5,
      actualRunoffPercent: 20.1,
      notes: "Teste de salvamento de receita de rega",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeGreaterThan(0);
  });

  it("should list watering applications", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const applications = await caller.watering.listApplications({
      limit: 10,
    });

    expect(Array.isArray(applications)).toBe(true);
  });

  it("should filter applications by tentId", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const applications = await caller.watering.listApplications({
      tentId: 180001,
      limit: 10,
    });

    expect(Array.isArray(applications)).toBe(true);
    applications.forEach((app: any) => {
      expect(app.tentId).toBe(180001);
    });
  });

  it("should save watering application without optional fields", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.watering.recordApplication({
      tentId: 180002,
      cycleId: null,
      recipeName: "Rega Simples",
      potSizeL: 5,
      numberOfPots: 3,
      waterPerPotL: 1.65,
      totalWaterL: 4.95,
      targetRunoffPercent: null,
      expectedRunoffL: null,
      actualRunoffL: null,
      actualRunoffPercent: null,
      notes: undefined,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeGreaterThan(0);
  });
});
