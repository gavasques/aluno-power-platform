
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
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Videos = lazy(() => import("./pages/Videos"));
const News = lazy(() => import("./pages/News"));
const Updates = lazy(() => import("./pages/Updates"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const SupportManagement = lazy(() => import("./pages/admin/SupportManagement"));
const GeneralSettings = lazy(() => import("./pages/admin/GeneralSettings"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const Suppliers = lazy(() => import("./pages/hub/Suppliers"));
const Partners = lazy(() => import("./pages/hub/Partners"));
const PartnerDetail = lazy(() => import("./pages/hub/PartnerDetailSimple"));
const ToolDetail = lazy(() => import("./pages/hub/ToolDetail"));
const MaterialDetailPage = lazy(() => import("./pages/hub/MaterialDetailPage"));
const SupplierDetail = lazy(() => import("./pages/hub/SupplierDetail"));
const TemplateDetail = lazy(() => import("./pages/hub/TemplateDetail"));
const PromptDetail = lazy(() => import("./pages/hub/PromptDetail"));
const Hub = lazy(() => import("./pages/Hub"));
const MyArea = lazy(() => import("./pages/MyArea"));
const AgentsPage = lazy(() => import("./pages/agents"));
const AgentProcessorPage = lazy(() => import("./pages/AgentProcessorPage"));
const AmazonListingsOptimizer = lazy(() => import("./pages/agents/amazon-listings-optimizer"));
const AmazonListingsOptimizerResult = lazy(() => import("./pages/agents/amazon-listings-optimizer-result"));
const AmazonListingsOptimizerNew = lazy(() => import("./pages/agents/amazon-listings-optimizer-new"));
const AgentProviderSettings = lazy(() => import("./pages/admin/agents/AgentProviderSettings"));
const GeneratedImages = lazy(() => import("./pages/admin/GeneratedImages"));

// Keep Login as eager import for immediate authentication
import Login from "./pages/Login";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);
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
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonListingsOptimizerNew />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/amazon-listings-optimizer/result">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonListingsOptimizerResult />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/amazon-listings-optimizer">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonListingsOptimizer />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <AgentProcessorPage />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/agents">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AgentsPage />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Detail routes with Layout - Protected */}
                          <Route path="/hub/materiais/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <MaterialDetailPage />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/parceiros/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <PartnerDetail />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/ferramentas/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <ToolDetail />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/fornecedores/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <SupplierDetail />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/templates/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <TemplateDetail />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/hub/prompts-ia/:id">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <PromptDetail />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Hub section routes - Protected */}
                          <Route path="/hub/parceiros">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Partners />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/fornecedores">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Suppliers />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/:section">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <Hub />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Minha Área routes - Protected */}
                          <Route path="/minha-area/:section/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute>
                                <Layout>
                                  <Suspense fallback={<PageLoader />}>
                                    <MyArea />
                                  </Suspense>
                                </Layout>
                              </ProtectedRoute>
                            )}
                          </Route>

                          {/* Admin routes - Protected with admin requirement */}
                          <Route path="/admin/images">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <GeneratedImages />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/agents/providers">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <AgentProviderSettings />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/usuarios">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <UserManagement />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/suporte">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <SupportManagement />
                                </Suspense>
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
