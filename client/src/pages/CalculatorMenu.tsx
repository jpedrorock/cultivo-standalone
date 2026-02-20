import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Beaker, Sun, Calculator } from "lucide-react";

export default function CalculatorMenu() {
  const calculators = [
    {
      id: "irrigation",
      title: "Calculadora de Rega",
      description: "Calcule o volume e frequência ideal de rega",
      icon: Droplet,
      href: "/calculators/irrigation",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconBg: "bg-blue-500",
    },
    {
      id: "nutrients",
      title: "Calculadora de Fertilização",
      description: "Micronutrientes (Ca, Mg, Fe) por fase do ciclo",
      icon: Beaker,
      href: "/calculators/nutrients",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconBg: "bg-green-500",
    },
    {
      id: "light",
      title: "Conversor Lux → PPFD",
      description: "Converta leitura de lux para PPFD",
      icon: Sun,
      href: "/calculators/lux-ppfd",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconBg: "bg-orange-500",
    },
    {
      id: "ppm-ec",
      title: "Conversor PPM ↔ EC",
      description: "Converta entre PPM e EC bidirecionalmente",
      icon: Calculator,
      href: "/calculators/ppm-ec",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Verde */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Calculadoras</h1>
            <p className="text-sm text-green-100">Ferramentas para cultivo</p>
          </div>
        </div>
      </div>

      {/* Grid de Calculadoras - Estilo andy.plus */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.id} href={calc.href}>
                <Card className={`${calc.bgColor} border-0 hover:shadow-lg transition-shadow cursor-pointer h-full`}>
                  <CardHeader className="space-y-4">
                    <div className={`w-16 h-16 ${calc.iconBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-2">{calc.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {calc.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Abrir calculadora
                      <span className="ml-2">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
