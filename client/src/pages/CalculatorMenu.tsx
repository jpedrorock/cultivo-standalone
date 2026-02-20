import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Beaker, Sun, Calculator } from "lucide-react";

export default function CalculatorMenu() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Verde */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <h1 className="text-2xl font-bold">Calculadoras</h1>
        <p className="text-sm text-green-100">Ferramentas para cultivo</p>
      </div>

      {/* Grid Simples */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <Link href="/calculators/irrigation">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-blue-50 dark:bg-blue-950/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Droplet className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Rega e Runoff</CardTitle>
                <CardDescription>Calcule volume ideal de rega e meça runoff real</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary font-medium">Abrir calculadora →</p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2 */}
          <Link href="/calculators/nutrients">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <Beaker className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Fertilização</CardTitle>
                <CardDescription>Calcule receitas de sais minerais por fase e semana</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary font-medium">Abrir calculadora →</p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3 */}
          <Link href="/calculators/lux-ppfd">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-orange-50 dark:bg-orange-950/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Conversor Lux ⇔ PPFD</CardTitle>
                <CardDescription>Converta leitura de lux para PPFD e vice-versa</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary font-medium">Abrir calculadora →</p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 4 */}
          <Link href="/calculators/ppm-ec">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-purple-50 dark:bg-purple-950/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Conversor PPM ⇔ EC</CardTitle>
                <CardDescription>Converta entre PPM e EC para controle de nutrientes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary font-medium">Abrir calculadora →</p>
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  );
}
