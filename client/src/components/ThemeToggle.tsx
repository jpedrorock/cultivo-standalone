import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
          {theme === "kindle" && <BookOpen className="w-5 h-5" />}
          Tema
        </CardTitle>
        <CardDescription>
          Escolha o tema que melhor se adapta ao seu ambiente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "kindle")}>
          <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
            <RadioGroupItem value="light" id="light" />
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
          
          <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 mt-3">
            <RadioGroupItem value="dark" id="dark" />
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
          
          <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 mt-3">
            <RadioGroupItem value="kindle" id="kindle" />
            <div className="flex-1">
              <Label htmlFor="kindle" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Kindle (Alto Contraste)</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Preto e branco puro para máxima legibilidade
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
