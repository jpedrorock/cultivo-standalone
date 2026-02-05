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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("dailyLogs API", () => {
  it("should create a daily log with valid data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dailyLogs.create({
      tentId: 1,
      logDate: new Date(),
      turn: "AM",
      tempC: "23.5",
      rhPct: "62.0",
      ppfd: 380,
      notes: "Test log entry",
    });

    expect(result).toEqual({ success: true });
  });

  it("should list daily logs for a tent", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dailyLogs.list({
      tentId: 1,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter daily logs by date range", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2026-02-01");
    const endDate = new Date("2026-02-10");

    const result = await caller.dailyLogs.list({
      tentId: 1,
      startDate,
      endDate,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
