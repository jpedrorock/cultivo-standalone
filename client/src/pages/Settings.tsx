import { NotificationSettings } from "@/components/NotificationSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Download, Upload } from "lucide-react";
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
          <DatabaseImport />
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

function DatabaseImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const utils = trpc.useUtils();
  
  const importDatabase = trpc.database.import.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        setSelectedFile(null);
        // Invalidate all queries to refresh data
        utils.invalidate();
      } else {
        toast.error(result.message);
      }
      setIsImporting(false);
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
      setIsImporting(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.sql')) {
        toast.error("Por favor, selecione um arquivo .sql");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo SQL");
      return;
    }

    // Confirm before importing
    if (!confirm("⚠️ ATENÇÃO: Esta ação irá sobrescrever todos os dados existentes. Tem certeza que deseja continuar?")) {
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await selectedFile.text();
      importDatabase.mutate({ sqlContent: fileContent });
    } catch (error: any) {
      toast.error(`Erro ao ler arquivo: ${error.message}`);
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Backup do Banco de Dados</CardTitle>
        <CardDescription>
          Restaure seus dados a partir de um arquivo SQL exportado anteriormente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".sql"
              onChange={handleFileSelect}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              disabled={isImporting}
            />
          </div>
          
          {selectedFile && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <strong>Arquivo selecionado:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            className="w-full sm:w-auto"
            variant="destructive"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? "Importando..." : "Importar Banco de Dados"}
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Aviso:</strong> A importação irá sobrescrever todos os dados existentes. Certifique-se de exportar um backup atual antes de importar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
