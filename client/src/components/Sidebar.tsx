import { Home, Calculator, BarChart3, Bell, Sprout, Leaf, Settings, CheckSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home", enabled: true },
    { href: "/plants", icon: Sprout, label: "Plantas", enabled: true },
    { href: "/tarefas", icon: CheckSquare, label: "Tarefas", enabled: true },
    { href: "/calculators", icon: Calculator, label: "Calculadoras", enabled: true },
    { href: "/history", icon: BarChart3, label: "Histórico", enabled: true },
    { href: "/alerts", icon: Bell, label: "Alertas", enabled: true },
    { href: "/manage-strains", icon: Leaf, label: "Strains", enabled: true },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 glass-heavy border-r border-hairline border-hairline-light shadow-glass z-40">
      {/* Logo/Header - Liquid Glass Style */}
      <div className="p-6 border-b border-hairline border-hairline-light">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 glass-light border border-hairline border-hairline-light rounded-2xl flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">App Cultivo</h1>
            <p className="text-xs text-muted-foreground font-medium">Gerenciamento</p>
          </div>
        </div>
      </div>

      {/* Navigation Links - Liquid Glass Style */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          // If link is disabled, wrap in tooltip
          if (!item.enabled) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "opacity-40 cursor-not-allowed text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 stroke-2" />
                    <span className="text-sm font-medium">{ item.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="glass-medium border-hairline border-hairline-light shadow-glass">
                  <p className="text-sm font-medium">Em breve</p>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          // Enabled link with glass pill background when active
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "active:scale-[0.98]",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "stroke-[2.5]" : "stroke-2"
                )} 
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Liquid Glass Style */}
      <div className="p-4 border-t border-hairline border-hairline-light space-y-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            "active:scale-[0.98]",
            location === "/settings"
              ? "bg-primary/10 text-primary font-semibold shadow-sm"
              : "text-foreground hover:bg-muted/50 active:bg-muted/70"
          )}
        >
          <Settings 
            className={cn(
              "w-5 h-5 transition-all duration-200",
              location === "/settings" ? "stroke-[2.5]" : "stroke-2"
            )} 
          />
          <span className="text-sm">Configurações</span>
        </Link>
        
        {/* Status Card - Glass Inset Style */}
        <div className="glass-light border border-hairline border-hairline-light rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success-green rounded-full shadow-sm animate-pulse" />
            <p className="text-xs text-primary font-semibold">Sistema Ativo</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">3 estufas monitoradas</p>
        </div>
      </div>
    </aside>
  );
}
