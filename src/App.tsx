
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Hub from "./pages/Hub";
import MyArea from "./pages/MyArea";
import Simulators from "./pages/Simulators";
import Registrations from "./pages/Registrations";
import AIAgents from "./pages/AIAgents";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="light" storageKey="aluno-portal-theme">
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hub/:section" element={<Hub />} />
              <Route path="/minha-area/:section" element={<MyArea />} />
              <Route path="/simuladores" element={<Simulators />} />
              <Route path="/cadastros" element={<Registrations />} />
              <Route path="/agentes-ia" element={<AIAgents />} />
              <Route path="/nossos-cursos" element={<Courses />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="/suporte" element={<Support />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
