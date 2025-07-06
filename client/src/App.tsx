
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider"
import { AdminLayout } from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from "./contexts/AuthContext";
import { CombinedProvider } from "./contexts/CombinedProvider";
import { Suspense, lazy, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { backgroundPrefetch } from '@/lib/prefetch';
import { useFontLoader } from '@/lib/fontLoader';
import { useOptimizedIcons } from '@/components/IconLoader';

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Videos = lazy(() => import("./pages/Videos"));
const News = lazy(() => import("./pages/News"));
const Updates = lazy(() => import("./pages/Updates"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const UserEdit = lazy(() => import("./pages/admin/UserEdit"));
const GroupEdit = lazy(() => import("./pages/admin/GroupEdit"));

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

const HtmlDescriptionAgent = lazy(() => import("./pages/agents/HtmlDescriptionAgent"));
const BulletPointsAgent = lazy(() => import("./pages/agents/BulletPointsAgent"));
const AmazonProductPhotography = lazy(() => import("./pages/agents/amazon-product-photography"));
const LifestyleWithModel = lazy(() => import("./pages/agents/lifestyle-with-model"));
const InfographicGenerator = lazy(() => import("./pages/agents/infographic-generator"));
const AdvancedInfographicGenerator = lazy(() => import("./pages/agents/AdvancedInfographicGenerator"));
const AmazonReviewExtractor = lazy(() => import("./pages/hub/AmazonReviewExtractor"));
const KeywordSearchReport = lazy(() => import("./pages/hub/KeywordSearchReport"));
const AmazonProductDetails = lazy(() => import("./pages/hub/AmazonProductDetails"));
const CNPJConsulta = lazy(() => import("./pages/hub/CNPJConsulta"));
const AmazonKeywordSuggestions = lazy(() => import("./pages/hub/AmazonKeywordSuggestions"));
const Hub = lazy(() => import("./pages/Hub"));
const MyArea = lazy(() => import("./pages/MyArea"));
const AgentsPage = lazy(() => import("./pages/agents"));
const AgentProcessorPage = lazy(() => import("./pages/AgentProcessorPage"));
const AmazonListingsOptimizer = lazy(() => import("./pages/agents/amazon-listings-optimizer"));
const AmazonListingsOptimizerResult = lazy(() => import("./pages/agents/amazon-listings-optimizer-result"));
const AmazonListingsOptimizerNew = lazy(() => import("./pages/agents/amazon-listings-optimizer-new"));
const AgentProviderSettings = lazy(() => import("./pages/admin/agents/AgentProviderSettings"));
const GeneratedImages = lazy(() => import("./pages/admin/GeneratedImages"));
const LayoutDemo = lazy(() => import("./components/layout/LayoutDemo"));
const ImageUpscale = lazy(() => import("./pages/ai/ImageUpscale"));
const BackgroundRemoval = lazy(() => import("./pages/ai/BackgroundRemoval"));


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
  // Initialize optimized loading systems
  const { loadRouteSpecificFonts } = useFontLoader();
  const { preloadCriticalIcons } = useOptimizedIcons();

  useEffect(() => {
    // Initialize all performance optimizations
    backgroundPrefetch();
    preloadCriticalIcons();
    
    // Load fonts based on current route
    const currentPath = window.location.pathname;
    loadRouteSpecificFonts(currentPath);
  }, [loadRouteSpecificFonts, preloadCriticalIcons]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <CombinedProvider>
                            <Switch>
                          <Route path="/login" component={Login} />
                          <Route path="/auth" component={Login} />

                          {/* AI routes */}
                          <Route path="/ai/image-upscale">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ImageUpscale />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ai/background-removal">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <BackgroundRemoval />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

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
                                  <AmazonListingsOptimizerNew />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/agent-amazon-product-photography">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonProductPhotography />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/agent-lifestyle-with-model">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <LifestyleWithModel />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/agent-infographic-generator">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <InfographicGenerator />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/advanced-infographic-generator">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AdvancedInfographicGenerator />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/html-description-generator">
                            <ProtectedRoute>
                              <Suspense fallback={<PageLoader />}>
                                <HtmlDescriptionAgent />
                              </Suspense>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/bullet-points-generator">
                            <ProtectedRoute>
                              <Suspense fallback={<PageLoader />}>
                                <BulletPointsAgent />
                              </Suspense>
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
                          <Route path="/hub/amazon-reviews">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonReviewExtractor />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/relatorio-keywords">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <KeywordSearchReport />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/produto-detalhes">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonProductDetails />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/consulta-cnpj">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <CNPJConsulta />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub/keyword-suggestions">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonKeywordSuggestions />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
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
                          
                          <Route path="/hub/descricao-html">
                            {() => {
                              // Redirect to the new agent route
                              window.location.href = '/agents/html-description-generator';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/layout-demo">
                            <ProtectedRoute>
                              <Suspense fallback={<PageLoader />}>
                                <LayoutDemo />
                              </Suspense>
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

                          {/* MyArea routes (English alias) - Protected */}
                          <Route path="/myarea/:section/:id?/:action?">
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
                          
                          <Route path="/admin/usuarios/:id/editar">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Suspense fallback={<PageLoader />}>
                                    <UserEdit params={params} />
                                  </Suspense>
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/usuarios/novo">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <UserEdit />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/admin/usuarios/grupos/:id">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Suspense fallback={<PageLoader />}>
                                    <GroupEdit params={params} />
                                  </Suspense>
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/usuarios/grupos/novo">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <GroupEdit />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>
                          

                          
                          <Route path="/admin/configuracoes/:section?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Suspense fallback={<PageLoader />}>
                                    <GeneralSettings />
                                  </Suspense>
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/conteudo/:subsection?/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Suspense fallback={<PageLoader />}>
                                    <ContentManagement />
                                  </Suspense>
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin/:section/:subsection?/:id?/:action?">
                            {(params) => (
                              <ProtectedRoute requireAdmin>
                                <AdminLayout>
                                  <Suspense fallback={<PageLoader />}>
                                    <Admin />
                                  </Suspense>
                                </AdminLayout>
                              </ProtectedRoute>
                            )}
                          </Route>
                          
                          <Route path="/admin">
                            <ProtectedRoute requireAdmin>
                              <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <AdminDashboard />
                                </Suspense>
                              </AdminLayout>
                            </ProtectedRoute>
                          </Route>

                          {/* Main user routes - Protected */}
                          <Route path="/videos">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Videos />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/noticias">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <News />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/novidades">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Updates />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/fornecedores">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Suppliers />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          


                          {/* Home route - Protected */}
                          <Route path="/">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Dashboard />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                            </Switch>
                            <Toaster />
            </CombinedProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
