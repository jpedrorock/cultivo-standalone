import { Home, Calculator, BarChart3, Bell, Sprout, Leaf, Settings, Droplets, CheckSquare, Beaker } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/plants", icon: Sprout, label: "Plantas" },
    { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
    { 
      href: "/calculators", 
      icon: Calculator, 
      label: "Calculadoras",
      submenu: [
        { href: "/calculators/watering-runoff", label: "Rega e Runoff" },
        { href: "/nutrients", label: "Fertilização" },
      ]
    },
    { href: "/history", icon: BarChart3, label: "Histórico" },
    { href: "/alerts", icon: Bell, label: "Alertas" },
    { href: "/manage-strains", icon: Leaf, label: "Strains" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-sidebar border-r border-sidebar-border shadow-sm z-40">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">App Cultivo</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.submenu && item.submenu.some((sub: any) => location === sub.href));
          
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  "hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span>{item.label}</span>
              </Link>
              {item.submenu && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((subItem: any) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
                        "hover:bg-sidebar-accent",
                        location === subItem.href
                          ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <span>•</span>
                      <span>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
            "hover:bg-sidebar-accent",
            location === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
              : "text-sidebar-foreground hover:text-primary"
          )}
        >
          <Settings className={cn("w-5 h-5", location === "/settings" && "stroke-[2.5]")} />
          <span>Configurações</span>
        </Link>
        <div className="px-4 py-2 bg-sidebar-accent rounded-lg">
          <p className="text-xs text-primary font-medium">Sistema Ativo</p>
          <p className="text-xs text-muted-foreground mt-1">3 estufas monitoradas</p>
        </div>
      </div>
    </aside>
  );
}
