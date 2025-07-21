
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LazyLoader, useComponentPreloader } from "@/components/common/LazyLoader";
import { useQueryMemoryOptimization, useBackgroundSync } from '@/lib/queryOptimizations';
import { backgroundPrefetch } from '@/lib/prefetch';
import { useFontLoader } from '@/lib/fontLoader';
import { useOptimizedIcons } from '@/components/IconLoader';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages for better performance
const News = lazy(() => import("./pages/News"));
const Updates = lazy(() => import("./pages/Updates"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const UserEdit = lazy(() => import("./pages/admin/UserEdit"));
const GroupEdit = lazy(() => import("./pages/admin/GroupEdit"));


const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const Suppliers = lazy(() => import("./pages/hub/Suppliers"));
const Partners = lazy(() => import("./pages/hub/Partners"));
const PartnerDetail = lazy(() => import("./pages/hub/PartnerDetailSimple"));
const ToolDetail = lazy(() => import("./pages/hub/ToolDetail"));
const MaterialDetailPage = lazy(() => import("./pages/hub/MaterialDetailPage"));
const SupplierDetail = lazy(() => import("./pages/hub/SupplierDetail"));

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
const Tools = lazy(() => import("./pages/hub/Tools"));
const Materials = lazy(() => import("./pages/hub/Materials"));
const Hub = lazy(() => import("./pages/Hub"));
const Ferramentas = lazy(() => import("./pages/Ferramentas"));
const MyArea = lazy(() => import("./pages/MyArea"));
const MinhaAreaIndex = lazy(() => import("./pages/MinhaAreaIndex"));
const SimuladoresIndex = lazy(() => import("./pages/SimuladoresIndex"));
const ImportacoesIndex = lazy(() => import("./pages/myarea/ImportacoesIndex"));
const ImportacaoSimplificada = lazy(() => import("./pages/simuladores/ImportacaoSimplificada"));
const SimuladorSimplificado = lazy(() => import("./pages/simuladores/SimuladorSimplificado"));
const InformalImportSimulationsList = lazy(() => import("./pages/InformalImportSimulationsListSimple"));
const InformalImportSimulator = lazy(() => import("./pages/InformalImportSimulator"));
const FormalImportSimulator = lazy(() => import("./pages/FormalImportSimulator"));
const FormalImportSimulationsList = lazy(() => import("./pages/FormalImportSimulationsList"));
const SimplesNacional = lazy(() => import("./pages/simuladores/SimplesNacional"));
const SimplesNacionalCompleto = lazy(() => import("./pages/simuladores/SimplesNacionalCompleto"));
const InvestimentosROI = lazy(() => import("./pages/simuladores/InvestimentosROI"));
const AgentsPage = lazy(() => import("./pages/agents"));
const AgentProcessorPage = lazy(() => import("./pages/AgentProcessorPage"));
const AmazonListingsOptimizer = lazy(() => import("./pages/agents/amazon-listings-optimizer-new"));
const AmazonListingsOptimizerResult = lazy(() => import("./pages/agents/amazon-listings-optimizer-result"));
const AmazonCustomerService = lazy(() => import("./pages/agents/amazon-customer-service"));
const AmazonCustomerServiceResult = lazy(() => import("./pages/agents/amazon-customer-service-result"));
const AmazonNegativeReviews = lazy(() => import("./pages/agents/amazon-negative-reviews"));
const AmazonNegativeReviewsResult = lazy(() => import("./pages/agents/amazon-negative-reviews-result"));
const AgentProviderSettings = lazy(() => import("./pages/admin/agents/AgentProviderSettings"));


const ImageUpscale = lazy(() => import("./pages/ai/ImageUpscale"));
const BackgroundRemoval = lazy(() => import("./pages/ai/BackgroundRemoval"));
const BackgroundRemovalPro = lazy(() => import("./pages/tools/BackgroundRemovalPro"));
const LogoGeneratorPro = lazy(() => import("./pages/tools/LogoGeneratorPro"));
const UltraMelhoradorPro = lazy(() => import("./pages/tools/UltraMelhoradorPro"));
const UpscalePro = lazy(() => import("./pages/tools/UpscalePro"));
const AmazonAdsEditor = lazy(() => import("./pages/tools/AmazonAdsEditor"));
const UserDashboard = lazy(() => import("./pages/user/DashboardSimple"));
const UserUsage = lazy(() => import("./pages/user/Usage"));
const SubscriptionPage = lazy(() => import("./pages/subscription/SubscriptionPage"));
const UserProfile = lazy(() => import("./pages/myarea/UserProfile"));

// My Area Product Management
// Legacy product components removed - now handled by PRODUTOS PRO
const ProductImportExport = lazy(() => import("./pages/myarea/ProductImportExport"));

// NEW PARALLEL PRODUCTS & CHANNELS SYSTEM
const ProductsNew = lazy(() => import("./pages/myarea/ProductsNew"));
const ProductChannelsManager = lazy(() => import("./pages/myarea/ProductChannelsManager"));
const ProductEdit = lazy(() => import("./pages/myarea/ProductEdit"));
const ProductEditWithTabs = lazy(() => import("./pages/myarea/ProductEditWithTabs"));


// Keep Login as eager import for immediate authentication
import LoginNew from "./pages/LoginNew";

// Password Recovery Pages
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PhoneVerification = lazy(() => import("./pages/PhoneVerification"));

// Legal Pages
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-3">
      <LoadingSpinner size="md" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthenticatedPreloader } from "./components/AuthenticatedPreloader";

function App() {
  // Initialize optimized loading systems
  const { loadRouteSpecificFonts } = useFontLoader();
  const { preloadCriticalIcons } = useOptimizedIcons();
  
  // Phase 2 Performance Optimizations - moved inside CombinedProvider
  // useQueryMemoryOptimization();
  // useBackgroundSync();

  useEffect(() => {
    // Initialize basic optimizations (not user-dependent)
    preloadCriticalIcons();
    
    // Load fonts based on current route
    const currentPath = window.location.pathname;
    loadRouteSpecificFonts(currentPath);
  }, [loadRouteSpecificFonts, preloadCriticalIcons]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <HelmetProvider>
            <AuthProvider>
              <AuthenticatedPreloader />
              <CombinedProvider>
                            <Switch>
                          <Route path="/login" component={LoginNew} />
                          
                          {/* Password Recovery Routes */}
                          <Route path="/forgot-password">
                            <Suspense fallback={<PageLoader />}>
                              <ForgotPassword />
                            </Suspense>
                          </Route>
                          
                          <Route path="/reset-password">
                            <Suspense fallback={<PageLoader />}>
                              <ResetPassword />
                            </Suspense>
                          </Route>
                          
                          <Route path="/phone-verification">
                            <Suspense fallback={<PageLoader />}>
                              <PhoneVerification />
                            </Suspense>
                          </Route>

                          {/* Legal Pages - Public Access */}
                          <Route path="/termos-de-uso">
                            <Suspense fallback={<PageLoader />}>
                              <TermsOfService />
                            </Suspense>
                          </Route>
                          
                          <Route path="/politica-de-privacidade">
                            <Suspense fallback={<PageLoader />}>
                              <PrivacyPolicy />
                            </Suspense>
                          </Route>

                          {/* Páginas principais de listagem */}
                          <Route path="/ferramentas">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Ferramentas />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/hub">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Hub />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Ferramentas routes (migrated from AI and Hub) */}
                          <Route path="/ferramentas/image-upscale">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ImageUpscale />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/background-removal">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <BackgroundRemoval />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/amazon-ads-editor">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonAdsEditor />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* SPECIFIC AGENT ROUTES - MUST BE FIRST */}
                          <Route path="/agentes/amazon-negative-reviews/resultado/:sessionId">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonNegativeReviewsResult />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-negative-reviews">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonNegativeReviews />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-customer-service/resultado/:sessionId">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonCustomerServiceResult />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-customer-service">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonCustomerService />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents/amazon-listings-optimizer-new">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonListingsOptimizer />
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
                          
                          {/* SPECIFIC ROUTES BEFORE GENERIC */}
                          <Route path="/agents/amazon-customer-service">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonCustomerService />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agents">
                            {() => {
                              window.location.href = '/agentes';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/agentes">
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

                          <Route path="/ferramentas/amazon-reviews">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonReviewExtractor />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/relatorio-keywords">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <KeywordSearchReport />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/produto-detalhes">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonProductDetails />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/consulta-cnpj">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <CNPJConsulta />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/keyword-suggestions">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonKeywordSuggestions />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/background-removal-pro">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <BackgroundRemovalPro />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/logo-generator-pro">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <LogoGeneratorPro />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/ultra-melhorador-pro">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <UltraMelhoradorPro />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/ferramentas/upscale-pro">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <UpscalePro />
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
                          
                          <Route path="/hub/ferramentas">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Tools />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          

                          
                          <Route path="/hub/materiais">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <Materials />
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

                          {/* Redirects for backwards compatibility */}
                          <Route path="/ai/image-upscale">
                            {() => {
                              window.location.href = '/ferramentas/image-upscale';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/ai/background-removal">
                            {() => {
                              window.location.href = '/ferramentas/background-removal';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/hub/amazon-reviews">
                            {() => {
                              window.location.href = '/ferramentas/amazon-reviews';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/hub/relatorio-keywords">
                            {() => {
                              window.location.href = '/ferramentas/relatorio-keywords';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/ferramentas/picsart-background-removal">
                            {() => {
                              window.location.href = '/ferramentas/background-removal-pro';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/hub/produto-detalhes">
                            {() => {
                              window.location.href = '/ferramentas/produto-detalhes';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/hub/consulta-cnpj">
                            {() => {
                              window.location.href = '/ferramentas/consulta-cnpj';
                              return null;
                            }}
                          </Route>
                          
                          <Route path="/hub/keyword-suggestions">
                            {() => {
                              window.location.href = '/ferramentas/keyword-suggestions';
                              return null;
                            }}
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

                          {/* User Dashboard - Protected */}
                          <Route path="/user/dashboard">
                            <ProtectedRoute>
                              <Suspense fallback={<PageLoader />}>
                                <UserDashboard />
                              </Suspense>
                            </ProtectedRoute>
                          </Route>

                          {/* User Usage - Protected */}
                          <Route path="/user/usage">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <UserUsage />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>



                          {/* PRODUTOS PRO - ADVANCED MULTI-CHANNEL SYSTEM */}
                          <Route path="/produtos-pro">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ProductsNew />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          <Route path="/produtos-pro/:id/canais">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ProductChannelsManager />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          <Route path="/produtos-pro/:id/editar">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ProductEditWithTabs />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Minha Área Index - Protected */}
                          <Route path="/minha-area">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <MinhaAreaIndex />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Simuladores Index - Protected */}
                          <Route path="/simuladores">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <SimuladoresIndex />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Importações Index - Protected */}
                          <Route path="/minha-area/importacoes">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ImportacoesIndex />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Informal Import Simulations List - Main Page */}
                          <Route path="/simuladores/importacao-simplificada">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <InformalImportSimulationsList />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Informal Import Simulator - New/Edit */}
                          <Route path="/simuladores/importacao-simplificada/nova">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <InformalImportSimulator />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Formal Import Simulations List - Main Page */}
                          <Route path="/simuladores/importacao-formal-direta">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <FormalImportSimulationsList />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Formal Import Simulator - New/Edit */}
                          <Route path="/simuladores/importacao-formal-direta/nova">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <FormalImportSimulator />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/simuladores/simplificado">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <SimuladorSimplificado />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Simples Nacional Simulator - Protected */}
                          <Route path="/simuladores/simples-nacional">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <SimplesNacional />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Simples Nacional Completo Simulator - Protected */}
                          <Route path="/simuladores/simulador-simples-nacional-completo">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <SimplesNacionalCompleto />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Investimentos e ROI Simulator - Protected */}
                          <Route path="/simuladores/simulador-de-investimentos-e-roi">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <InvestimentosROI />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Investimentos e ROI Simulator - Short URL - Protected */}
                          <Route path="/simuladores/investimentos-roi">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <InvestimentosROI />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* Minha Área routes - Protected */}
                          <Route path="/minha-area/perfil">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <UserProfile />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          {/* Product Import/Export - Protected */}
                          <Route path="/minha-area/importacao-exportacao">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <ProductImportExport />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          {/* Legacy Product Management Routes - REMOVED */}
                          {/* All product management now handled by PRODUTOS PRO system */}
                          
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

                          {/* Main user routes - Protected with permissions */}
                          
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
                                  <UserDashboard />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* SPECIFIC AGENT ROUTES FOR /agentes */}
                          <Route path="/agentes/amazon-negative-reviews">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonNegativeReviews />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-negative-reviews/result">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonNegativeReviewsResult />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-customer-service">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonCustomerService />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>
                          
                          <Route path="/agentes/amazon-customer-service/result">
                            <ProtectedRoute>
                              <Layout>
                                <Suspense fallback={<PageLoader />}>
                                  <AmazonCustomerServiceResult />
                                </Suspense>
                              </Layout>
                            </ProtectedRoute>
                          </Route>

                          {/* GENERIC AGENT ROUTE FOR /agentes - CATCH ALL */}
                          <Route path="/agentes/:id">
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
                          
                          {/* FALLBACK REDIRECT FOR OLD /agents/:id ROUTES */}
                          <Route path="/agents/:id">
                            {(params) => {
                              window.location.href = `/agentes/${params.id}`;
                              return null;
                            }}
                          </Route>

                            </Switch>
                            <Toaster />
              </CombinedProvider>
            </AuthProvider>
          </HelmetProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
