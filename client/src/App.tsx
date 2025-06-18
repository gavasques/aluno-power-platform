
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider"
import { AdminLayout } from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { PartnersProvider } from "@/contexts/PartnersContext";
import { SuppliersProvider } from "@/contexts/SuppliersContext";
import { MaterialsProvider } from "./contexts/MaterialsContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ToolsProvider } from "./contexts/ToolsContext";
import { TemplatesProvider } from "./contexts/TemplatesContext";
import { PromptsProvider } from "./contexts/PromptsContext";
import { YoutubeProvider } from "./contexts/YoutubeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Import pages that exist
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import News from "./pages/News";
import Updates from "./pages/Updates";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Admin from "./pages/Admin";
import UserManagement from "./pages/admin/UserManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import GeneralSettings from "./pages/admin/GeneralSettings";
import ContentManagement from "./pages/admin/ContentManagement";
import Suppliers from "./pages/hub/Suppliers";
import Partners from "./pages/hub/Partners";
import PartnerDetail from "./pages/hub/PartnerDetailSimple";
import ToolDetail from "./pages/hub/ToolDetail";
import MaterialDetailPage from "./pages/hub/MaterialDetailPage";
import SupplierDetail from "./pages/hub/SupplierDetail";
import TemplateDetail from "./pages/hub/TemplateDetail";
import PromptDetail from "./pages/hub/PromptDetail";
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



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <YoutubeProvider>
            <PartnersProvider>
              <SuppliersProvider>
                <MaterialsProvider>
                  <ProductProvider>
                    <ToolsProvider>
                      <TemplatesProvider>
                        <PromptsProvider>
                        <Switch>
                          <Route path="/auth" component={Auth} />

                          {/* Rotas específicas do Hub */}
                          <Route path="/hub/materiais/:id">
                            <Layout>
                              <MaterialDetailPage />
                            </Layout>
                          </Route>
                          <Route path="/hub/parceiros/:id">
                            <Layout>
                              <PartnerDetail />
                            </Layout>
                          </Route>
                          <Route path="/hub/ferramentas/:id">
                            <Layout>
                              <ToolDetail />
                            </Layout>
                          </Route>
                          <Route path="/hub/fornecedores/:id">
                            <Layout>
                              <SupplierDetail />
                            </Layout>
                          </Route>
                          <Route path="/hub/templates/:id">
                            <Layout>
                              <TemplateDetail />
                            </Layout>
                          </Route>
                          <Route path="/hub/prompts-ia/:id">
                            <Layout>
                              <PromptDetail />
                            </Layout>
                          </Route>

                          {/* Rotas do Hub */}
                          <Route path="/hub/parceiros">
                            <Layout>
                              <Partners />
                            </Layout>
                          </Route>
                          <Route path="/hub/fornecedores">
                            <Layout>
                              <Suppliers />
                            </Layout>
                          </Route>
                          <Route path="/hub/:section">
                            <Layout>
                              <Hub />
                            </Layout>
                          </Route>

                          {/* Rotas da Minha Área */}
                          <Route path="/minha-area/:section">
                            <Layout>
                              <MyArea />
                            </Layout>
                          </Route>

                          {/* Rotas do usuário */}
                          <Route path="/videos">
                            <Layout>
                              <Videos />
                            </Layout>
                          </Route>
                          <Route path="/noticias">
                            <Layout>
                              <News />
                            </Layout>
                          </Route>
                          <Route path="/novidades">
                            <Layout>
                              <Updates />
                            </Layout>
                          </Route>
                          <Route path="/fornecedores">
                            <Layout>
                              <Suppliers />
                            </Layout>
                          </Route>

                          {/* Rotas de admin */}
                          <Route path="/admin" component={AdminDashboard} />
                          <Route path="/admin/:section" component={Admin} />
                          <Route path="/admin/usuarios" component={UserManagement} />
                          <Route path="/admin/suporte" component={SupportManagement} />
                          <Route path="/admin/configuracoes" component={GeneralSettings} />
                          <Route path="/admin/conteudo" component={ContentManagement} />

                          {/* Home */}
                          <Route path="/">
                            <Layout>
                              <Dashboard />
                            </Layout>
                          </Route>

                          </Switch>
                          <Toaster />
                        </PromptsProvider>
                      </TemplatesProvider>
                    </ToolsProvider>
                  </ProductProvider>
                </MaterialsProvider>
              </SuppliersProvider>
            </PartnersProvider>
            </YoutubeProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
