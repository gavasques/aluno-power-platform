import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  </div>
);

// Lazy load the main app components 
const Hub = lazy(() => import("@/pages/Hub"));
const MyArea = lazy(() => import("@/pages/MyArea"));

export function AuthRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Authenticated user routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/hub/*">
          <Suspense fallback={<PageLoader />}>
            <Hub />
          </Suspense>
        </Route>
        <Route path="/minha-area/*">
          <Suspense fallback={<PageLoader />}>
            <MyArea />
          </Suspense>
        </Route>
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}