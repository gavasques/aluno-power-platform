
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
import { TemplatesProvider } from "./contexts/TemplatesContext";
import { PromptsProvider } from "./contexts/PromptsContext";

// Import pages that exist
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCadastros from "./pages/admin/AdminCadastros";
import UserManagement from "./pages/admin/UserManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import GeneralSettings from "./pages/admin/GeneralSettings";
import ContentManagement from "./pages/admin/ContentManagement";
import Suppliers from "./pages/hub/Suppliers";
import Partners from "./pages/hub/Partners";
import PartnerDetail from "./pages/hub/PartnerDetail";
import ToolDetail from "./pages/hub/ToolDetail";
import HubMaterialDetail from "./pages/hub/MaterialDetail";
import SupplierDetail from "./pages/hub/SupplierDetail";
import Hub from "./pages/Hub";
import MyArea from "./pages/MyArea";

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
                    <TemplatesProvider>
                      <PromptsProvider>
                        <Routes>
                          <Route path="/auth" element={<Auth />} />

                          {/* Rotas do usuário com Layout */}
                          <Route path="/" element={<Layout><Outlet /></Layout>}>
                            <Route index element={<Dashboard />} />
                            <Route path="fornecedores" element={<Suppliers />} />
                            
                            {/* Rotas do Hub */}
                            <Route path="hub">
                              {/* Detail routes first (dynamic routes before the catch-all) */}
                              <Route path="parceiros/:id" element={<PartnerDetail />} />
                              <Route path="ferramentas/:id" element={<ToolDetail />} />
                              <Route path="materiais/:id" element={<HubMaterialDetail />} />
                              <Route path="fornecedores/:id" element={<SupplierDetail />} />
                              <Route path="parceiros" element={<Partners />} />
                              <Route path="fornecedores" element={<Suppliers />} />
                              <Route path=":section" element={<Hub />} />
                            </Route>

                            {/* Rotas da Minha Área */}
                            <Route path="minha-area">
                              <Route path=":section/:id?/:action?" element={<MyArea />} />
                            </Route>
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
                      </PromptsProvider>
                    </TemplatesProvider>
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
