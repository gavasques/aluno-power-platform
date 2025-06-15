import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ProductProvider } from "@/contexts/ProductContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { ToolsProvider } from "@/contexts/ToolsContext";
import { MaterialsProvider } from "@/contexts/MaterialsContext";
import Layout from "@/components/layout/Layout";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyArea = lazy(() => import("@/pages/MyArea"));
const Hub = lazy(() => import("@/pages/Hub"));
const PartnerDetail = lazy(() => import("@/pages/hub/PartnerDetail"));
const Simulators = lazy(() => import("@/pages/Simulators"));
const AIAgents = lazy(() => import("@/pages/AIAgents"));
const Courses = lazy(() => import("@/pages/Courses"));
const Support = lazy(() => import("@/pages/Support"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const Registrations = lazy(() => import("@/pages/Registrations"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme" attribute="class">
        <ProductProvider>
          <PartnersProvider>
            <ToolsProvider>
              <MaterialsProvider>
                <Router>
                  <Layout>
                    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando...</div>}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/minha-area/:section?/:id?" element={<MyArea />} />
                        <Route path="/hub/:section?" element={<Hub />} />
                        <Route path="/hub/parceiros/:id" element={<PartnerDetail />} />
                        <Route path="/simuladores" element={<Simulators />} />
                        <Route path="/agentes-ia" element={<AIAgents />} />
                        <Route path="/cursos" element={<Courses />} />
                        <Route path="/suporte" element={<Support />} />
                        <Route path="/configuracoes" element={<Settings />} />
                        <Route path="/perfil" element={<Profile />} />
                        <Route path="/inscricoes" element={<Registrations />} />
                        <Route path="/admin/:section?/:subsection?/:id?" element={<Admin />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                  <Toaster />
                </Router>
              </MaterialsProvider>
            </ToolsProvider>
          </PartnersProvider>
        </ProductProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
