import { drizzle } from "drizzle-orm/mysql2";
import { taskTemplates } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const templates = [
  // TENT_BC - VEGA
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 1,
    title: "Verificar pH e EC da solução nutritiva",
    description: "Manter pH entre 5.8-6.2 e EC entre 0.8-1.2 mS/cm",
  },
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 1,
    title: "Ajustar altura da luz",
    description: "Manter distância de 45-60cm das plantas",
  },
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 2,
    title: "Aplicar LST (Low Stress Training)",
    description: "Dobrar suavemente os galhos principais para aumentar exposição à luz",
  },
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 2,
    title: "Verificar pragas e doenças",
    description: "Inspecionar folhas (parte inferior) em busca de ácaros, fungos ou insetos",
  },
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 3,
    title: "Aumentar nutrientes gradualmente",
    description: "Elevar EC para 1.2-1.6 mS/cm conforme crescimento",
  },
  {
    context: "TENT_BC",
    phase: "VEGA",
    weekNumber: 4,
    title: "Preparar para floração",
    description: "Última poda/defolhação antes de iniciar floração",
  },
  
  // TENT_BC - FLORA
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 1,
    title: "Ajustar ciclo de luz para 12/12",
    description: "Garantir 12h luz / 12h escuridão total sem interrupções",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 1,
    title: "Trocar para nutrientes de floração",
    description: "Aumentar fósforo (P) e potássio (K), reduzir nitrogênio (N)",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 2,
    title: "Monitorar formação de flores",
    description: "Verificar se os pistilos estão aparecendo",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 3,
    title: "Aumentar ventilação",
    description: "Prevenir mofo e bolor com boa circulação de ar",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 4,
    title: "Verificar tricomas",
    description: "Começar a monitorar maturação dos tricomas com lupa",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 6,
    title: "Reduzir nutrientes gradualmente",
    description: "Preparar para flush final",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 7,
    title: "Iniciar flush",
    description: "Regar apenas com água pH ajustado (sem nutrientes)",
  },
  {
    context: "TENT_BC",
    phase: "FLORA",
    weekNumber: 8,
    title: "Verificar ponto de colheita",
    description: "Tricomas 70% leitosos, 30% âmbar = ponto ideal",
  },
  
  // TENT_A - CLONING
  {
    context: "TENT_A",
    phase: "CLONING",
    weekNumber: 1,
    title: "Manter umidade alta (70-80%)",
    description: "Usar dome de propagação e borrifar água 2-3x ao dia",
  },
  {
    context: "TENT_A",
    phase: "CLONING",
    weekNumber: 1,
    title: "Verificar enraizamento",
    description: "Observar raízes saindo dos cubos/plugs",
  },
  {
    context: "TENT_A",
    phase: "CLONING",
    weekNumber: 2,
    title: "Reduzir umidade gradualmente",
    description: "Baixar para 60-70% para aclimatar os clones",
  },
  {
    context: "TENT_A",
    phase: "CLONING",
    weekNumber: 2,
    title: "Transplantar clones enraizados",
    description: "Mover para vasos maiores quando raízes estiverem desenvolvidas",
  },
  
  // TENT_A - MAINTENANCE
  {
    context: "TENT_A",
    phase: "MAINTENANCE",
    weekNumber: null,
    title: "Podar plantas mães",
    description: "Remover galhos inferiores e manter formato compacto",
  },
  {
    context: "TENT_A",
    phase: "MAINTENANCE",
    weekNumber: null,
    title: "Fertilizar plantas mães",
    description: "Aplicar nutrientes vegetativos semanalmente",
  },
  {
    context: "TENT_A",
    phase: "MAINTENANCE",
    weekNumber: null,
    title: "Verificar saúde das mães",
    description: "Inspecionar pragas, deficiências nutricionais e vigor geral",
  },
];

async function seed() {
  console.log("🌱 Populando templates de tarefas...");
  
  for (const template of templates) {
    await db.insert(taskTemplates).values(template);
    console.log(`✅ Criado: ${template.title}`);
  }
  
  console.log("🎉 Templates de tarefas criados com sucesso!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao popular templates:", error);
  process.exit(1);
});
