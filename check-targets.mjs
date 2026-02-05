import { db } from "./server/db.js";

const targets = await db.weeklyTargets.findMany({
  orderBy: [
    { tentId: 'asc' },
    { phase: 'asc' },
    { weekNumber: 'asc' }
  ]
});

console.log("\n=== ANÁLISE DE TARGETS POR ESTUFA ===\n");

const byTent = targets.reduce((acc, t) => {
  if (!acc[t.tentId]) acc[t.tentId] = [];
  acc[t.tentId].push(t);
  return acc;
}, {});

for (const [tentId, targetsForTent] of Object.entries(byTent)) {
  console.log(`\nEstufa ${tentId === '1' ? 'A' : tentId === '2' ? 'B' : 'C'} (tentId=${tentId}):`);
  const phases = [...new Set(targetsForTent.map(t => t.phase))];
  console.log(`  Fases: ${phases.join(', ')}`);
  console.log(`  Total de targets: ${targetsForTent.length}`);
  
  phases.forEach(phase => {
    const phaseTargets = targetsForTent.filter(t => t.phase === phase);
    console.log(`    - ${phase}: ${phaseTargets.length} semanas`);
  });
}

console.log("\n=== VERIFICAÇÃO ===\n");
console.log("✓ Estufa A deve ter apenas: MAINTENANCE, CLONING");
console.log("✓ Estufa B deve ter apenas: VEGA");
console.log("✓ Estufa C deve ter apenas: FLORA");

process.exit(0);
