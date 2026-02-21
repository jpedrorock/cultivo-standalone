import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Apple, Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Theme preview component showing visual representation
function ThemePreview({ type }: { type: "light" | "dark" | "highcontrast" | "highcontrast-dark" | "apple" }) {
  const previewStyles = {
    light: {
      bg: "bg-white",
      card: "bg-gray-100",
      text: "bg-gray-800",
      accent: "bg-green-500",
    },
    dark: {
      bg: "bg-gray-900",
      card: "bg-gray-800",
      text: "bg-gray-100",
      accent: "bg-green-500",
    },
    highcontrast: {
      bg: "bg-white",
      card: "bg-gray-200",
      text: "bg-black",
      accent: "bg-black",
    },
    "highcontrast-dark": {
      bg: "bg-black",
      card: "bg-gray-900",
      text: "bg-white",
      accent: "bg-white",
    },
    apple: {
      bg: "bg-gray-50",
      card: "bg-white",
      text: "bg-gray-800",
      accent: "bg-blue-500",
    },
  };

  const colors = previewStyles[type];

  return (
    <div className={`w-16 h-12 rounded border-2 border-border overflow-hidden flex-shrink-0 ${colors.bg}`}>
      {/* Mini layout preview */}
      <div className="h-full p-1 flex gap-0.5">
        {/* Sidebar representation */}
        <div className={`w-3 ${colors.card} rounded-sm`} />
        {/* Content area */}
        <div className="flex-1 flex flex-col gap-0.5">
          {/* Header bar */}
          <div className={`h-1.5 ${colors.accent} rounded-sm`} />
          {/* Card representation */}
          <div className={`flex-1 ${colors.card} rounded-sm p-0.5 flex flex-col gap-0.5`}>
            <div className={`h-0.5 w-3/4 ${colors.text} rounded-full`} />
            <div className={`h-0.5 w-1/2 ${colors.text} opacity-50 rounded-full`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, switchable } = useTheme();

  if (!switchable) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === "dark" && <Moon className="w-5 h-5 text-blue-600" />}
          {theme === "light" && <Sun className="w-5 h-5 text-yellow-600" />}
          {(theme === "highcontrast" || theme === "highcontrast-dark") && <Contrast className="w-5 h-5" />}
          {theme === "apple" && <Apple className="w-5 h-5 text-blue-500" />}
          Tema
        </CardTitle>
        <CardDescription>
          Escolha o tema que melhor se adapta ao seu ambiente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
          {/* Light Theme */}
          <div className="flex items-center gap-3 rounded-md border p-4">
            <RadioGroupItem value="light" id="light" />
            <ThemePreview type="light" />
            <div className="flex-1">
              <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                <Sun className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Claro</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Melhor para ambientes bem iluminados
              </p>
            </div>
          </div>
          
          {/* Dark Theme */}
          <div className="flex items-center gap-3 rounded-md border p-4 mt-3">
            <RadioGroupItem value="dark" id="dark" />
            <ThemePreview type="dark" />
            <div className="flex-1">
              <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                <Moon className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Escuro</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Ideal para uso noturno e economia de bateria
              </p>
            </div>
          </div>
          
          {/* High Contrast Theme */}
          <div className="flex items-center gap-3 rounded-md border p-4 mt-3">
            <RadioGroupItem value="highcontrast" id="highcontrast" />
            <ThemePreview type="highcontrast" />
            <div className="flex-1">
              <Label htmlFor="highcontrast" className="flex items-center gap-2 cursor-pointer">
                <Contrast className="w-4 h-4" />
                <span className="font-medium">Alto Contraste</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Preto e branco puro (fundo branco, texto preto)
              </p>
            </div>
          </div>
          
          {/* High Contrast Dark Theme */}
          <div className="flex items-center gap-3 rounded-md border p-4 mt-3">
            <RadioGroupItem value="highcontrast-dark" id="highcontrast-dark" />
            <ThemePreview type="highcontrast-dark" />
            <div className="flex-1">
              <Label htmlFor="highcontrast-dark" className="flex items-center gap-2 cursor-pointer">
                <Contrast className="w-4 h-4" />
                <span className="font-medium">Alto Contraste Escuro</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Preto e branco invertido (fundo preto, texto branco)
              </p>
            </div>
          </div>
          
          {/* Apple Theme */}
          <div className="flex items-center gap-3 rounded-md border p-4 mt-3">
            <RadioGroupItem value="apple" id="apple" />
            <ThemePreview type="apple" />
            <div className="flex-1">
              <Label htmlFor="apple" className="flex items-center gap-2 cursor-pointer">
                <Apple className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Apple</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Inspirado no design macOS/iOS com bordas arredondadas
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
