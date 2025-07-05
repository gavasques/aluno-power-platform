import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";

function AppMinimal() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/home" component={Home} />
        </Switch>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default AppMinimal;