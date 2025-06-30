
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
import { AgentsProvider } from "./contexts/AgentsContext";

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
import AgentsPage from "./pages/agents";
import AgentProcessorPage from "./pages/AgentProcessorPage";
import AmazonListingsOptimizer from "./pages/agents/amazon-listings-optimizer";
import AmazonListingsOptimizerResult from "./pages/agents/amazon-listings-optimizer-result";
import AmazonListingsOptimizerNew from "./pages/agents/amazon-listings-optimizer-new";

import AgentProviderSettings from "./pages/admin/agents/AgentProviderSettings";
import GeneratedImages from "./pages/admin/GeneratedImages";
import TestImagePage from "./components/TestImagePage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

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
                          <AgentsProvider>
                            <Switch>
                          <Route path="/login" component={Login} />
                          <Route path="/auth" component={Login} />

                          {/* Agents routes */}
                          <Route path="/agents/amazon-listings-optimizer-new">
                            <ProtectedRoute>
                              <Layout>
                                <AmazonListingsOptimizerNew />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/amazon-listings-optimizer/result">
                            <ProtectedRoute>
                              <Layout>
                                <AmazonListingsOptimizerResult />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/amazon-listings-optimizer">
                            <ProtectedRoute>
                              <Layout>
                                <AmazonListingsOptimizer />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <AgentProcessorPage />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/agents">
                            <ProtectedRoute>
                              <Layout>
                                <AgentsPage />
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Detail routes with Layout - Protected */}
                          <Route path="/hub/materiais/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <MaterialDetailPage />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/parceiros/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <PartnerDetail />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/ferramentas/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <ToolDetail />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/fornecedores/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <SupplierDetail />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/templates/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <TemplateDetail />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/prompts-ia/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <PromptDetail />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Hub section routes - Protected */}
                          <Route path="/hub/parceiros">
                            <ProtectedRoute>
                              <Layout>
                                <Partners />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/fornecedores">
                            <ProtectedRoute>
                              <Layout>
                                <Suppliers />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/:section">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Hub />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Minha Área routes - Protected */}
                          <Route path="/minha-area/:section/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <MyArea />
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Admin routes - Protected with admin requirement */}
                          <Route path="/admin/images">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <GeneratedImages />
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/agents/providers">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <AgentProviderSettings />
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/usuarios">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <UserManagement />
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/suporte">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <SupportManagement />
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/configuracoes/:section?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <GeneralSettings />
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/conteudo/:subsection?/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <ContentManagement />
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/:section/:subsection?/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Admin />
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <AdminDashboard />
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>

                          {/* Main user routes - Protected */}
                          <Route path="/videos">
                            <ProtectedRoute>
                              <Layout>
                                <Videos />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/noticias">
                            <ProtectedRoute>
                              <Layout>
                                <News />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/novidades">
                            <ProtectedRoute>
                              <Layout>
                                <Updates />
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/fornecedores">
                            <ProtectedRoute>
                              <Layout>
                                <Suppliers />
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Home route - Protected */}
                          <Route path="/">
                            <ProtectedRoute>
                              <Layout>
                                <Dashboard />
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                            </Switch>
                            <Toaster />
                          </AgentsProvider>
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
