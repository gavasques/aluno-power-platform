
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"
import { AdminLayout } from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartnersProvider } from "@/contexts/PartnersContext";
import { SuppliersProvider } from "@/contexts/SuppliersContext";
import { MaterialsProvider } from "./contexts/MaterialsContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ToolsProvider } from "./contexts/ToolsContext";

// Import pages that exist
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCadastros from "./pages/admin/AdminCadastros";
import UserManagement from "./pages/admin/UserManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import GeneralSettings from "./pages/admin/GeneralSettings";
import ContentManagement from "./pages/admin/ContentManagement";
import Suppliers from "./pages/hub/Suppliers";

// Create a simple Auth component
const Auth = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Área de Login</h1>
      <p className="text-muted-foreground">Sistema de autenticação em desenvolvimento</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <PartnersProvider>
            <SuppliersProvider>
              <MaterialsProvider>
                <ProductProvider>
                  <ToolsProvider>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />

                      {/* Rotas do usuário com Layout */}
                      <Route path="/" element={<Layout><Outlet /></Layout>}>
                        <Route index element={<Dashboard />} />
                        <Route path="fornecedores" element={<Suppliers />} />
                      </Route>

                      {/* Rotas de admin com AdminLayout */}
                      <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="cadastros/:section?" element={<AdminCadastros />} />
                        <Route path="usuarios" element={<UserManagement />} />
                        <Route path="suporte" element={<SupportManagement />} />
                        <Route path="configuracoes/:section?" element={<GeneralSettings />} />
                        <Route path="conteudo/:subsection?/:id?/:action?" element={<ContentManagement />} />
                      </Route>

                    </Routes>
                    <Toaster />
                  </ToolsProvider>
                </ProductProvider>
              </MaterialsProvider>
            </SuppliersProvider>
          </PartnersProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
