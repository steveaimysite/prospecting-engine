import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import IcpManagement from "./pages/IcpManagement";
import ExecutionLogs from "./pages/ExecutionLogs";
import Settings from "./pages/Settings";
import IcpAnalytics from "./pages/IcpAnalytics";
import AbTesting from "./pages/AbTesting";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/icp"} component={IcpManagement} />
      <Route path={"/analytics"} component={IcpAnalytics} />
      <Route path={"/ab-testing"} component={AbTesting} />
      <Route path={"/logs"} component={ExecutionLogs} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
