import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface CycleData {
  cycle: {
    id: number;
    tentId: number;
    strainId: number;
    startDate: Date;
    floraStartDate: Date | null;
    status: string;
  };
  tent: {
    name: string;
    tentType: string;
  };
  strain: {
    name: string;
  };
  logs: Array<{
    logDate: Date;
    turn: string;
    tempC: number | null;
    rhPct: number | null;
    ppfd: number | null;
    ph: number | null;
    ec: number | null;
  }>;
  tasks: Array<{
    id: number;
    isDone: boolean;
    occurrenceDate: Date;
  }>;
}

export async function generateCycleReport(data: CycleData) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Ciclo - App Cultivo", 105, yPosition, { align: "center" });
  yPosition += 15;

  // Informações do Ciclo
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do Ciclo", 14, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const cycleInfo = [
    `Estufa: ${data.tent.name} (Tipo ${data.tent.tentType})`,
    `Strain: ${data.strain.name}`,
    `Data de Início: ${format(new Date(data.cycle.startDate), "dd/MM/yyyy")}`,
    data.cycle.floraStartDate
      ? `Início da Floração: ${format(new Date(data.cycle.floraStartDate), "dd/MM/yyyy")}`
      : "",
    `Status: ${data.cycle.status === "ACTIVE" ? "Ativo" : "Finalizado"}`,
  ].filter(Boolean);

  cycleInfo.forEach((line) => {
    doc.text(line, 14, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Estatísticas dos Logs
  if (data.logs.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estatísticas dos Parâmetros", 14, yPosition);
    yPosition += 7;

    const stats = calculateStats(data.logs);
    const statsData = [
      ["Parâmetro", "Média", "Mínimo", "Máximo"],
      [
        "Temperatura (°C)",
        stats.temp.avg.toFixed(1),
        stats.temp.min.toFixed(1),
        stats.temp.max.toFixed(1),
      ],
      ["Umidade (%)", stats.rh.avg.toFixed(1), stats.rh.min.toFixed(1), stats.rh.max.toFixed(1)],
      ["PPFD (µmol)", stats.ppfd.avg.toFixed(0), stats.ppfd.min.toFixed(0), stats.ppfd.max.toFixed(0)],
      ["pH", stats.ph.avg.toFixed(1), stats.ph.min.toFixed(1), stats.ph.max.toFixed(1)],
      ["EC (mS/cm)", stats.ec.avg.toFixed(2), stats.ec.min.toFixed(2), stats.ec.max.toFixed(2)],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Nova página para tarefas
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  // Tarefas
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo de Tarefas", 14, yPosition);
  yPosition += 7;

  const completedTasks = data.tasks.filter((t) => t.isDone).length;
  const totalTasks = data.tasks.length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0";

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de Tarefas: ${totalTasks}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Tarefas Concluídas: ${completedTasks}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Taxa de Conclusão: ${completionRate}%`, 14, yPosition);
  yPosition += 10;

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      105,
      290,
      { align: "center" }
    );
  }

  // Download
  const fileName = `relatorio_${data.tent.name}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
  doc.save(fileName);
}

function calculateStats(logs: CycleData["logs"]) {
  const validLogs = logs.filter(
    (log) => log.tempC !== null && log.rhPct !== null && log.ppfd !== null
  );

  if (validLogs.length === 0) {
    return {
      temp: { avg: 0, min: 0, max: 0 },
      rh: { avg: 0, min: 0, max: 0 },
      ppfd: { avg: 0, min: 0, max: 0 },
      ph: { avg: 0, min: 0, max: 0 },
      ec: { avg: 0, min: 0, max: 0 },
    };
  }

  const temps = validLogs.map((l) => Number(l.tempC)).filter((v) => !isNaN(v));
  const rhs = validLogs.map((l) => Number(l.rhPct)).filter((v) => !isNaN(v));
  const ppfds = validLogs.map((l) => Number(l.ppfd)).filter((v) => !isNaN(v));
  const phs = validLogs.map((l) => Number(l.ph)).filter((v) => !isNaN(v) && v > 0);
  const ecs = validLogs.map((l) => Number(l.ec)).filter((v) => !isNaN(v) && v > 0);

  return {
    temp: {
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
      min: Math.min(...temps),
      max: Math.max(...temps),
    },
    rh: {
      avg: rhs.reduce((a, b) => a + b, 0) / rhs.length,
      min: Math.min(...rhs),
      max: Math.max(...rhs),
    },
    ppfd: {
      avg: ppfds.reduce((a, b) => a + b, 0) / ppfds.length,
      min: Math.min(...ppfds),
      max: Math.max(...ppfds),
    },
    ph: {
      avg: phs.length > 0 ? phs.reduce((a, b) => a + b, 0) / phs.length : 0,
      min: phs.length > 0 ? Math.min(...phs) : 0,
      max: phs.length > 0 ? Math.max(...phs) : 0,
    },
    ec: {
      avg: ecs.length > 0 ? ecs.reduce((a, b) => a + b, 0) / ecs.length : 0,
      min: ecs.length > 0 ? Math.min(...ecs) : 0,
      max: ecs.length > 0 ? Math.max(...ecs) : 0,
    },
  };
}
