import { Router } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";

function AppMinimal() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Landing />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default AppMinimal;