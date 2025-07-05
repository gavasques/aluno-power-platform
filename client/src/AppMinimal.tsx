import { Router } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthRouter } from "@/components/AuthRouter";

function AppMinimal() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthRouter />
          <Toaster />
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default AppMinimal;