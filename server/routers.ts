import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";
import * as db from "./db";
import { getDb } from "./db";
import {
  tents,
  strains,
  cycles,
  dailyLogs,
  recipes,
  alerts,
  weeklyTargets,
  taskInstances,
  taskTemplates,
  tentAState,
  cloningEvents,
  alertSettings,
  alertHistory,
  notificationHistory,
  plants,
  plantTentHistory,
  plantObservations,
  plantPhotos,
  plantRunoffLogs,
  plantHealthLogs,
  plantTrichomeLogs,
  plantLSTLogs,
  fertilizationPresets,
  wateringPresets,
  recipeTemplates,
  nutrientApplications,
  wateringApplications,
} from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    // Simplified auth for standalone deployment
    me: publicProcedure.query(() => ({ id: 1, name: "Local User", email: "user@local" })),
    logout: publicProcedure.mutation(() => ({ success: true })),
  }),

  // Weather (Clima)
  weather: router({
    getCurrent: publicProcedure
      .input(z.object({ lat: z.number(), lon: z.number() }))
      .query(async ({ input }) => {
        const { lat, lon } = input;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        return {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          weatherCode: data.current.weather_code,
          time: data.current.time,
        };
      }),
  }),

  // Tents (Estufas)
  tents: router({
    list: publicProcedure.query(async () => {
      return db.getAllTents();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getTentById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(50),
          category: z.enum(["MAINTENANCE", "VEGA", "FLORA", "DRYING"]),
          width: z.number().int().positive(),
          depth: z.number().int().positive(),
          height: z.number().int().positive(),
          powerW: z.number().int().positive().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Calcular volume (em litros)
        const volume = (input.width * input.depth * input.height) / 1000;
        
        const [result] = await database.insert(tents).values({
          ...input,
          volume: volume.toFixed(3),
        });
        
        return { success: true, id: result.insertId };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(50),
          category: z.enum(["MAINTENANCE", "VEGA", "FLORA", "DRYING"]),
          width: z.number().int().positive(),
          depth: z.number().int().positive(),
          height: z.number().int().positive(),
          powerW: z.number().int().positive().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Verificar se a estufa existe
        const existingTent = await database
          .select()
          .from(tents)
          .where(eq(tents.id, input.id))
          .limit(1);
        
        if (existingTent.length === 0) {
          throw new Error("Estufa não encontrada");
        }
        
        // Calcular volume (em litros)
        const volume = (input.width * input.depth * input.height) / 1000;
        
        const { id, ...updateData } = input;
        
        // Se powerW não foi fornecido, definir como null explicitamente
        const dataToUpdate = {
          ...updateData,
          volume: volume.toFixed(3),
          powerW: input.powerW ?? null,
        };
        
        await database
          .update(tents)
          .set(dataToUpdate)
          .where(eq(tents.id, id));
        
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Verificar se há ciclos ativos nesta estufa
        const activeCycles = await database
          .select()
          .from(cycles)
          .where(and(
            eq(cycles.tentId, input.id),
            eq(cycles.status, "ACTIVE")
          ));
        
        if (activeCycles.length > 0) {
          throw new Error("Não é possível excluir uma estufa com ciclos ativos. Finalize o ciclo primeiro.");
        }
        
        // Buscar todos os ciclos da estufa (ativos e finalizados)
        const allCycles = await database
          .select({ id: cycles.id })
          .from(cycles)
          .where(eq(cycles.tentId, input.id));
        
        const cycleIds = allCycles.map((c: any) => c.id);
        
        // Deletar registros relacionados em cascata
        // Deletar daily logs (usa tentId diretamente)
        await database.delete(dailyLogs).where(eq(dailyLogs.tentId, input.id));
        
        // Deletar task instances (usa tentId diretamente)
        await database.delete(taskInstances).where(eq(taskInstances.tentId, input.id));
        
        // Deletar ciclos (weeklyTargets não precisa ser deletado pois é relacionado a strain, não a ciclo)
        await database.delete(cycles).where(eq(cycles.tentId, input.id));
        
        // Deletar alert settings
        await database.delete(alertSettings).where(eq(alertSettings.tentId, input.id));
        
        // Deletar alert history
        await database.delete(alertHistory).where(eq(alertHistory.tentId, input.id));
        
        // Deletar alerts
        await database.delete(alerts).where(eq(alerts.tentId, input.id));
        
        // Deletar tent A state (se existir)
        await database.delete(tentAState).where(eq(tentAState.tentId, input.id));
        
        // Deletar cloning events
        await database.delete(cloningEvents).where(eq(cloningEvents.tentId, input.id));
        
        // Finalmente, deletar estufa
        await database.delete(tents).where(eq(tents.id, input.id));
        
        return { success: true };
      }),
  }),

  // Strains (Variedades)
  strains: router({
    list: publicProcedure.query(async () => {
      return db.getAllStrains();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getStrainById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          description: z.string().optional(),
          vegaWeeks: z.number().min(1).max(12),
          floraWeeks: z.number().min(1).max(16),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Check if strain name already exists
        const existing = await database.select().from(strains).where(eq(strains.name, input.name));
        if (existing.length > 0) {
          throw new Error(`Já existe uma strain com o nome "${input.name}". Por favor, escolha outro nome.`);
        }
        
        await database.insert(strains).values(input);
        return { success: true };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(100).optional(),
          description: z.string().optional(),
          vegaWeeks: z.number().min(1).max(12).optional(),
          floraWeeks: z.number().min(1).max(16).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        const { id, ...updateData } = input;
        await database.update(strains).set(updateData).where(eq(strains.id, id));
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Check if strain is used in any cycles
        const cyclesWithStrain = await database.select().from(cycles).where(eq(cycles.strainId, input.id));
        if (cyclesWithStrain.length > 0) {
          throw new Error("Não é possível excluir esta strain pois ela está vinculada a ciclos existentes. Finalize ou exclua os ciclos primeiro.");
        }
        
        // Check if strain is used in any plants
        const plantsWithStrain = await database.select().from(plants).where(eq(plants.strainId, input.id));
        if (plantsWithStrain.length > 0) {
          throw new Error("Não é possível excluir esta strain pois ela está vinculada a plantas existentes. Remova as plantas primeiro.");
        }
        
        await database.delete(strains).where(eq(strains.id, input.id));
        return { success: true };
      }),
    duplicate: publicProcedure
      .input(
        z.object({
          sourceStrainId: z.number(),
          name: z.string().min(1).max(100),
          description: z.string().optional(),
          vegaWeeks: z.number().min(1).max(12),
          floraWeeks: z.number().min(1).max(16),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Criar nova strain
        const [newStrain] = await database.insert(strains).values({
          name: input.name,
          description: input.description,
          vegaWeeks: input.vegaWeeks,
          floraWeeks: input.floraWeeks,
          isActive: true,
        }).$returningId();
        
        // Copiar todos os targets da strain original
        const sourceTargets = await database
          .select()
          .from(weeklyTargets)
          .where(eq(weeklyTargets.strainId, input.sourceStrainId));
        
        if (sourceTargets.length > 0) {
          const newTargets = sourceTargets.map((target: any) => ({
            strainId: newStrain.id,
            phase: target.phase,
            weekNumber: target.weekNumber,
            tempMin: target.tempMin,
            tempMax: target.tempMax,
            rhMin: target.rhMin,
            rhMax: target.rhMax,
            ppfdMin: target.ppfdMin,
            ppfdMax: target.ppfdMax,
            photoperiod: target.photoperiod,
            phMin: target.phMin,
            phMax: target.phMax,
            ecMin: target.ecMin,
            ecMax: target.ecMax,
          }));
          
          await database.insert(weeklyTargets).values(newTargets);
        }
        
        return { success: true, newStrainId: newStrain.id };
      }),
  }),

  // Cycles (Ciclos)
  cycles: router({
    listActive: publicProcedure.query(async () => {
      const allCycles = await db.getAllCycles();
      return allCycles.filter(c => c.status === "ACTIVE");
    }),
    getByTent: publicProcedure.input(z.object({ tentId: z.number() })).query(async ({ input }) => {
      return db.getCycleByTentId(input.tentId);
    }),
    create: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          strainId: z.number().optional().nullable(),
          startDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database.insert(cycles).values(input);
        return { success: true };
      }),
    startFlora: publicProcedure
      .input(
        z.object({
          cycleId: z.number(),
          floraStartDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database
          .update(cycles)
          .set({ floraStartDate: input.floraStartDate })
          .where(eq(cycles.id, input.cycleId));
        return { success: true };
      }),
    finalize: publicProcedure
      .input(z.object({ cycleId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database
          .update(cycles)
          .set({ status: "FINISHED" })
          .where(eq(cycles.id, input.cycleId));
        return { success: true };
      }),
    initiate: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          strainId: z.number().optional().nullable(),
          startDate: z.date(),
          phase: z.enum(["CLONING", "MAINTENANCE", "VEGA", "FLORA", "DRYING"]),
          weekNumber: z.number().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Calcular startDate baseado na fase e semana
        const startDate = new Date(input.startDate);
        const weeksToSubtract = input.weekNumber - 1;
        startDate.setDate(startDate.getDate() - (weeksToSubtract * 7));
        
        // Se fase for FLORA, definir floraStartDate
        const floraStartDate = input.phase === "FLORA" ? new Date(input.startDate) : null;
        
        await database.insert(cycles).values({
          tentId: input.tentId,
          strainId: input.strainId,
          startDate,
          floraStartDate,
        });
        
        // Atualizar categoria da estufa baseado na fase
        let category: "MAINTENANCE" | "VEGA" | "FLORA" | "DRYING" = "MAINTENANCE";
        if (input.phase === "CLONING" || input.phase === "MAINTENANCE") {
          category = "MAINTENANCE";
        } else if (input.phase === "VEGA") {
          category = "VEGA";
        } else if (input.phase === "FLORA") {
          category = "FLORA";
        } else if (input.phase === "DRYING") {
          category = "DRYING";
        }
        
        await database
          .update(tents)
          .set({ category })
          .where(eq(tents.id, input.tentId));
        
        return { success: true };
      }),
    edit: publicProcedure
      .input(
        z.object({
          cycleId: z.number(),
          strainId: z.number().optional(),
          startDate: z.date().optional(),
          floraStartDate: z.date().optional().nullable(),
          phase: z.enum(["CLONING", "MAINTENANCE", "VEGA", "FLORA", "DRYING"]).optional(),
          weekNumber: z.number().min(1).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        const updates: any = {};
        
        if (input.startDate && input.phase && input.weekNumber) {
          // Recalcular startDate baseado na fase e semana
          const startDate = new Date(input.startDate);
          const weeksToSubtract = input.weekNumber - 1;
          startDate.setDate(startDate.getDate() - (weeksToSubtract * 7));
          updates.startDate = startDate;
          
          // Se fase for FLORA, definir floraStartDate
          if (input.phase === "FLORA") {
            updates.floraStartDate = new Date(input.startDate);
          } else {
            updates.floraStartDate = null;
          }
        } else if (input.startDate) {
          updates.startDate = input.startDate;
        }
        
        if (input.floraStartDate !== undefined) {
          updates.floraStartDate = input.floraStartDate;
        }
        
        if (input.strainId) {
          updates.strainId = input.strainId;
        }
        
        await database
          .update(cycles)
          .set(updates)
          .where(eq(cycles.id, input.cycleId));
        
        // Atualizar categoria da estufa se fase foi especificada
        if (input.phase) {
          // Buscar tentId do ciclo
          const cycleData = await database
            .select()
            .from(cycles)
            .where(eq(cycles.id, input.cycleId))
            .limit(1);
          
          if (cycleData.length > 0) {
            const tentId = cycleData[0].tentId;
            
            // Mapear fase para categoria da estufa
            let category: "MAINTENANCE" | "VEGA" | "FLORA" | "DRYING" = "MAINTENANCE";
            if (input.phase === "CLONING" || input.phase === "MAINTENANCE") {
              category = "MAINTENANCE";
            } else if (input.phase === "VEGA") {
              category = "VEGA";
            } else if (input.phase === "FLORA") {
              category = "FLORA";
            } else if (input.phase === "DRYING") {
              category = "DRYING";
            }
            
            // Atualizar categoria da estufa
            await database
              .update(tents)
              .set({ category })
              .where(eq(tents.id, tentId));
          }
        }
        
        return { success: true };
      }),
    getReportData: publicProcedure
      .input(z.object({ cycleId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Buscar informações do ciclo
        const cycleData = await database
          .select()
          .from(cycles)
          .where(eq(cycles.id, input.cycleId))
          .limit(1);
        
        if (!cycleData || cycleData.length === 0) throw new Error("Cycle not found");
        const cycle = cycleData[0];
        
        // Buscar tent
        const tent = await database.select().from(tents).where(eq(tents.id, cycle.tentId)).limit(1);
        
        // Buscar strain (pode ser null se ciclo tem múltiplas strains)
        let strain: any[] = [];
        if (cycle.strainId) {
          strain = await database.select().from(strains).where(eq(strains.id, cycle.strainId)).limit(1);
        }
        
        // Buscar strains das plantas ativas na estufa
        const tentPlants = await database
          .select({ strainId: plants.strainId })
          .from(plants)
          .where(and(eq(plants.currentTentId, cycle.tentId), eq(plants.status, "ACTIVE")));
        const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId)));
        let tentStrains: any[] = [];
        if (uniqueStrainIds.length > 0) {
          tentStrains = await database.select().from(strains).where(sql`${strains.id} IN (${sql.join(uniqueStrainIds.map(id => sql`${id}`), sql`, `)})`);
        }
        
        // Buscar logs diários do tent durante o período do ciclo
        const logs = await database
          .select()
          .from(dailyLogs)
          .where(eq(dailyLogs.tentId, cycle.tentId))
          .orderBy(dailyLogs.logDate);
        
        // Buscar tarefas do tent durante o período do ciclo
        const tasks = await database
          .select()
          .from(taskInstances)
          .where(eq(taskInstances.tentId, cycle.tentId));
        
        return {
          cycle,
          tent: tent[0],
          strain: strain[0] || null,
          tentStrains,
          logs,
          tasks,
        };
      }),
  }),

  // Daily Logs (Registros Diários)
  dailyLogs: router({
    list: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getDailyLogs(input.tentId, input.limit);
      }),
    // getHistoricalWithTargets removido - usar getDailyLogs diretamente
    create: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          logDate: z.date(),
          turn: z.enum(["AM", "PM"]),
          tempC: z.string().optional().refine(
            (val) => !val || (parseFloat(val) >= -10 && parseFloat(val) <= 50),
            { message: "Temperatura deve estar entre -10°C e 50°C" }
          ),
          rhPct: z.string().optional().refine(
            (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
            { message: "Umidade deve estar entre 0% e 100%" }
          ),
          ppfd: z.number().optional().refine(
            (val) => !val || (val >= 0 && val <= 2000),
            { message: "PPFD deve estar entre 0 e 2000 µmol/m²/s" }
          ),
          ph: z.string().optional().refine(
            (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 14),
            { message: "pH deve estar entre 0 e 14" }
          ),
          ec: z.string().optional().refine(
            (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 5),
            { message: "EC deve estar entre 0 e 5 mS/cm" }
          ),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database.insert(dailyLogs).values(input);
        
        // Verificar alertas automaticamente
        const { checkAndNotifyAlerts } = await import("./alertChecker");
        await checkAndNotifyAlerts(input.tentId, {
          tempC: input.tempC,
          rhPct: input.rhPct,
          ppfd: input.ppfd,
        });
        
        return { success: true };
      }),
    getLatestByTent: publicProcedure
      .input(z.object({ tentId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const result = await database
          .select()
          .from(dailyLogs)
          .where(eq(dailyLogs.tentId, input.tentId))
          .orderBy(desc(dailyLogs.logDate))
          .limit(1);
        return result[0] || null;
      }),
    
    listAll: publicProcedure
      .input(
        z.object({
          tentId: z.number().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        let query = database
          .select({
            id: dailyLogs.id,
            tentId: dailyLogs.tentId,
            logDate: dailyLogs.logDate,
            turn: dailyLogs.turn,
            tempC: dailyLogs.tempC,
            rhPct: dailyLogs.rhPct,
            ppfd: dailyLogs.ppfd,
            ph: dailyLogs.ph,
            ec: dailyLogs.ec,
            notes: dailyLogs.notes,
            tentName: tents.name,
          })
          .from(dailyLogs)
          .leftJoin(tents, eq(dailyLogs.tentId, tents.id))
          .orderBy(desc(dailyLogs.logDate))
          .limit(input.limit)
          .offset(input.offset);
        
        // Apply filters
        const conditions = [];
        if (input.tentId) {
          conditions.push(eq(dailyLogs.tentId, input.tentId));
        }
        if (input.startDate) {
          conditions.push(sql`${dailyLogs.logDate} >= ${input.startDate}`);
        }
        if (input.endDate) {
          conditions.push(sql`${dailyLogs.logDate} <= ${input.endDate}`);
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        const logs = await query;
        
        // Get total count for pagination
        const countQuery = database
          .select({ count: sql<number>`count(*)` })
          .from(dailyLogs);
        
        if (conditions.length > 0) {
          countQuery.where(and(...conditions));
        }
        
        const countResult = await countQuery;
        const total = Number(countResult[0]?.count || 0);
        
        return {
          logs,
          total,
          hasMore: input.offset + logs.length < total,
        };
      }),
    
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          tempC: z.string().optional(),
          rhPct: z.string().optional(),
          ppfd: z.number().optional(),
          ph: z.string().optional(),
          ec: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        const { id, ...updateData } = input;
        
        await database
          .update(dailyLogs)
          .set(updateData)
          .where(eq(dailyLogs.id, id));
        
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        await database
          .delete(dailyLogs)
          .where(eq(dailyLogs.id, input.id));
        
        return { success: true };
      }),
  }),

  // Alerts (Alertas)
  alerts: router({
    // Configurações de alertas
    getSettings: publicProcedure
      .input(z.object({ tentId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const settings = await database
          .select()
          .from(alertSettings)
          .where(eq(alertSettings.tentId, input.tentId))
          .limit(1);
        return settings[0] || null;
      }),
    
    getIdealValues: publicProcedure
      .input(z.object({ tentId: z.number() }))
      .query(async ({ input }) => {
        return db.getIdealValuesByTent(input.tentId);
      }),
    
    updateSettings: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          alertsEnabled: z.boolean().optional(),
          tempEnabled: z.boolean().optional(),
          rhEnabled: z.boolean().optional(),
          ppfdEnabled: z.boolean().optional(),
          phEnabled: z.boolean().optional(),
          tempMargin: z.number().optional(),
          rhMargin: z.number().optional(),
          ppfdMargin: z.number().optional(),
          phMargin: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Verificar se já existe configuração
        const existing = await database
          .select()
          .from(alertSettings)
          .where(eq(alertSettings.tentId, input.tentId))
          .limit(1);
        
        if (existing.length > 0) {
          // Atualizar existente
          await database
            .update(alertSettings)
            .set({
              alertsEnabled: input.alertsEnabled,
              tempEnabled: input.tempEnabled,
              rhEnabled: input.rhEnabled,
              ppfdEnabled: input.ppfdEnabled,
              phEnabled: input.phEnabled,
              tempMargin: input.tempMargin !== undefined ? String(input.tempMargin) : undefined,
              rhMargin: input.rhMargin !== undefined ? String(input.rhMargin) : undefined,
              ppfdMargin: input.ppfdMargin !== undefined ? input.ppfdMargin : undefined,
              phMargin: input.phMargin !== undefined ? String(input.phMargin) : undefined,
            })
            .where(eq(alertSettings.tentId, input.tentId));
        } else {
          // Criar nova
          await database.insert(alertSettings).values({
            tentId: input.tentId,
            alertsEnabled: input.alertsEnabled ?? true,
            tempEnabled: input.tempEnabled ?? true,
            rhEnabled: input.rhEnabled ?? true,
            ppfdEnabled: input.ppfdEnabled ?? true,
            phEnabled: input.phEnabled ?? false,
            tempMargin: input.tempMargin !== undefined ? String(input.tempMargin) : "2",
            rhMargin: input.rhMargin !== undefined ? String(input.rhMargin) : "5",
            ppfdMargin: input.ppfdMargin ?? 50,
            phMargin: input.phMargin !== undefined ? String(input.phMargin) : "0.2",
          });
        }
        
        return { success: true };
      }),
    
    // Histórico de alertas
    getHistory: publicProcedure
      .input(
        z.object({
          tentId: z.number().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        if (input.tentId) {
          return database
            .select()
            .from(alertHistory)
            .where(eq(alertHistory.tentId, input.tentId))
            .orderBy(desc(alertHistory.createdAt))
            .limit(input.limit);
        }
        
        return database
          .select()
          .from(alertHistory)
          .orderBy(desc(alertHistory.createdAt))
          .limit(input.limit);
      }),
    
    list: publicProcedure
      .input(
        z.object({
          tentId: z.number().optional(),
          status: z.enum(["NEW", "SEEN"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getAlerts(input.tentId, input.status);
      }),
    getNewCount: publicProcedure
      .input(z.object({ tentId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getNewAlertsCount(input.tentId);
      }),
    markAsSeen: publicProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database.update(alerts).set({ status: "SEEN" }).where(eq(alerts.id, input.alertId));
        return { success: true };
      }),
    
    checkAlerts: publicProcedure
      .input(z.object({ tentId: z.number() }))
      .mutation(async ({ input }) => {
        return db.checkAlertsForTent(input.tentId);
      }),
    
    checkAllTents: publicProcedure
      .mutation(async () => {
        const { checkAllTentsAlerts } = await import("./cron/alertsChecker");
        return checkAllTentsAlerts();
      }),
    
    // Phase Alert Margins (Margens de Alertas por Fase)
    getPhaseMargins: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      const { phaseAlertMargins } = await import("../drizzle/schema");
      return database.select().from(phaseAlertMargins).orderBy(phaseAlertMargins.phase);
    }),
    
    updatePhaseMargin: publicProcedure
      .input(
        z.object({
          phase: z.enum(["MAINTENANCE", "CLONING", "VEGA", "FLORA", "DRYING"]),
          tempMargin: z.number().optional(),
          rhMargin: z.number().optional(),
          ppfdMargin: z.number().optional(),
          phMargin: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        const { phaseAlertMargins } = await import("../drizzle/schema");
        
        await database
          .update(phaseAlertMargins)
          .set({
            tempMargin: input.tempMargin !== undefined ? String(input.tempMargin) : undefined,
            rhMargin: input.rhMargin !== undefined ? String(input.rhMargin) : undefined,
            ppfdMargin: input.ppfdMargin !== undefined ? input.ppfdMargin : undefined,
            phMargin: input.phMargin !== undefined ? String(input.phMargin) : undefined,
          })
          .where(eq(phaseAlertMargins.phase, input.phase));
        
        return { success: true };
      }),
    
    // Notification Settings (Configurações de Notificações)
    getNotificationSettings: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) return null;
      const { notificationSettings } = await import("../drizzle/schema");
      
      // Pegar primeira configuração (sem autenticação)
      const settings = await database
        .select()
        .from(notificationSettings)
        .limit(1);
      
      return settings[0] || null;
    }),
    
    updateNotificationSettings: publicProcedure
      .input(
        z.object({
          tempAlertsEnabled: z.boolean().optional(),
          rhAlertsEnabled: z.boolean().optional(),
          ppfdAlertsEnabled: z.boolean().optional(),
          phAlertsEnabled: z.boolean().optional(),
          taskRemindersEnabled: z.boolean().optional(),
          dailySummaryEnabled: z.boolean().optional(),
          dailySummaryTime: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        const { notificationSettings } = await import("../drizzle/schema");
        
        // Verificar se já existe configuração
        const existing = await database
          .select()
          .from(notificationSettings)
          .limit(1);
        
        if (existing.length > 0) {
          // Atualizar existente (primeira configuração)
          await database
            .update(notificationSettings)
            .set(input)
            .where(eq(notificationSettings.id, existing[0].id));
        } else {
          // Criar nova
          await database.insert(notificationSettings).values(input);
        }
        
        return { success: true };
      }),
  }),

  // Weekly Targets (Padrões Semanais)
  weeklyTargets: router({
    get: publicProcedure
      .input(
        z.object({
          phase: z.enum(["vega", "flora"]),
          weekNumber: z.number(),
        })
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return null;
        
        // Converte para uppercase para match com o enum do banco
        const phaseUpper = input.phase.toUpperCase() as "VEGA" | "FLORA";
        
        // Busca targets genéricos (pode ser de qualquer strain)
        // Para calculadora genérica, retorna valores padrão baseados na fase/semana
        const targets = await database
          .select()
          .from(weeklyTargets)
          .where(
            and(
              eq(weeklyTargets.phase, phaseUpper),
              eq(weeklyTargets.weekNumber, input.weekNumber)
            )
          )
          .limit(1);
        
        // Se não encontrar targets específicos, retorna valores padrão
        if (targets.length === 0) {
          // Valores padrão de EC por fase e semana
          const defaultEC = input.phase === "vega" 
            ? 1.0 + (input.weekNumber - 1) * 0.2 // Vega: 1.0 a 2.0
            : 1.6 + (input.weekNumber - 1) * 0.15; // Flora: 1.6 a 2.65
          
          return {
            targetEC: Math.min(defaultEC, input.phase === "vega" ? 2.0 : 2.8).toFixed(1),
            phase: phaseUpper,
            weekNumber: input.weekNumber,
          };
        }
        
        // Retorna o target encontrado com targetEC calculado da média de ecMin e ecMax
        const target = targets[0];
        const ecMin = parseFloat(target.ecMin || "0");
        const ecMax = parseFloat(target.ecMax || "0");
        const targetEC = ecMax > 0 ? ((ecMin + ecMax) / 2).toFixed(1) : "1.5";
        
        return {
          ...target,
          targetEC,
        };
      }),
    getTargetsByWeek: publicProcedure
      .input(
        z.object({
          strainId: z.number(),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE"]),
          weekNumber: z.number(),
        })
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return null;
        
        const targets = await database
          .select()
          .from(weeklyTargets)
          .where(
            and(
              eq(weeklyTargets.strainId, input.strainId),
              eq(weeklyTargets.phase, input.phase),
              eq(weeklyTargets.weekNumber, input.weekNumber)
            )
          )
          .limit(1);
        
        return targets[0] || null;
      }),
    // Busca targets por estufa - calcula média das strains das plantas ativas
    getTargetsByTent: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE"]),
          weekNumber: z.number(),
        })
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return null;
        
        // Buscar strains únicas das plantas ativas na estufa
        const tentPlants = await database
          .select({ strainId: plants.strainId })
          .from(plants)
          .where(and(
            eq(plants.currentTentId, input.tentId),
            eq(plants.status, "ACTIVE")
          ));
        
        const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId))) as number[];
        if (uniqueStrainIds.length === 0) return null;
        
        if (uniqueStrainIds.length === 1) {
          // Uma única strain: retornar targets direto
          const targets = await database
            .select()
            .from(weeklyTargets)
            .where(
              and(
                eq(weeklyTargets.strainId, uniqueStrainIds[0]),
                eq(weeklyTargets.phase, input.phase),
                eq(weeklyTargets.weekNumber, input.weekNumber)
              )
            )
            .limit(1);
          return targets[0] || null;
        }
        
        // Múltiplas strains: calcular média
        const allTargets = await database
          .select()
          .from(weeklyTargets)
          .where(
            and(
              sql`${weeklyTargets.strainId} IN (${sql.join(uniqueStrainIds.map((id: number) => sql`${id}`), sql`, `)})`,
              eq(weeklyTargets.phase, input.phase),
              eq(weeklyTargets.weekNumber, input.weekNumber)
            )
          );
        
        if (allTargets.length === 0) return null;
        
        // Calcular média
        const avgDecimal = (field: string) => {
          const vals = allTargets.map((t: any) => t[field]).filter((v: any) => v !== null && v !== undefined);
          if (vals.length === 0) return null;
          const sum = vals.reduce((a: number, b: any) => a + parseFloat(String(b)), 0);
          return (sum / vals.length).toFixed(1);
        };
        const avgInt = (field: string) => {
          const vals = allTargets.map((t: any) => t[field]).filter((v: any) => v !== null && v !== undefined);
          if (vals.length === 0) return null;
          const sum = vals.reduce((a: number, b: any) => a + Number(b), 0);
          return Math.round(sum / vals.length);
        };
        
        return {
          ...allTargets[0],
          tempMin: avgDecimal('tempMin'),
          tempMax: avgDecimal('tempMax'),
          rhMin: avgDecimal('rhMin'),
          rhMax: avgDecimal('rhMax'),
          ppfdMin: avgInt('ppfdMin'),
          ppfdMax: avgInt('ppfdMax'),
          phMin: avgDecimal('phMin'),
          phMax: avgDecimal('phMax'),
          ecMin: avgDecimal('ecMin'),
          ecMax: avgDecimal('ecMax'),
          _isAverage: true,
          _strainCount: uniqueStrainIds.length,
        };
      }),
    getCurrentWeekTargets: publicProcedure.query(async () => {
      // Busca os targets da semana atual de todos os ciclos ativos
      const database = await getDb();
      if (!database) return [];

      const activeCycles = await database
        .select()
        .from(cycles)
        .where(eq(cycles.status, "ACTIVE"));

      if (activeCycles.length === 0) return [];

      // Pega o primeiro ciclo ativo para mostrar os targets
      const cycle = activeCycles[0];
      
      // Calcula a fase e semana atual
      const now = new Date();
      const startDate = new Date(cycle.startDate);
      const floraStartDate = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;
      
      let phase: "VEGA" | "FLORA" = "VEGA";
      let weekNumber = 1;
      
      if (floraStartDate && now >= floraStartDate) {
        phase = "FLORA";
        const weeksSinceFlora = Math.floor((now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        weekNumber = Math.min(weeksSinceFlora + 1, 8);
      } else {
        const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        weekNumber = Math.min(weeksSinceStart + 1, 6);
      }
      
      // Busca os targets da semana atual
      if (cycle.strainId) {
        // Ciclo com strain definida
        const targets = await database
          .select()
          .from(weeklyTargets)
          .where(
            and(
              eq(weeklyTargets.strainId, cycle.strainId),
              eq(weeklyTargets.phase, phase),
              eq(weeklyTargets.weekNumber, weekNumber)
            )
          )
          .limit(1);
        return targets;
      } else {
        // Ciclo sem strain: buscar strains das plantas ativas
        const tentPlants = await database
          .select({ strainId: plants.strainId })
          .from(plants)
          .where(and(
            eq(plants.currentTentId, cycle.tentId),
            eq(plants.status, "ACTIVE")
          ));
        const uniqueStrainIds = Array.from(new Set(tentPlants.map((p: any) => p.strainId))) as number[];
        if (uniqueStrainIds.length === 0) return [];
        
        const allTargets = await database
          .select()
          .from(weeklyTargets)
          .where(
            and(
              sql`${weeklyTargets.strainId} IN (${sql.join(uniqueStrainIds.map((id: number) => sql`${id}`), sql`, `)})`,
              eq(weeklyTargets.phase, phase),
              eq(weeklyTargets.weekNumber, weekNumber)
            )
          );
        
        if (allTargets.length === 0) return [];
        if (uniqueStrainIds.length === 1) return [allTargets[0]];
        
        // Média
        const avgDec = (f: string) => {
          const v = allTargets.map((t: any) => t[f]).filter((x: any) => x != null);
          return v.length ? (v.reduce((a: number, b: any) => a + parseFloat(String(b)), 0) / v.length).toFixed(1) : null;
        };
        const avgI = (f: string) => {
          const v = allTargets.map((t: any) => t[f]).filter((x: any) => x != null);
          return v.length ? Math.round(v.reduce((a: number, b: any) => a + Number(b), 0) / v.length) : null;
        };
        return [{
          ...allTargets[0],
          tempMin: avgDec('tempMin'), tempMax: avgDec('tempMax'),
          rhMin: avgDec('rhMin'), rhMax: avgDec('rhMax'),
          ppfdMin: avgI('ppfdMin'), ppfdMax: avgI('ppfdMax'),
          phMin: avgDec('phMin'), phMax: avgDec('phMax'),
          ecMin: avgDec('ecMin'), ecMax: avgDec('ecMax'),
        }];
      }
    }),
    getByStrain: publicProcedure.input(z.object({ strainId: z.number() })).query(async ({ input }) => {
      return db.getWeeklyTargetsByStrain(input.strainId);
    }),
    create: publicProcedure
      .input(
        z.object({
          strainId: z.number(),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE"]),
          weekNumber: z.number(),
          tempMin: z.string().optional(),
          tempMax: z.string().optional(),
          rhMin: z.string().optional(),
          rhMax: z.string().optional(),
          ppfdMin: z.number().optional(),
          ppfdMax: z.number().optional(),
          photoperiod: z.string().optional(),
          phMin: z.string().optional(),
          phMax: z.string().optional(),
          ecMin: z.string().optional(),
          ecMax: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database.insert(weeklyTargets).values(input);
        return { success: true };
      }),
  }),

  // Task Instances (Tarefas)
  tasks: router({
    list: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return db.getTaskInstances(input.tentId);
      }),
    getTasksByTent: publicProcedure
      .input(z.object({ tentId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];

        // Get current active cycle for this tent
        const cycle = await db.getCycleByTentId(input.tentId);
        if (!cycle) return [];

        // Get tent info
        const tent = await db.getTentById(input.tentId);
        if (!tent) return [];

        // Calculate current phase and week
        const now = new Date();
        const startDate = new Date(cycle.startDate);
        const floraStartDate = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;

        let currentPhase: "CLONING" | "VEGA" | "FLORA" | "MAINTENANCE" | "DRYING";
        let weekNumber: number;

        // Determine phase based on tent category
        if (tent.category === "MAINTENANCE") {
          currentPhase = "MAINTENANCE";
          weekNumber = 1;
        } else if (tent.category === "VEGA") {
          currentPhase = "VEGA";
          const weeksSinceStart = Math.floor(
            (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          weekNumber = weeksSinceStart + 1;
        } else if (tent.category === "FLORA") {
          currentPhase = "FLORA";
          const weeksSinceStart = floraStartDate
            ? Math.floor((now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
            : Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          weekNumber = weeksSinceStart + 1;
        } else if (tent.category === "DRYING") {
          currentPhase = "DRYING";
          const weeksSinceStart = Math.floor(
            (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          weekNumber = Math.min(weeksSinceStart + 1, 2); // Máximo 2 semanas de secagem
        } else {
          // Fallback
          currentPhase = "MAINTENANCE";
          weekNumber = 1;
        }

        // Get templates for this phase/week
        const context = tent.category === "MAINTENANCE" ? "TENT_A" : "TENT_BC";
        let templates;
        if (currentPhase === "MAINTENANCE" || currentPhase === "DRYING") {
          // For maintenance and drying, don't filter by week number
          templates = await database
            .select()
            .from(taskTemplates)
            .where(
              and(
                eq(taskTemplates.context, context),
                eq(taskTemplates.phase, currentPhase)
              )
            );
        } else {
          templates = await database
            .select()
            .from(taskTemplates)
            .where(
              and(
                eq(taskTemplates.context, context),
                eq(taskTemplates.phase, currentPhase),
                eq(taskTemplates.weekNumber, weekNumber)
              )
            );
        }

        const tasks = [];
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        for (const template of templates) {
          // Check if instance already exists for this week
          const existing = await database
            .select()
            .from(taskInstances)
            .where(
              and(
                eq(taskInstances.tentId, input.tentId),
                eq(taskInstances.taskTemplateId, template.id),
                eq(taskInstances.occurrenceDate, startOfWeek)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            // Create instance
            await database.insert(taskInstances).values({
              tentId: input.tentId,
              taskTemplateId: template.id,
              occurrenceDate: startOfWeek,
              isDone: false,
            });

            tasks.push({
              id: 0, // Will be fetched
              title: template.title,
              description: template.description,
              phase: currentPhase,
              weekNumber,
              isDone: false,
              completedAt: null,
              notes: null,
            });
          } else {
            tasks.push({
              id: existing[0].id,
              title: template.title,
              description: template.description,
              phase: currentPhase,
              weekNumber,
              isDone: existing[0].isDone,
              completedAt: existing[0].completedAt,
              notes: existing[0].notes,
            });
          }
        }

        return tasks;
      }),
    getPendingTasks: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all active cycles
      const allCycles = await db.getAllCycles();
      const activeCycles = allCycles.filter((c: any) => c.status === "ACTIVE");
      const pendingTasks: any[] = [];

      for (const cycle of activeCycles) {
        // Get tent info
        const tent = await database.select().from(tents).where(eq(tents.id, cycle.tentId)).limit(1);
        if (tent.length === 0) continue;

        // Get all incomplete tasks for this tent in current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const incompleteTasks = await database
          .select()
          .from(taskInstances)
          .leftJoin(taskTemplates, eq(taskInstances.taskTemplateId, taskTemplates.id))
          .where(
            and(
              eq(taskInstances.tentId, cycle.tentId),
              eq(taskInstances.isDone, false),
              eq(taskInstances.occurrenceDate, startOfWeek)
            )
          );

        for (const task of incompleteTasks) {
          pendingTasks.push({
            id: task.task_instances.id,
            tentId: cycle.tentId,
            tentName: tent[0].name,
            title: task.task_templates?.title || "Tarefa",
            description: task.task_templates?.description || "",
            occurrenceDate: task.task_instances.occurrenceDate,
          });
        }
      }

      return pendingTasks;
    }),
    getCurrentWeekTasks: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all active cycles
      const allCycles = await db.getAllCycles();
      const activeCycles = allCycles.filter((c: any) => c.status === "ACTIVE");
      const allTasks: any[] = [];

      for (const cycle of activeCycles) {
        // Calculate current phase and week
        const now = new Date();
        const startDate = new Date(cycle.startDate);
        const floraStartDate = cycle.floraStartDate ? new Date(cycle.floraStartDate) : null;

        let currentPhase: "VEGA" | "FLORA" | "MAINTENANCE" | "DRYING";
        let weekNumber: number | null;
        let context: "TENT_BC" | "TENT_A";

        // Get tent info to check category
        const tent = await database.select().from(tents).where(eq(tents.id, cycle.tentId)).limit(1);
        const tentCategory = tent[0]?.category;
        
        // Determine phase based on tent category
        if (tentCategory === "MAINTENANCE") {
          currentPhase = "MAINTENANCE";
          weekNumber = null;
          context = "TENT_A";
        } else if (tentCategory === "DRYING") {
          currentPhase = "DRYING";
          weekNumber = null;
          context = "TENT_BC";
        } else if (tentCategory === "FLORA") {
          currentPhase = "FLORA";
          const weeksSinceFlora = floraStartDate
            ? Math.floor((now.getTime() - floraStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
            : Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          weekNumber = weeksSinceFlora + 1;
          context = "TENT_BC";
        } else if (tentCategory === "VEGA") {
          currentPhase = "VEGA";
          const weeksSinceStart = Math.floor(
            (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          weekNumber = weeksSinceStart + 1;
          context = "TENT_BC";
        } else {
          // Fallback
          currentPhase = "MAINTENANCE";
          weekNumber = null;
          context = "TENT_A";
        }

        // Get templates for this phase/week
        let templates;
        if (currentPhase === "MAINTENANCE" || currentPhase === "DRYING") {
          // For maintenance and drying, get tasks without week number filter
          templates = await database
            .select()
            .from(taskTemplates)
            .where(
              and(
                eq(taskTemplates.context, context),
                eq(taskTemplates.phase, currentPhase)
              )
            );
        } else {
          // For VEGA/FLORA, filter by week number
          templates = await database
            .select()
            .from(taskTemplates)
            .where(
              and(
                eq(taskTemplates.context, context),
                eq(taskTemplates.phase, currentPhase),
                eq(taskTemplates.weekNumber, weekNumber!)
              )
            );
        }

        for (const template of templates) {
          // Check if instance already exists for this week
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const existing = await database
            .select()
            .from(taskInstances)
            .where(
              and(
                eq(taskInstances.tentId, cycle.tentId),
                eq(taskInstances.taskTemplateId, template.id),
                eq(taskInstances.occurrenceDate, startOfWeek)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            // Create instance
            await database.insert(taskInstances).values({
              tentId: cycle.tentId,
              taskTemplateId: template.id,
              occurrenceDate: startOfWeek,
              isDone: false,
            });

            // Fetch the created instance to get the ID
            const created = await database
              .select()
              .from(taskInstances)
              .where(
                and(
                  eq(taskInstances.tentId, cycle.tentId),
                  eq(taskInstances.taskTemplateId, template.id),
                  eq(taskInstances.occurrenceDate, startOfWeek)
                )
              )
              .limit(1);

            allTasks.push({
              id: created[0]?.id || 0,
              tentId: cycle.tentId,
              tentName: tent[0]?.name || `Estufa ${cycle.tentId}`,
              title: template.title,
              description: template.description,
              phase: currentPhase,
              weekNumber,
              isDone: false,
              completedAt: null,
              notes: null,
            });
          } else {
            allTasks.push({
              id: existing[0].id,
              tentId: cycle.tentId,
              tentName: tent[0]?.name || `Estufa ${cycle.tentId}`,
              title: template.title,
              description: template.description,
              phase: currentPhase,
              weekNumber,
              isDone: existing[0].isDone,
              completedAt: existing[0].completedAt,
              notes: existing[0].notes,
            });
          }
        }
      }

      return allTasks;
    }),
    markAsDone: publicProcedure
      .input(
        z.object({
          taskId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database
          .update(taskInstances)
          .set({ isDone: true, completedAt: new Date(), notes: input.notes })
          .where(eq(taskInstances.id, input.taskId));
        return { success: true };
      }),
    toggleTask: publicProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        
        // Get current state
        const task = await database
          .select()
          .from(taskInstances)
          .where(eq(taskInstances.id, input.taskId))
          .limit(1);
        
        if (task.length === 0) throw new Error("Task not found");
        
        const newIsDone = !task[0].isDone;
        await database
          .update(taskInstances)
          .set({ 
            isDone: newIsDone, 
            completedAt: newIsDone ? new Date() : null 
          })
          .where(eq(taskInstances.id, input.taskId));
        
        return { success: true, isDone: newIsDone };
      }),
    delete: publicProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }
        await database.delete(taskInstances).where(eq(taskInstances.id, input.taskId));
        return { success: true };
      }),
  }),


  // Tent A (Estufa A - Clonagem)
  tentA: router({
    getState: publicProcedure.input(z.object({ tentId: z.number() })).query(async ({ input }) => {
      return db.getTentAState(input.tentId);
    }),
    startCloning: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          startDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error("Banco de dados não inicializado. Execute 'pnpm db:push' para criar as tabelas.");
        }

        // Calcular end date (start + 13 dias = 14 dias totais)
        const endDate = new Date(input.startDate);
        endDate.setDate(endDate.getDate() + 13);

        // Criar evento de clonagem
        await database.insert(cloningEvents).values({
          tentId: input.tentId,
          startDate: input.startDate,
          endDate: endDate,
          status: "ACTIVE",
        });

        // Atualizar estado da estufa A
        await database
          .update(tentAState)
          .set({
            mode: "CLONING",
            activeCloningEventId: null,
          })
          .where(eq(tentAState.tentId, input.tentId));

        return { success: true };
      }),
  }),

  // Calculations (Histórico de Cálculos)

  // Database (Exportação de Banco de Dados)
  database: router({
    export: publicProcedure.query(async () => {
      const { generateSQLDump } = await import("./databaseExport");
      const sqlDump = await generateSQLDump();
      return { sql: sqlDump };
    }),
    import: publicProcedure
      .input(z.object({ sqlContent: z.string() }))
      .mutation(async ({ input }) => {
        const { importSQLDump } = await import("./databaseImport");
        const result = await importSQLDump(input.sqlContent);
        return result;
      }),
  }),

  // Notifications (Notificações)
  notifications: router({
    getHistory: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const history = await database
        .select()
        .from(notificationHistory)
        .orderBy(desc(notificationHistory.sentAt))
        .limit(100);
      return history;
    }),
    create: publicProcedure
      .input(
        z.object({
          type: z.enum(["daily_reminder", "environment_alert", "task_reminder"]),
          title: z.string(),
          message: z.string(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [notification] = await database
          .insert(notificationHistory)
          .values({
            type: input.type,
            title: input.title,
            message: input.message,
            metadata: input.metadata,
          });
        return notification;
      }),
    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database
          .update(notificationHistory)
          .set({ isRead: true })
          .where(eq(notificationHistory.id, input.id));
        return { success: true };
      }),
  }),

  // Plants (Plantas Individuais)
  plants: router({
    // Criar nova planta
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        code: z.string().optional(),
        strainId: z.number(),
        currentTentId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const result = await database.insert(plants).values({
          name: input.name,
          code: input.code,
          strainId: input.strainId,
          currentTentId: input.currentTentId,
          notes: input.notes,
          status: "ACTIVE",
        });
        
        // Retornar o ID inserido
        return { id: result.insertId };
      }),

    // Listar plantas
    list: publicProcedure
      .input(z.object({
        tentId: z.number().optional(),
        strainId: z.number().optional(),
        status: z.enum(["ACTIVE", "HARVESTED", "DEAD", "DISCARDED"]).optional(),
      }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        let query = database.select().from(plants);
        
        if (input.tentId) {
          query = query.where(eq(plants.currentTentId, input.tentId)) as any;
        }
        if (input.strainId) {
          query = query.where(eq(plants.strainId, input.strainId)) as any;
        }
        if (input.status) {
          query = query.where(eq(plants.status, input.status)) as any;
        }
        
        const plantsList = await query;
        
        // Para cada planta, buscar última foto de saúde, status de saúde e fase do ciclo
        const plantsWithDetails = await Promise.all(
          plantsList.map(async (plant: any) => {
            // Última foto de saúde
            const [lastHealthPhoto] = await database
              .select()
              .from(plantHealthLogs)
              .where(eq(plantHealthLogs.plantId, plant.id))
              .orderBy(desc(plantHealthLogs.logDate))
              .limit(1);
            
            // Último status de saúde
            const [lastHealth] = await database
              .select()
              .from(plantHealthLogs)
              .where(eq(plantHealthLogs.plantId, plant.id))
              .orderBy(desc(plantHealthLogs.logDate))
              .limit(1);
            
            // Buscar ciclo ativo da estufa
            const [activeCycle] = await database
              .select()
              .from(cycles)
              .where(and(
                eq(cycles.tentId, plant.currentTentId),
                eq(cycles.status, "ACTIVE")
              ))
              .limit(1);
            
            // Calcular fase e semana do ciclo
            let cyclePhase = null;
            let cycleWeek = null;
            
            if (activeCycle) {
              const now = new Date();
              const startDate = new Date(activeCycle.startDate);
              const floraStartDate = activeCycle.floraStartDate ? new Date(activeCycle.floraStartDate) : null;
              
              if (floraStartDate && now >= floraStartDate) {
                // Está em FLORA
                cyclePhase = "FLORA";
                const daysInFlora = Math.floor((now.getTime() - floraStartDate.getTime()) / (1000 * 60 * 60 * 24));
                cycleWeek = Math.floor(daysInFlora / 7) + 1;
              } else {
                // Está em VEGA
                cyclePhase = "VEGA";
                const daysInVega = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                cycleWeek = Math.floor(daysInVega / 7) + 1;
              }
            }
            
            return {
              ...plant,
              lastHealthPhotoUrl: lastHealthPhoto?.photoUrl || null,
              lastHealthStatus: lastHealth?.healthStatus || null,
              cyclePhase,
              cycleWeek,
            };
          })
        );
        
        return plantsWithDetails;
      }),

    // Obter planta por ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const [plant] = await database
          .select()
          .from(plants)
          .where(eq(plants.id, input.id));
        
        return plant;
      }),

    // Atualizar planta
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .update(plants)
          .set({
            name: input.name,
            code: input.code,
            notes: input.notes,
          })
          .where(eq(plants.id, input.id));
        
        return { success: true };
      }),

    // Mover planta para outra estufa
    moveTent: publicProcedure
      .input(z.object({
        plantId: z.number(),
        toTentId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Buscar estufa atual
        const [plant] = await database
          .select()
          .from(plants)
          .where(eq(plants.id, input.plantId));
        
        if (!plant) throw new Error("Plant not found");
        
        // Registrar histórico
        await database.insert(plantTentHistory).values({
          plantId: input.plantId,
          fromTentId: plant.currentTentId,
          toTentId: input.toTentId,
          reason: input.reason,
        });
        
        // Atualizar estufa atual
        await database
          .update(plants)
          .set({ currentTentId: input.toTentId })
          .where(eq(plants.id, input.plantId));
        
        return { success: true };
      }),

    // Transplantar para Flora (encontra automaticamente estufa de Flora)
    transplantToFlora: publicProcedure
      .input(z.object({
        plantId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Buscar planta atual
        const [plant] = await database
          .select()
          .from(plants)
          .where(eq(plants.id, input.plantId));
        
        if (!plant) throw new Error("Plant not found");
        
        // Buscar estufa de Flora (ciclo ativo em fase FLORA)
        const [floraTent] = await database
          .select({
            tentId: cycles.tentId,
            tentName: tents.name,
          })
          .from(cycles)
          .innerJoin(tents, eq(cycles.tentId, tents.id))
          .where(and(
            eq(cycles.status, "ACTIVE"),
            isNotNull(cycles.floraStartDate)
          ))
          .limit(1);
        
        if (!floraTent) {
          throw new Error("Nenhuma estufa de Flora ativa encontrada");
        }
        
        // Registrar histórico
        await database.insert(plantTentHistory).values({
          plantId: input.plantId,
          fromTentId: plant.currentTentId,
          toTentId: floraTent.tentId,
          reason: "Transplante para Flora",
        });
        
        // Atualizar estufa atual
        await database
          .update(plants)
          .set({ currentTentId: floraTent.tentId })
          .where(eq(plants.id, input.plantId));
        
        return { success: true, tentName: floraTent.tentName };
      }),

    // Finalizar planta (harvest)
    finish: publicProcedure
      .input(z.object({
        plantId: z.number(),
        status: z.enum(["HARVESTED", "DEAD"]),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .update(plants)
          .set({ status: input.status })
          .where(eq(plants.id, input.plantId));
        
        return { success: true };
      }),

    // Descartar planta (doente ou com problemas)
    discard: publicProcedure
      .input(z.object({
        plantId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Atualizar status para DISCARDED
        await database
          .update(plants)
          .set({ 
            status: "DISCARDED",
            notes: input.reason ? `Descartada: ${input.reason}` : "Descartada"
          })
          .where(eq(plants.id, input.plantId));
        
        return { success: true };
      }),

    // Excluir planta permanentemente
    delete: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Delete all related records first (cascade)
        await database.delete(plantObservations).where(eq(plantObservations.plantId, input.plantId));
        await database.delete(plantPhotos).where(eq(plantPhotos.plantId, input.plantId));
        await database.delete(plantRunoffLogs).where(eq(plantRunoffLogs.plantId, input.plantId));
        await database.delete(plantHealthLogs).where(eq(plantHealthLogs.plantId, input.plantId));
        await database.delete(plantTrichomeLogs).where(eq(plantTrichomeLogs.plantId, input.plantId));
        await database.delete(plantLSTLogs).where(eq(plantLSTLogs.plantId, input.plantId));
        await database.delete(plantTentHistory).where(eq(plantTentHistory.plantId, input.plantId));
        
        // Delete the plant itself
        await database.delete(plants).where(eq(plants.id, input.plantId));
        
        return { success: true };
      }),

    // Buscar fotos da planta
    getPhotos: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const photos = await database
          .select()
          .from(plantPhotos)
          .where(eq(plantPhotos.plantId, input.plantId))
          .orderBy(desc(plantPhotos.createdAt));
        
        return photos;
      }),

    // Upload foto da planta
    uploadPhoto: publicProcedure
      .input(z.object({
        plantId: z.number(),
        imageData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Converter base64 para Buffer
        const base64Data = input.imageData.split(',')[1] || input.imageData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Salvar localmente em uploads/
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Criar diretórios se não existirem
        const uploadsDir = path.join(process.cwd(), 'uploads', 'plants');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Gerar nome único para o arquivo
        const extension = input.mimeType.split('/')[1];
        const filename = `${input.plantId}-${Date.now()}.${extension}`;
        const filePath = path.join(uploadsDir, filename);
        const fileKey = `plants/${filename}`;
        
        // Salvar arquivo
        await fs.writeFile(filePath, buffer);
        
        // Gerar URL local
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const url = `${baseUrl}/uploads/plants/${filename}`;
        
        // Salvar no banco
        const [photo] = await database
          .insert(plantPhotos)
          .values({
            plantId: input.plantId,
            url,
            fileKey,
          })
          .returning();
        
        return photo;
      }),

    // Excluir foto da planta
    deletePhoto: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .delete(plantPhotos)
          .where(eq(plantPhotos.id, input.id));
        
        return { success: true };
      }),
  }),

  // Plant Observations
  plantObservations: router({
    create: publicProcedure
      .input(z.object({
        plantId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.insert(plantObservations).values({
          plantId: input.plantId,
          content: input.content,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantObservations)
          .where(eq(plantObservations.plantId, input.plantId))
          .orderBy(desc(plantObservations.observationDate));
      }),
  }),

  // Plant Photos
  plantPhotos: router({
    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantPhotos)
          .where(eq(plantPhotos.plantId, input.plantId))
          .orderBy(desc(plantPhotos.photoDate));
      }),
    
    upload: publicProcedure
      .input(z.object({
        plantId: z.number(),
        photoUrl: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.insert(plantPhotos).values({
          plantId: input.plantId,
          photoUrl: input.photoUrl,
          description: input.description,
          photoDate: new Date(),
        });
        
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ photoId: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .delete(plantPhotos)
          .where(eq(plantPhotos.id, input.photoId));
        
        return { success: true };
      }),
  }),

  // Plant Runoff Logs
  plantRunoff: router({
    create: publicProcedure
      .input(z.object({
        plantId: z.number(),
        volumeIn: z.number(),
        volumeOut: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const runoffPercent = (input.volumeOut / input.volumeIn) * 100;
        
        await database.insert(plantRunoffLogs).values({
          plantId: input.plantId,
          volumeIn: input.volumeIn.toString(),
          volumeOut: input.volumeOut.toString(),
          runoffPercent: runoffPercent.toFixed(2),
          notes: input.notes,
        });
        
        return { success: true, runoffPercent };
      }),

    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantRunoffLogs)
          .where(eq(plantRunoffLogs.plantId, input.plantId))
          .orderBy(desc(plantRunoffLogs.logDate));
      }),
  }),

  // Plant Health Logs
  plantHealth: router({
    create: publicProcedure
      .input(z.object({
        plantId: z.number(),
        healthStatus: z.enum(["HEALTHY", "STRESSED", "SICK", "RECOVERING"]),
        symptoms: z.string().optional(),
        treatment: z.string().optional(),
        notes: z.string().optional(),
        photoBase64: z.string().optional(), // Base64 da foto para upload local
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        let photoUrl: string | undefined;
        let photoKey: string | undefined;

        // Se tem foto, fazer upload local
        if (input.photoBase64) {
          try {
            // Converter base64 para buffer
            const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Criar diretórios se não existirem
            const uploadsDir = path.join(process.cwd(), 'uploads', 'health');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(7);
            const filename = `${input.plantId}-${timestamp}-${randomSuffix}.jpg`;
            const filePath = path.join(uploadsDir, filename);
            photoKey = `health/${filename}`;
            
            // Salvar arquivo
            await fs.writeFile(filePath, buffer);
            
            // Gerar URL local
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            photoUrl = `${baseUrl}/uploads/health/${filename}`;
          } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            // Continua sem a foto se o upload falhar
          }
        }
        
        await database.insert(plantHealthLogs).values({
          plantId: input.plantId,
          healthStatus: input.healthStatus,
          symptoms: input.symptoms,
          treatment: input.treatment,
          notes: input.notes,
          photoUrl,
          photoKey,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantHealthLogs)
          .where(eq(plantHealthLogs.plantId, input.plantId))
          .orderBy(desc(plantHealthLogs.logDate));
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        healthStatus: z.enum(["HEALTHY", "STRESSED", "SICK", "RECOVERING"]).optional(),
        symptoms: z.string().optional(),
        treatment: z.string().optional(),
        notes: z.string().optional(),
        photoBase64: z.string().optional(), // Nova foto (opcional)
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const updateData: any = {};
        
        if (input.healthStatus) updateData.healthStatus = input.healthStatus;
        if (input.symptoms !== undefined) updateData.symptoms = input.symptoms;
        if (input.treatment !== undefined) updateData.treatment = input.treatment;
        if (input.notes !== undefined) updateData.notes = input.notes;
        
        // Se tem nova foto, fazer upload
        if (input.photoBase64) {
          try {
            // Buscar registro atual para pegar plantId
            const [currentLog] = await database
              .select()
              .from(plantHealthLogs)
              .where(eq(plantHealthLogs.id, input.id));
            
            if (currentLog) {
              const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, 'base64');
              
              const fs = await import('fs/promises');
              const path = await import('path');
              
              // Criar diretórios se não existirem
              const uploadsDir = path.join(process.cwd(), 'uploads', 'health');
              await fs.mkdir(uploadsDir, { recursive: true });
              
              const timestamp = Date.now();
              const randomSuffix = Math.random().toString(36).substring(7);
              const filename = `${currentLog.plantId}-${timestamp}-${randomSuffix}.jpg`;
              const filePath = path.join(uploadsDir, filename);
              
              // Salvar arquivo
              await fs.writeFile(filePath, buffer);
              
              // Gerar URL local
              const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
              updateData.photoUrl = `${baseUrl}/uploads/health/${filename}`;
              updateData.photoKey = `health/${filename}`;
            }
          } catch (error) {
            console.error('Erro ao fazer upload da nova foto:', error);
          }
        }
        
        await database
          .update(plantHealthLogs)
          .set(updateData)
          .where(eq(plantHealthLogs.id, input.id));
        
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Opcional: deletar foto do storage também
        // const [log] = await database.select().from(plantHealthLogs).where(eq(plantHealthLogs.id, input.id));
        // if (log?.photoKey) {
        //   const { storageDelete } = await import('./storage');
        //   await storageDelete(log.photoKey);
        // }
        
        await database
          .delete(plantHealthLogs)
          .where(eq(plantHealthLogs.id, input.id));
        
        return { success: true };
      }),
  }),

  // Plant Trichome Logs
  plantTrichomes: router({
    create: publicProcedure
      .input(z.object({
        plantId: z.number(),
        weekNumber: z.number(),
        trichomeStatus: z.enum(["CLEAR", "CLOUDY", "AMBER", "MIXED"]),
        clearPercent: z.number().optional(),
        cloudyPercent: z.number().optional(),
        amberPercent: z.number().optional(),
        notes: z.string().optional(),
        photoBase64: z.string().optional(), // Base64 da foto para upload local
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        let photoUrl: string | undefined;
        let photoKey: string | undefined;

        // Se tem foto, fazer upload local
        if (input.photoBase64) {
          try {
            // Converter base64 para buffer
            const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Criar diretórios se não existirem
            const uploadsDir = path.join(process.cwd(), 'uploads', 'trichomes');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(7);
            const filename = `${input.plantId}-${timestamp}-${randomSuffix}.jpg`;
            const filePath = path.join(uploadsDir, filename);
            photoKey = `trichomes/${filename}`;
            
            // Salvar arquivo
            await fs.writeFile(filePath, buffer);
            
            // Gerar URL local
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            photoUrl = `${baseUrl}/uploads/trichomes/${filename}`;
          } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            // Continua sem a foto se o upload falhar
          }
        }
        
        await database.insert(plantTrichomeLogs).values({
          plantId: input.plantId,
          weekNumber: input.weekNumber,
          trichomeStatus: input.trichomeStatus,
          clearPercent: input.clearPercent,
          cloudyPercent: input.cloudyPercent,
          amberPercent: input.amberPercent,
          notes: input.notes,
          photoUrl,
          photoKey,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantTrichomeLogs)
          .where(eq(plantTrichomeLogs.plantId, input.plantId))
          .orderBy(desc(plantTrichomeLogs.logDate));
      }),
  }),

  // Plant LST Logs
  plantLST: router({
    create: publicProcedure
      .input(z.object({
        plantId: z.number(),
        technique: z.string(),
        response: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.insert(plantLSTLogs).values({
          plantId: input.plantId,
          technique: input.technique,
          response: input.response,
          notes: input.notes,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .input(z.object({ plantId: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(plantLSTLogs)
          .where(eq(plantLSTLogs.plantId, input.plantId))
          .orderBy(desc(plantLSTLogs.logDate));
      }),
  }),

  // Fertilization Presets (Predefinições de Fertilização)
  fertilizationPresets: router({
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        waterVolume: z.number(),
        targetEC: z.number(),
        phase: z.enum(["VEGA", "FLORA"]).optional(),
        weekNumber: z.number().optional(),
        irrigationsPerWeek: z.number().optional(),
        calculationMode: z.enum(["per-irrigation", "per-week"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.insert(fertilizationPresets).values({
          
          name: input.name,
          waterVolume: input.waterVolume.toString(),
          targetEC: input.targetEC.toString(),
          phase: input.phase,
          weekNumber: input.weekNumber,
          irrigationsPerWeek: input.irrigationsPerWeek?.toString(),
          calculationMode: input.calculationMode,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(fertilizationPresets)
          
          .orderBy(desc(fertilizationPresets.createdAt));
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .delete(fertilizationPresets)
          .where(and(
            eq(fertilizationPresets.id, input.id),
            
          ));
        
        return { success: true };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string(),
        waterVolume: z.number(),
        targetEC: z.number(),
        phase: z.enum(["VEGA", "FLORA"]).optional(),
        weekNumber: z.number().optional(),
        irrigationsPerWeek: z.number().optional(),
        calculationMode: z.enum(["per-irrigation", "per-week"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .update(fertilizationPresets)
          .set({
            name: input.name,
            waterVolume: input.waterVolume.toString(),
            targetEC: input.targetEC.toString(),
            phase: input.phase,
            weekNumber: input.weekNumber,
            irrigationsPerWeek: input.irrigationsPerWeek?.toString(),
            calculationMode: input.calculationMode,
          })
          .where(and(
            eq(fertilizationPresets.id, input.id),
            
          ));
        
        return { success: true };
      }),
  }),

  // Watering Presets (Predefinições de Rega)
  wateringPresets: router({
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        plantCount: z.number(),
        potSize: z.number(),
        targetRunoff: z.number(),
        phase: z.enum(["VEGA", "FLORA"]).optional(),
        weekNumber: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.insert(wateringPresets).values({
          
          name: input.name,
          plantCount: input.plantCount,
          potSize: input.potSize.toString(),
          targetRunoff: input.targetRunoff.toString(),
          phase: input.phase,
          weekNumber: input.weekNumber,
        });
        
        return { success: true };
      }),

    list: publicProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return await database
          .select()
          .from(wateringPresets)
          
          .orderBy(desc(wateringPresets.createdAt));
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .delete(wateringPresets)
          .where(and(
            eq(wateringPresets.id, input.id),
            
          ));
        
        return { success: true };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string(),
        plantCount: z.number(),
        potSize: z.number(),
        targetRunoff: z.number(),
        phase: z.enum(["VEGA", "FLORA"]).optional(),
        weekNumber: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .update(wateringPresets)
          .set({
            name: input.name,
            plantCount: input.plantCount,
            potSize: input.potSize.toString(),
            targetRunoff: input.targetRunoff.toString(),
            phase: input.phase,
            weekNumber: input.weekNumber,
          })
          .where(and(
            eq(wateringPresets.id, input.id),
            
          ));
        
        return { success: true };
      }),
  }),

  taskTemplates: router({
    list: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const templates = await database
        .select()
        .from(taskTemplates)
        .orderBy(taskTemplates.phase, taskTemplates.weekNumber, taskTemplates.title);

      return templates;
    }),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          phase: z.enum(["VEGA", "FLORA", "MAINTENANCE"]),
          context: z.enum(["TENT_A", "TENT_BC"]),
          weekNumber: z.number().int().min(1).max(12).nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const [newTemplate] = await database.insert(taskTemplates).values({
          title: input.title,
          description: input.description || null,
          phase: input.phase,
          context: input.context,
          weekNumber: input.weekNumber,
        });

        return { success: true, id: newTemplate.insertId };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          phase: z.enum(["VEGA", "FLORA", "MAINTENANCE"]),
          context: z.enum(["TENT_A", "TENT_BC"]),
          weekNumber: z.number().int().min(1).max(12).nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database
          .update(taskTemplates)
          .set({
            title: input.title,
            description: input.description || null,
            phase: input.phase,
            context: input.context,
            weekNumber: input.weekNumber,
          })
          .where(eq(taskTemplates.id, input.id));

        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Verificar se o template existe
        const existing = await database
          .select()
          .from(taskTemplates)
          .where(eq(taskTemplates.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Template de tarefa não encontrado");
        }

        await database.delete(taskTemplates).where(eq(taskTemplates.id, input.id));

        return { success: true };
      }),
  }),

  // Nutrient Recipes (Receitas de Nutrientes)
  nutrients: router({
    // Listar templates de receitas
    listTemplates: publicProcedure
      .input(z.object({ phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE", "DRYING"]).optional() }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        if (input?.phase) {
          return database
            .select()
            .from(recipeTemplates)
            .where(eq(recipeTemplates.phase, input.phase))
            .orderBy(recipeTemplates.weekNumber, recipeTemplates.name);
        }

        return database
          .select()
          .from(recipeTemplates)
          .orderBy(recipeTemplates.phase, recipeTemplates.weekNumber, recipeTemplates.name);
      }),

    // Criar template de receita
    createTemplate: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE", "DRYING"]),
          weekNumber: z.number().int().min(1).max(12).nullable(),
          volumeTotalL: z.number().positive(),
          ecTarget: z.number().nonnegative().nullable(),
          phTarget: z.number().min(4).max(8).nullable(),
          products: z.array(
            z.object({
              name: z.string(),
              amountMl: z.number().nonnegative(),
              npk: z.string().optional(),
              ca: z.number().optional(),
              mg: z.number().optional(),
              fe: z.number().optional(),
            })
          ),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const [newTemplate] = await database.insert(recipeTemplates).values({
          name: input.name,
          phase: input.phase,
          weekNumber: input.weekNumber,
          volumeTotalL: input.volumeTotalL.toString(),
          ecTarget: input.ecTarget?.toString() || null,
          phTarget: input.phTarget?.toString() || null,
          productsJson: JSON.stringify(input.products),
          notes: input.notes || null,
        });

        return { success: true, id: newTemplate.insertId };
      }),

    // Registrar aplicação de nutrientes
    recordApplication: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          cycleId: z.number().nullable(),
          recipeTemplateId: z.number().nullable(),
          recipeName: z.string(),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE", "DRYING"]),
          weekNumber: z.number().nullable(),
          volumeTotalL: z.number().positive(),
          ecTarget: z.number().nullable(),
          ecActual: z.number().nullable(),
          phTarget: z.number().nullable(),
          phActual: z.number().nullable(),
          products: z.array(
            z.object({
              name: z.string(),
              amountMl: z.number().nonnegative(),
              npk: z.string().optional(),
              ca: z.number().optional(),
              mg: z.number().optional(),
              fe: z.number().optional(),
            })
          ),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const [newApplication] = await database.insert(nutrientApplications).values({
          tentId: input.tentId,
          cycleId: input.cycleId,
          recipeTemplateId: input.recipeTemplateId,
          recipeName: input.recipeName,
          phase: input.phase,
          weekNumber: input.weekNumber,
          volumeTotalL: input.volumeTotalL.toString(),
          ecTarget: input.ecTarget?.toString() || null,
          ecActual: input.ecActual?.toString() || null,
          phTarget: input.phTarget?.toString() || null,
          phActual: input.phActual?.toString() || null,
          productsJson: JSON.stringify(input.products),
          notes: input.notes || null,
        });

        return { success: true, id: newApplication.insertId };
      }),

    // Listar histórico de aplicações
    listApplications: publicProcedure
      .input(
        z.object({
          tentId: z.number().optional(),
          cycleId: z.number().optional(),
          phase: z.enum(["CLONING", "VEGA", "FLORA", "MAINTENANCE", "DRYING"]).optional(),
          limit: z.number().int().positive().default(50),
        }).optional()
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let query = database.select().from(nutrientApplications);

        const conditions = [];
        if (input?.tentId) conditions.push(eq(nutrientApplications.tentId, input.tentId));
        if (input?.cycleId) conditions.push(eq(nutrientApplications.cycleId, input.cycleId));
        if (input?.phase) conditions.push(eq(nutrientApplications.phase, input.phase));

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        return query
          .orderBy(desc(nutrientApplications.applicationDate))
          .limit(input?.limit || 50);
      }),
  }),

  // Watering Applications (Aplicações de Rega)
  watering: router({
    // Registrar aplicação de rega
    recordApplication: publicProcedure
      .input(
        z.object({
          tentId: z.number(),
          cycleId: z.number().nullable(),
          recipeName: z.string(),
          potSizeL: z.number().positive(),
          numberOfPots: z.number().int().positive(),
          waterPerPotL: z.number().positive(),
          totalWaterL: z.number().positive(),
          targetRunoffPercent: z.number().nullable(),
          expectedRunoffL: z.number().nullable(),
          actualRunoffL: z.number().nullable(),
          actualRunoffPercent: z.number().nullable(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const [newApplication] = await database.insert(wateringApplications).values({
          tentId: input.tentId,
          cycleId: input.cycleId,
          recipeName: input.recipeName,
          potSizeL: input.potSizeL.toString(),
          numberOfPots: input.numberOfPots,
          waterPerPotL: input.waterPerPotL.toString(),
          totalWaterL: input.totalWaterL.toString(),
          targetRunoffPercent: input.targetRunoffPercent?.toString() || null,
          expectedRunoffL: input.expectedRunoffL?.toString() || null,
          actualRunoffL: input.actualRunoffL?.toString() || null,
          actualRunoffPercent: input.actualRunoffPercent?.toString() || null,
          notes: input.notes || null,
        });

        return { success: true, id: newApplication.insertId };
      }),

    // Listar histórico de aplicações
    listApplications: publicProcedure
      .input(
        z.object({
          tentId: z.number().optional(),
          cycleId: z.number().optional(),
          limit: z.number().int().positive().default(50),
        }).optional()
      )
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let query = database.select().from(wateringApplications);

        const conditions = [];
        if (input?.tentId) conditions.push(eq(wateringApplications.tentId, input.tentId));
        if (input?.cycleId) conditions.push(eq(wateringApplications.cycleId, input.cycleId));

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        return query
          .orderBy(desc(wateringApplications.applicationDate))
          .limit(input?.limit || 50);
      }),
  }),

  // Backup & Restore
  backup: router({
    // Exportar backup completo
    export: publicProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Buscar todos os dados
      const [allTents, allStrains, allCycles, allPlants, allDailyLogs, allTaskTemplates, allAlertSettings, allAlerts, allPlantPhotos, allPlantHealth, allRecipeTemplates, allNutrientApplications, allWateringApplications] = await Promise.all([
        database.select().from(tents),
        database.select().from(strains),
        database.select().from(cycles),
        database.select().from(plants),
        database.select().from(dailyLogs),
        database.select().from(taskTemplates),
        database.select().from(alertSettings),
        database.select().from(alerts),
        database.select().from(plantPhotos),
        database.select().from(plantHealthLogs),
        database.select().from(recipeTemplates),
        database.select().from(nutrientApplications),
        database.select().from(wateringApplications),
      ]);

      return {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          tents: allTents,
          strains: allStrains,
          cycles: allCycles,
          plants: allPlants,
          dailyLogs: allDailyLogs,
          taskTemplates: allTaskTemplates,
          alertSettings: allAlertSettings,
          alerts: allAlerts,
          plantPhotos: allPlantPhotos,
          plantHealthLogs: allPlantHealth,
          recipeTemplates: allRecipeTemplates,
          nutrientApplications: allNutrientApplications,
          wateringApplications: allWateringApplications,
        },
      };
    }),

    // Importar backup
    import: publicProcedure
      .input(
        z.object({
          version: z.string(),
          exportDate: z.string(),
          data: z.object({
            tents: z.array(z.any()).optional(),
            strains: z.array(z.any()).optional(),
            cycles: z.array(z.any()).optional(),
            plants: z.array(z.any()).optional(),
            dailyLogs: z.array(z.any()).optional(),
            taskTemplates: z.array(z.any()).optional(),
            alertSettings: z.array(z.any()).optional(),
            alerts: z.array(z.any()).optional(),
            plantPhotos: z.array(z.any()).optional(),
            plantHealthLogs: z.array(z.any()).optional(),
            recipeTemplates: z.array(z.any()).optional(),
            nutrientApplications: z.array(z.any()).optional(),
            wateringApplications: z.array(z.any()).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Validar versão
        if (input.version !== "1.0") {
          throw new Error("Versão de backup não suportada");
        }

        // AVISO: Esta operação limpa todos os dados existentes!
        // Em produção, considere fazer backup antes de importar

        // Deletar dados existentes (em ordem reversa de dependências)
        // Aplicações e registros de plantas
        await database.delete(wateringApplications);
        await database.delete(nutrientApplications);
        await database.delete(plantRunoffLogs);
        await database.delete(plantTrichomeLogs);
        await database.delete(plantLSTLogs);
        await database.delete(plantObservations);
        await database.delete(plantHealthLogs);
        await database.delete(plantPhotos);
        await database.delete(plantTentHistory);
        
        // Receitas e presets
        await database.delete(recipeTemplates);
        await database.delete(wateringPresets);
        await database.delete(fertilizationPresets);
        await database.delete(recipes);
        
        // Alertas e notificações
        await database.delete(notificationHistory);
        await database.delete(alertHistory);
        await database.delete(alerts);
        await database.delete(alertSettings);
        
        // Tarefas
        await database.delete(taskInstances);
        await database.delete(taskTemplates);
        
        // Registros diários e plantas
        await database.delete(dailyLogs);
        await database.delete(plants);
        
        // Eventos de clonagem
        await database.delete(cloningEvents);
        
        // Estado de estufa
        await database.delete(tentAState);
        
        // Ciclos
        await database.delete(cycles);
        
        // Targets semanais (depende de strains)
        await database.delete(weeklyTargets);
        
        // Strains e estufas
        await database.delete(strains);
        await database.delete(tents);

        // Inserir dados do backup
        if (input.data.tents && input.data.tents.length > 0) {
          await database.insert(tents).values(input.data.tents);
        }
        if (input.data.strains && input.data.strains.length > 0) {
          await database.insert(strains).values(input.data.strains);
        }
        if (input.data.cycles && input.data.cycles.length > 0) {
          await database.insert(cycles).values(input.data.cycles);
        }
        if (input.data.plants && input.data.plants.length > 0) {
          await database.insert(plants).values(input.data.plants);
        }
        if (input.data.dailyLogs && input.data.dailyLogs.length > 0) {
          await database.insert(dailyLogs).values(input.data.dailyLogs);
        }
        if (input.data.taskTemplates && input.data.taskTemplates.length > 0) {
          await database.insert(taskTemplates).values(input.data.taskTemplates);
        }
        if (input.data.alertSettings && input.data.alertSettings.length > 0) {
          await database.insert(alertSettings).values(input.data.alertSettings);
        }
        if (input.data.alerts && input.data.alerts.length > 0) {
          await database.insert(alerts).values(input.data.alerts);
        }
        if (input.data.plantPhotos && input.data.plantPhotos.length > 0) {
          await database.insert(plantPhotos).values(input.data.plantPhotos);
        }
        if (input.data.plantHealthLogs && input.data.plantHealthLogs.length > 0) {
          await database.insert(plantHealthLogs).values(input.data.plantHealthLogs);
        }
        if (input.data.recipeTemplates && input.data.recipeTemplates.length > 0) {
          await database.insert(recipeTemplates).values(input.data.recipeTemplates);
        }
        if (input.data.nutrientApplications && input.data.nutrientApplications.length > 0) {
          await database.insert(nutrientApplications).values(input.data.nutrientApplications);
        }
        if (input.data.wateringApplications && input.data.wateringApplications.length > 0) {
          await database.insert(wateringApplications).values(input.data.wateringApplications);
        }

        return { success: true, message: "Backup restaurado com sucesso" };
      }),
  }),

});

export type AppRouter = typeof appRouter;
