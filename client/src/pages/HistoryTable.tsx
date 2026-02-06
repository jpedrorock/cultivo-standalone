import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Calendar, Filter, Table as TableIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function HistoryTable() {
  const [selectedTentId, setSelectedTentId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState<string>("30");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const { data: tents, isLoading: tentsLoading } = trpc.tents.list.useQuery();

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    if (period === "custom" && startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    if (period !== "custom" && period !== "all") {
      const days = parseInt(period);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      return { startDate: start, endDate: end };
    }
    
    return { startDate: undefined, endDate: undefined };
  }, [period, startDate, endDate]);

  const { data: logsData, isLoading: logsLoading } = trpc.dailyLogs.listAll.useQuery({
    tentId: selectedTentId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit,
    offset,
  });

  const exportToCSV = () => {
    if (!logsData?.logs || logsData.logs.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    // CSV headers
    const headers = ["Data", "Turno", "Estufa", "Temp (°C)", "RH (%)", "PPFD", "pH", "EC", "Observações"];
    
    // CSV rows
    const rows = logsData.logs.map(log => [
      new Date(log.logDate).toLocaleDateString("pt-BR"),
      log.turn || "-",
      log.tentName || "-",
      log.tempC || "-",
      log.rhPct || "-",
      log.ppfd || "-",
      log.ph || "-",
      log.ec || "-",
      log.notes ? `"${log.notes.replace(/"/g, '""')}"` : "-", // Escape quotes
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_cultivo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (logsData?.hasMore) {
      setOffset(offset + limit);
    }
  };

  if (tentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = logsData?.total ? Math.ceil(logsData.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TableIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Registros</h1>
                <p className="text-sm text-gray-600">Visualize e exporte todos os registros diários</p>
              </div>
            </div>
            <Button onClick={exportToCSV} disabled={!logsData?.logs || logsData.logs.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
            <CardDescription>Filtre os registros por estufa e período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Estufa Filter */}
              <div className="space-y-2">
                <Label htmlFor="tent-filter">Estufa</Label>
                <Select
                  value={selectedTentId?.toString() || "all"}
                  onValueChange={(value) => {
                    setSelectedTentId(value === "all" ? undefined : parseInt(value));
                    setOffset(0);
                  }}
                >
                  <SelectTrigger id="tent-filter">
                    <SelectValue placeholder="Todas as estufas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as estufas</SelectItem>
                    {tents?.map((tent) => (
                      <SelectItem key={tent.id} value={tent.id.toString()}>
                        {tent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="space-y-2">
                <Label htmlFor="period-filter">Período</Label>
                <Select
                  value={period}
                  onValueChange={(value) => {
                    setPeriod(value);
                    setOffset(0);
                  }}
                >
                  <SelectTrigger id="period-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="all">Todos os registros</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items per page */}
              <div className="space-y-2">
                <Label htmlFor="limit-filter">Registros por página</Label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(parseInt(value));
                    setOffset(0);
                  }}
                >
                  <SelectTrigger id="limit-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range */}
            {period === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setOffset(0);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setOffset(0);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registros Diários</CardTitle>
                <CardDescription>
                  {logsData?.total || 0} registro(s) encontrado(s)
                </CardDescription>
              </div>
              <Badge variant="outline">
                Página {currentPage} de {totalPages}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !logsData?.logs || logsData.logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro encontrado</p>
                <p className="text-sm mt-2">Ajuste os filtros ou registre novos dados</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Estufa</TableHead>
                        <TableHead className="text-right">Temp (°C)</TableHead>
                        <TableHead className="text-right">RH (%)</TableHead>
                        <TableHead className="text-right">PPFD</TableHead>
                        <TableHead className="text-right">pH</TableHead>
                        <TableHead className="text-right">EC</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {new Date(log.logDate).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.turn === "AM" ? "default" : "secondary"}>
                              {log.turn || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.tentName || "-"}</TableCell>
                          <TableCell className="text-right">{log.tempC || "-"}</TableCell>
                          <TableCell className="text-right">{log.rhPct || "-"}</TableCell>
                          <TableCell className="text-right">{log.ppfd || "-"}</TableCell>
                          <TableCell className="text-right">{log.ph || "-"}</TableCell>
                          <TableCell className="text-right">{log.ec || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate" title={log.notes || ""}>
                            {log.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={offset === 0}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Mostrando {offset + 1} - {Math.min(offset + limit, logsData.total || 0)} de {logsData.total || 0}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!logsData.hasMore}
                  >
                    Próxima
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
