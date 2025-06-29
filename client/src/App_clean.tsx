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
const Auth = () => <div>Auth Page</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
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

                              {/* Detail routes with Layout */}
                              <Route path="/hub/materiais/:id">
                                {(params) => (
                                  <Layout>
                                    <MaterialDetailPage />
                                  </Layout>
                                )}
                              </Route>
                              
                              <Route path="/hub/parceiros/:id">
                                {(params) => (
                                  <Layout>
                                    <PartnerDetail />
                                  </Layout>
                                )}
                              </Route>
                              
                              <Route path="/hub/ferramentas/:id">
                                {(params) => (
                                  <Layout>
                                    <ToolDetail />
                                  </Layout>
                                )}
                              </Route>
                              
                              <Route path="/hub/fornecedores/:id">
                                {(params) => (
                                  <Layout>
                                    <SupplierDetail />
                                  </Layout>
                                )}
                              </Route>
                              
                              <Route path="/hub/templates/:id">
                                {(params) => (
                                  <Layout>
                                    <TemplateDetail />
                                  </Layout>
                                )}
                              </Route>
                              
                              <Route path="/hub/prompts-ia/:id">
                                {(params) => (
                                  <Layout>
                                    <PromptDetail />
                                  </Layout>
                                )}
                              </Route>

                              {/* Admin routes */}
                              <Route path="/admin/usuarios">
                                <AdminLayout>
                                  <UserManagement />
                                </AdminLayout>
                              </Route>
                              
                              <Route path="/admin/suporte">
                                <AdminLayout>
                                  <SupportManagement />
                                </AdminLayout>
                              </Route>
                              
                              <Route path="/admin/configuracoes">
                                <AdminLayout>
                                  <GeneralSettings />
                                </AdminLayout>
                              </Route>
                              
                              <Route path="/admin/conteudo">
                                <AdminLayout>
                                  <ContentManagement />
                                </AdminLayout>
                              </Route>
                              
                              <Route path="/admin">
                                <AdminLayout>
                                  <AdminDashboard />
                                </AdminLayout>
                              </Route>

                              {/* Main routes with Layout */}
                              <Route path="/videos">
                                <Layout>
                                  <Videos />
                                </Layout>
                              </Route>
                              
                              <Route path="/news">
                                <Layout>
                                  <News />
                                </Layout>
                              </Route>
                              
                              <Route path="/updates">
                                <Layout>
                                  <Updates />
                                </Layout>
                              </Route>
                              
                              <Route path="/hub/:section">
                                <Layout>
                                  <Hub />
                                </Layout>
                              </Route>
                              
                              <Route path="/hub">
                                <Layout>
                                  <Hub />
                                </Layout>
                              </Route>
                              
                              <Route path="/minha-area/:section">
                                <Layout>
                                  <MyArea />
                                </Layout>
                              </Route>
                              
                              <Route path="/minha-area">
                                <Layout>
                                  <MyArea />
                                </Layout>
                              </Route>
                              
                              <Route path="/hub/fornecedores">
                                <Layout>
                                  <Suppliers />
                                </Layout>
                              </Route>

                              {/* Home route */}
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