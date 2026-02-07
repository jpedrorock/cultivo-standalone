import { NotificationSettings } from "@/components/NotificationSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-sm text-gray-600">Personalize seu app</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <ThemeToggle />
          <DatabaseExport />
          <NotificationSettings />
        </div>
      </main>
    </div>
  );
}

function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false);
  const exportDatabase = trpc.database.export.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportDatabase.refetch();
      
      if (!result.data?.sql) {
        toast.error("Erro ao exportar banco de dados");
        return;
      }

      // Criar arquivo e download
      const blob = new Blob([result.data.sql], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cultivo-backup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Backup exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting database:", error);
      toast.error("Erro ao exportar banco de dados");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup do Banco de Dados</CardTitle>
        <CardDescription>
          Exporte todos os dados do aplicativo em formato SQL para backup ou transferência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar Banco de Dados"}
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          O arquivo SQL conterá todas as estufas, ciclos, registros, strains e configurações.
        </p>
      </CardContent>
    </Card>
  );
}
