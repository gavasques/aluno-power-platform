import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import { Loader2 } from "lucide-react";

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

export function AuthRouter() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }

  // If there's an authentication error or user is not authenticated, show landing page
  if (error || !isAuthenticated) {
    return <Landing />;
  }

  // User is authenticated, show home page
  return <Home />;
}