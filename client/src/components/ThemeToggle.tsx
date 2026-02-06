import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-5 h-5 text-blue-600" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-600" />
          )}
          Tema
        </CardTitle>
        <CardDescription>
          Escolha entre tema claro ou escuro para melhor visualização
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle" className="text-base">
              Modo Escuro
            </Label>
            <p className="text-sm text-muted-foreground">
              {isDark
                ? "Tema escuro ativo - ideal para uso noturno"
                : "Tema claro ativo - melhor para ambientes iluminados"}
            </p>
          </div>
          <Switch
            id="theme-toggle"
            checked={isDark}
            onCheckedChange={toggleTheme}
          />
        </div>
      </CardContent>
    </Card>
  );
}
