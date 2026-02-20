import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Droplet, Beaker, Sun } from "lucide-react";

export default function CalculatorMenu() {
  const calculators = [
    {
      id: "irrigation",
      title: "Rega e Runoff",
      description: "Calcule volume ideal de rega e meça runoff real",
      icon: Droplet,
      href: "/calculators/irrigation",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "nutrients",
      title: "Fertilização",
      description: "Calcule receitas de sais minerais por fase e semana",
      icon: Beaker,
      href: "/calculators/nutrients",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      id: "light",
      title: "Conversor Lux ⇔ PPFD",
      description: "Converta leitura de lux para PPFD e vice-versa",
      icon: Sun,
      href: "/calculators/lux-ppfd",
      gradient: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      id: "ppm-ec",
      title: "Conversor PPM ⇔ EC",
      description: "Converta entre PPM e EC para controle de nutrientes",
      icon: Calculator,
      href: "/calculators/ppm-ec",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Calculadoras</h1>
              <p className="text-green-100 text-sm">Ferramentas para cultivo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Calculators Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.id} href={calc.href}>
                <Card className={`${calc.bgColor} border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full`}>
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${calc.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                    <CardDescription className="text-base">{calc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Abrir calculadora →
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
