import { Home, Calculator, BarChart3, Bell, Sprout, Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/calculators", icon: Calculator, label: "Calculadoras" },
    { href: "/history", icon: BarChart3, label: "Histórico" },
    { href: "/alerts", icon: Bell, label: "Alertas" },
    { href: "/manage-strains", icon: Sprout, label: "Strains" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">App Cultivo</h1>
            <p className="text-xs text-gray-500">Gerenciamento</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-green-50",
                isActive
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-700 hover:text-green-600"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 font-medium">Sistema Ativo</p>
          <p className="text-xs text-gray-600 mt-1">3 estufas monitoradas</p>
        </div>
      </div>
    </aside>
  );
}
