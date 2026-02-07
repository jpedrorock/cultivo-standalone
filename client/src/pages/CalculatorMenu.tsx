import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calculator, Droplets, Sprout, Sun, Beaker, TestTube } from "lucide-react";

export default function CalculatorMenu() {
  const calculators = [
    {
      id: "irrigation",
      title: "Calculadora de Rega",
      description: "Calcule o volume e frequência ideal de rega",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      id: "fertilization",
      title: "Calculadora de Fertilização",
      description: "Micronutrientes (Ca, Mg, Fe) por fase do ciclo",
      icon: Beaker,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-primary/10",
      iconColor: "text-green-600",
    },
    {
      id: "lux-ppfd",
      title: "Conversor Lux → PPFD",
      description: "Converta leitura de lux para PPFD",
      icon: Sun,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-600",
    },
    {
      id: "ppm-ec",
      title: "Conversor PPM ↔ EC",
      description: "Converta entre PPM e EC bidirecionalmente",
      icon: Calculator,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      id: "ph-adjust",
      title: "Calculadora de pH",
      description: "Calcule ajustes necessários de pH",
      icon: TestTube,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calculadoras</h1>
              <p className="text-sm text-muted-foreground">Ferramentas para cultivo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.id} href={`/calculators/${calc.id}`}>
                <Card className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${calc.bgColor} hover:border-primary/50`}>
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${calc.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                    <CardDescription className="text-base">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Abrir calculadora</span>
                      <span className="text-2xl">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-green-600" />
              Sobre as Calculadoras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <p>
              <strong>💧 Rega:</strong> Calcule o volume ideal baseado no tamanho do vaso e tipo de substrato
            </p>
            <p>
              <strong>🌱 Fertilização:</strong> Determine a dosagem correta de nutrientes para atingir o EC desejado
            </p>
            <p>
              <strong>☀️ Lux → PPFD:</strong> Converta leituras de luxímetro para PPFD (medida usada em cultivo)
            </p>
            <p>
              <strong>🧪 PPM ↔ EC:</strong> Converta entre partes por milhão e condutividade elétrica
            </p>
            <p>
              <strong>🔬 pH:</strong> Calcule quanto ácido/base adicionar para ajustar o pH da solução
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
