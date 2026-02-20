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
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Gauge className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Calculadoras</h1>
            <p className="text-green-100 text-sm">Ferramentas para cultivo</p>
          </div>
        </div>
      </div>

      {/* Grid de Calculadoras */}
      <div className="py-8 px-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.id} href={`/calculators/${calc.id}`}>
                <Card className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${calc.bgColor} hover:border-primary/50`}>
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${calc.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{calc.title}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
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
