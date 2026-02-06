import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { InstallPWA } from "./components/InstallPWA";
import { BottomNav } from "./components/BottomNav";
import { Sidebar } from "./components/Sidebar";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TentLog from "./pages/TentLog";
import TentDetails from "./pages/TentDetails";
import Strains from "./pages/Strains";
import Tasks from "./pages/Tasks";
import ManageStrains from "./pages/ManageStrains";
import Calculators from "./pages/Calculators";
import Alerts from "./pages/Alerts";
import HistoryTable from "./pages/HistoryTable";
import Settings from "./pages/Settings";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/strains"} component={Strains} />
      <Route path={"/manage-strains"} component={ManageStrains} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/calculators"} component={Calculators} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/history"} component={HistoryTable} />
      <Route path={"/settings"} component={Settings} />

      <Route path={"/tent/:id"} component={TentDetails} />
      <Route path={"/tent/:id/log"} component={TentLog} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Sidebar />
          <div className="pb-16 md:pb-0 md:pl-64">
            <Router />
          </div>
          <BottomNav />
          <InstallPWA />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
