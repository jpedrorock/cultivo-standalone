import { Home, Calculator, Bell, MoreHorizontal, BarChart3, Sprout, Settings, Leaf, CheckSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
};

export function BottomNav() {
  const [location] = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  
  // Buscar contagem de alertas não lidos
  const { data: alertCount } = trpc.alerts.getNewCount.useQuery({});

  const mainNavItems: NavItem[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/plants", icon: Leaf, label: "Plantas" },
    { href: "/calculators", icon: Calculator, label: "Calculadoras" },
  ];

  const moreMenuItems: NavItem[] = [
    { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
    { href: "/alerts", icon: Bell, label: "Alertas", badge: alertCount || 0 },
    { href: "/history", icon: BarChart3, label: "Histórico" },
    { href: "/manage-strains", icon: Sprout, label: "Strains" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  const isMoreMenuActive = moreMenuItems.some(item => location === item.href);

  return (
    <>
      {/* Liquid Glass Bottom Tab Bar - Floating Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none pb-2">
        <div className="max-w-screen-xl mx-auto px-4">
          {/* Glass Container - Floating 8px above bottom with 16px insets */}
          <div className="glass-light border-hairline border-hairline-light shadow-glass rounded-3xl mx-4 mb-2 pointer-events-auto">
            <div className="flex justify-around items-center px-2 py-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all duration-200 relative min-w-[64px]",
                      "active:scale-95",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground active:bg-muted/50"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isActive ? "stroke-[2.5] scale-110" : "stroke-2"
                      )} 
                    />
                    <span 
                      className={cn(
                        "text-[11px] transition-all duration-200",
                        isActive ? "font-semibold" : "font-medium"
                      )}
                    >
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1 right-1 bg-critical-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* More Menu Trigger */}
              <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all duration-200 min-w-[64px]",
                      "active:scale-95",
                      isMoreMenuActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground active:bg-muted/50"
                    )}
                  >
                    <MoreHorizontal 
                      className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isMoreMenuActive ? "stroke-[2.5] scale-110" : "stroke-2"
                      )} 
                    />
                    <span 
                      className={cn(
                        "text-[11px] transition-all duration-200",
                        isMoreMenuActive ? "font-semibold" : "font-medium"
                      )}
                    >
                      Mais
                    </span>
                  </button>
                </SheetTrigger>
                
                {/* Liquid Glass Sheet Content */}
                <SheetContent 
                  side="bottom" 
                  className="h-auto pb-safe glass-medium border-hairline border-hairline-light shadow-glass-lg rounded-t-3xl"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu Mais</SheetTitle>
                  </SheetHeader>
                  
                  {/* Drag Handle */}
                  <div className="flex justify-center pt-3 pb-4">
                    <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                  </div>
                  
                  <div className="space-y-1 pb-6">
                    {moreMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative",
                            "active:scale-[0.98]",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground active:bg-muted/50"
                          )}
                        >
                          <Icon 
                            className={cn(
                              "w-5 h-5 transition-all duration-200",
                              isActive ? "stroke-[2.5]" : "stroke-2"
                            )} 
                          />
                          <span className="text-base">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto bg-critical-red text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Safe area spacer - prevents content from being hidden behind tab bar */}
      <div className="h-20 md:hidden" />
    </>
  );
}
