import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calculator, Droplets, Sprout, Sun, Beaker, TestTube, Waves } from "lucide-react";

export default function CalculatorMenu() {
  const calculators = [
    {
      id: "watering-runoff",
      title: "Rega e Runoff",
      description: "Calcule volume ideal de rega e meça runoff real",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
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
      <main className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.id} href={`/calculators/${calc.id}`}>
                <Card className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${calc.bgColor} hover:border-primary/50`}>
                  <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                    <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${calc.color} flex items-center justify-center mb-2 md:mb-4 shadow-lg`}>
                      <Icon className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{calc.title}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
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
        <Card className="mt-4 md:mt-8 bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-green-600" />
              Sobre as Calculadoras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <p>
              <strong>💧 Rega e Runoff:</strong> Calcule o volume ideal de rega e meça o runoff real com recomendações de ajuste
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
