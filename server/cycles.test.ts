import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("cycles API", () => {
  it("should create a new cycle", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cycles.create({
      tentId: 3, // Estufa C
      strainId: 1,
      startDate: new Date(),
    });

    expect(result).toEqual({ success: true });
  });

  it("should list active cycles", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const cycles = await caller.cycles.listActive();

    expect(Array.isArray(cycles)).toBe(true);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it("should get cycle by tent ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const cycle = await caller.cycles.getByTent({ tentId: 2 }); // Estufa B

    expect(cycle).toBeDefined();
    if (cycle) {
      expect(cycle.tentId).toBe(2);
      expect(cycle.status).toBe("ACTIVE");
    }
  });

  it("should return null for tent without active cycle", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const cycle = await caller.cycles.getByTent({ tentId: 1 }); // Estufa A (não tem ciclo)

    expect(cycle).toBeNull();
  });

  it("should start flora phase", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get cycle from Estufa C (vegetative phase)
    const cycle = await caller.cycles.getByTent({ tentId: 3 });
    expect(cycle).toBeDefined();
    expect(cycle?.floraStartDate).toBeNull();

    // Start flora
    const result = await caller.cycles.startFlora({
      cycleId: cycle!.id,
      floraStartDate: new Date(),
    });

    expect(result).toEqual({ success: true });

    // Verify flora started
    const updatedCycle = await caller.cycles.getByTent({ tentId: 3 });
    expect(updatedCycle?.floraStartDate).toBeDefined();
  });
});
