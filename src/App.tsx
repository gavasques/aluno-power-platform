
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ProductProvider } from "@/contexts/ProductContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import MyArea from "@/pages/MyArea";
import Hub from "@/pages/Hub";
import Simulators from "@/pages/Simulators";
import AIAgents from "@/pages/AIAgents";
import Courses from "@/pages/Courses";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Registrations from "@/pages/Registrations";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ProductProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/minha-area/:section?/:id?" element={<MyArea />} />
                <Route path="/hub/:section?" element={<Hub />} />
                <Route path="/simuladores" element={<Simulators />} />
                <Route path="/agentes-ia" element={<AIAgents />} />
                <Route path="/cursos" element={<Courses />} />
                <Route path="/suporte" element={<Support />} />
                <Route path="/configuracoes" element={<Settings />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/inscricoes" element={<Registrations />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </ProductProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
