import { Link } from "wouter";
import { Droplets, Beaker, Sun, Gauge, FlaskConical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const calculators = [
  {
    id: "watering-runoff",
    title: "Rega e Runoff",
    description: "Calcule volume ideal de rega e meça runoff real",
    icon: Droplets,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    id: "nutrients",
    title: "Fertilização",
    description: "Calcule receitas de sais minerais por fase e semana",
    icon: Beaker,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  {
    id: "lux-ppfd",
    title: "Conversor Lux → PPFD",
    description: "Converta leitura de lux para PPFD",
    icon: Sun,
    color: "from-orange-500 to-yellow-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    id: "ppm-ec",
    title: "Conversor PPM ↔ EC",
    description: "Converta entre PPM e EC (mS/cm)",
    icon: Gauge,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    id: "ph",
    title: "Calculadora de pH",
    description: "Ajuste pH da solução nutritiva",
    icon: FlaskConical,
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
];

export default function CalculatorMenu() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Gauge className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Calculadoras</h1>
              <p className="text-green-100 text-sm md:text-base">Ferramentas para cultivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Calculadoras */}
      <div className="px-0 py-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
