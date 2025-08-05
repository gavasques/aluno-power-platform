/**
 * USE ROUTE CONFIGURATION HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciar configuração de rotas
 * Antes: Configuração de rotas espalhada em 1.221 linhas
 * Depois: Hook dedicado para organização e gerenciamento de rotas
 */

import { useMemo } from 'react';
import { lazy } from 'react';
import type { 
  UseRouteConfigurationReturn, 
  RouteConfig, 
  RouteGroup,
  RouteDefinitions
} from '../types';

// Lazy load components for performance
const lazyComponents = {
  // Authentication
  LoginNew: lazy(() => import('../../pages/LoginNew')),
  ForgotPassword: lazy(() => import('../../pages/ForgotPassword')),
  ResetPassword: lazy(() => import('../../pages/ResetPassword')),
  PhoneVerification: lazy(() => import('../../pages/PhoneVerification')),
  
  // Admin
  AdminDashboard: lazy(() => import('../../pages/admin/AdminDashboard')),
  Admin: lazy(() => import('../../pages/Admin')),
  UserManagement: lazy(() => import('../../pages/admin/UserManagement')),
  UserEdit: lazy(() => import('../../pages/admin/UserEdit')),
  GroupEdit: lazy(() => import('../../pages/admin/GroupEdit')),
  GroupDetail: lazy(() => import('../../pages/admin/GroupDetail')),
  ContentManagement: lazy(() => import('../../pages/admin/ContentManagement')),
  AgentProviderSettings: lazy(() => import('../../pages/admin/agents/AgentProviderSettings')),
  AdminCadastros: lazy(() => import('../../pages/admin/AdminCadastros')),
  
  // Hub
  Hub: lazy(() => import('../../pages/Hub')),
  News: lazy(() => import('../../pages/News')),
  Updates: lazy(() => import('../../pages/Updates')),
  Tools: lazy(() => import('../../pages/hub/Tools')),
  Materials: lazy(() => import('../../pages/hub/Materials')),
  Suppliers: lazy(() => import('../../pages/hub/Suppliers')),
  Partners: lazy(() => import('../../pages/hub/Partners')),
  
  // Detail Pages
  MaterialDetailPage: lazy(() => import('../../pages/hub/MaterialDetailPage')),
  PartnerDetail: lazy(() => import('../../pages/hub/PartnerDetailSimple')),
  ToolDetail: lazy(() => import('../../pages/hub/ToolDetail')),
  SupplierDetail: lazy(() => import('../../pages/hub/SupplierDetail')),
  PromptDetail: lazy(() => import('../../pages/hub/PromptDetail')),
  
  // Tools
  Ferramentas: lazy(() => import('../../pages/Ferramentas')),
  AmazonReviewExtractor: lazy(() => import('../../pages/hub/AmazonReviewExtractor')),
  KeywordSearchReport: lazy(() => import('../../pages/hub/KeywordSearchReport/KeywordSearchRefactored')),
  AmazonProductDetails: lazy(() => import('../../pages/hub/AmazonProductDetails/AmazonProductDetailsRefactored')),
  CompararListings: lazy(() => import('../../pages/hub/CompararListings')),
  CNPJConsulta: lazy(() => import('../../pages/hub/CNPJConsulta')),
  AmazonKeywordSuggestions: lazy(() => import('../../pages/hub/AmazonKeywordSuggestions')),
  
  // AI Tools
  ImageUpscale: lazy(() => import('../../pages/ai/ImageUpscale')),
  BackgroundRemoval: lazy(() => import('../../pages/ai/BackgroundRemoval')),
  BackgroundRemovalPro: lazy(() => import('../../pages/tools/BackgroundRemovalPro')),
  LogoGeneratorPro: lazy(() => import('../../pages/tools/LogoGeneratorPro')),
  UltraMelhoradorPro: lazy(() => import('../../pages/tools/UltraMelhoradorPro')),
  UpscalePro: lazy(() => import('../../pages/tools/UpscalePro')),
  AmazonAdsEditor: lazy(() => import('../../pages/tools/AmazonAdsEditor')),
  
  // Agents
  AgentsPage: lazy(() => import('../../pages/agents')),
  HtmlDescriptionAgent: lazy(() => import('../../pages/agents/HtmlDescriptionAgent')),
  BulletPointsAgent: lazy(() => import('../../pages/agents/BulletPointsAgent')),
  AmazonProductPhotography: lazy(() => import('../../pages/agents/amazon-product-photography')),
  LifestyleWithModel: lazy(() => import('../../pages/agents/lifestyle-with-model')),
  InfographicGenerator: lazy(() => import('../../pages/agents/infographic-generator')),
  AdvancedInfographicGenerator: lazy(() => import('../../pages/agents/AdvancedInfographicGenerator/AdvancedInfographicGeneratorRefactored')),
  AmazonListingsOptimizer: lazy(() => import('../../pages/agents/amazon-listings-optimizer-new')),
  AmazonListingsOptimizerResult: lazy(() => import('../../pages/agents/amazon-listings-optimizer-result')),
  AmazonCustomerService: lazy(() => import('../../pages/agents/amazon-customer-service')),
  AmazonCustomerServiceResult: lazy(() => import('../../pages/agents/amazon-customer-service-result')),
  AmazonNegativeReviews: lazy(() => import('../../pages/agents/amazon-negative-reviews')),
  AmazonNegativeReviewsResult: lazy(() => import('../../pages/agents/amazon-negative-reviews-result')),
  AmazonImageProcessing: lazy(() => import('../../pages/agents/amazon-image-processing')),
  
  // My Area
  MyArea: lazy(() => import('../../pages/MyArea')),
  MinhaAreaIndex: lazy(() => import('../../pages/MinhaAreaIndex')),
  UserDashboard: lazy(() => import('../../pages/user/DashboardSimple')),
  UserUsage: lazy(() => import('../../pages/user/Usage')),
  UserProfile: lazy(() => import('../../pages/myarea/UserProfile')),
  
  // My Area - Products
  ProductsNew: lazy(() => import('../../pages/myarea/ProductsNew')),
  ProductChannelsManager: lazy(() => import('../../pages/myarea/ProductChannelsManager')),
  ProductEdit: lazy(() => import('../../pages/myarea/ProductEdit')),
  ProductEditWithTabs: lazy(() => import('../../pages/myarea/ProductEditWithTabs')),
  ProductImportExport: lazy(() => import('../../pages/myarea/ProductImportExport')),
  
  // My Area - Imports
  ImportacoesIndex: lazy(() => import('../../pages/myarea/ImportacoesIndex')),
  InternationalSupplierCRM: lazy(() => import('../../pages/myarea/InternationalSupplierCRM')),
  InternationalSupplierForm: lazy(() => import('../../pages/myarea/InternationalSupplierForm')),
  InternationalSupplierDetail: lazy(() => import('../../pages/myarea/InternationalSupplierDetail')),
  ImportedProductsIndex: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductsIndex')),
  ImportedProductForm: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductForm')),
  ImportedProductDetail: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductDetail')),
  
  // Finanças360
  Financas360Index: lazy(() => import('../../pages/myarea/financas360/Financas360Index')),
  
  // Packing List Generator
  PackingListGenerator: lazy(() => import('../../pages/myarea/importacoes/packing-list-generator')),
  DocumentosSalvos: lazy(() => import('../../pages/myarea/importacoes/documentos-salvos')),
  GeradorEtiquetas: lazy(() => import('../../pages/myarea/importacoes/gerador-etiquetas')),
  MinhasEmpresas: lazy(() => import('../../pages/myarea/importacoes/MinhasEmpresas')),
  
  // Simulators
  SimuladoresIndex: lazy(() => import('../../pages/SimuladoresIndex')),
  SimuladorSimplificado: lazy(() => import('../../pages/simuladores/SimuladorSimplificado')),
  FormalImportSimulator: lazy(() => import('../../pages/FormalImportSimulator')),
  FormalImportSimulatorFixed: lazy(() => import('../../pages/FormalImportSimulatorFixed')),
  FormalImportSimulationsFixed: lazy(() => import('../../pages/FormalImportSimulationsFixed')),
  SimplesNacional: lazy(() => import('../../pages/simuladores/SimplesNacional')),
  SimplesNacionalCompleto: lazy(() => import('../../pages/simuladores/SimplesNacionalCompleto')),
  InvestimentosROI: lazy(() => import('../../pages/simuladores/InvestimentosROI')),
  
  // Subscription
  SubscriptionPage: lazy(() => import('../../pages/subscription/SubscriptionPage')),
  
  // Legal
  TermsOfService: lazy(() => import('../../pages/TermsOfService')),
  PrivacyPolicy: lazy(() => import('../../pages/PrivacyPolicy'))
};

export function useRouteConfiguration(): UseRouteConfigurationReturn {
  
  const routeDefinitions: RouteDefinitions = useMemo(() => ({
    // Main Routes
    MAIN_ROUTES: [
      { path: '/', component: lazyComponents.UserDashboard, isProtected: true },
    ],
    
    // Authentication Routes (Public - No Layout)
    AUTH_ROUTES: [
      { path: '/login', component: lazyComponents.LoginNew, isProtected: false, layout: 'none' },
      { path: '/forgot-password', component: lazyComponents.ForgotPassword, isProtected: false, layout: 'none' },
      { path: '/reset-password', component: lazyComponents.ResetPassword, isProtected: false, layout: 'none' },
      { path: '/phone-verification', component: lazyComponents.PhoneVerification, isProtected: false, layout: 'none' }
    ],
    
    // Admin Routes (Protected + Admin Layout)
    ADMIN_ROUTES: [
      { path: '/admin', component: lazyComponents.AdminDashboard, isProtected: true, layout: 'admin' },
      { path: '/admin/dashboard', component: lazyComponents.Admin, isProtected: true, layout: 'admin' },
      { path: '/admin/users', component: lazyComponents.UserManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios', component: lazyComponents.UserManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/users/:id/edit', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/:id/edit', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/novo', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/grupos/:id', component: lazyComponents.GroupDetail, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/grupos/:id/edit', component: lazyComponents.GroupEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/groups/:id/edit', component: lazyComponents.GroupEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/content', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection/:id', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection/:id/:action', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/agents', component: lazyComponents.AgentProviderSettings, isProtected: true, layout: 'admin' },
      { path: '/admin/cadastros', component: lazyComponents.AdminCadastros, isProtected: true, layout: 'admin' },
      { path: '/admin/cadastros/:subsection', component: lazyComponents.AdminCadastros, isProtected: true, layout: 'admin' },
      { path: '/admin/configuracoes', component: lazyComponents.AdminDashboard, isProtected: true, layout: 'admin' }
    ],
    
    // Hub Routes (Protected)
    HUB_ROUTES: [
      { path: '/hub', component: lazyComponents.Hub, isProtected: true },
      { path: '/hub/news', component: lazyComponents.News, isProtected: true },
      { path: '/hub/updates', component: lazyComponents.Updates, isProtected: true },
      { path: '/hub/ferramentas', component: lazyComponents.Tools, isProtected: true },
      { path: '/hub/materiais', component: lazyComponents.Materials, isProtected: true },
      { path: '/hub/fornecedores', component: lazyComponents.Suppliers, isProtected: true },
      { path: '/hub/parceiros', component: lazyComponents.Partners, isProtected: true },
      { path: '/hub/materiais/:id', component: lazyComponents.MaterialDetailPage, isProtected: true },
      { path: '/hub/parceiros/:id', component: lazyComponents.PartnerDetail, isProtected: true },
      { path: '/hub/ferramentas/:id', component: lazyComponents.ToolDetail, isProtected: true },
      { path: '/hub/fornecedores/:id', component: lazyComponents.SupplierDetail, isProtected: true },
      { path: '/hub/prompts-ia/:id', component: lazyComponents.PromptDetail, isProtected: true }
    ],
    
    // Tools Routes (Protected)
    TOOLS_ROUTES: [
      { path: '/ferramentas', component: lazyComponents.Ferramentas, isProtected: true },
      { path: '/ferramentas/amazon-reviews', component: lazyComponents.AmazonReviewExtractor, isProtected: true },
      { path: '/ferramentas/relatorio-keywords', component: lazyComponents.KeywordSearchReport, isProtected: true },
      { path: '/ferramentas/produto-detalhes', component: lazyComponents.AmazonProductDetails, isProtected: true },
      { path: '/ferramentas/comparar-listings', component: lazyComponents.CompararListings, isProtected: true },
      { path: '/ferramentas/consulta-cnpj', component: lazyComponents.CNPJConsulta, isProtected: true },
      { path: '/ferramentas/keyword-suggestions', component: lazyComponents.AmazonKeywordSuggestions, isProtected: true },
      { path: '/ai/image-upscale', component: lazyComponents.ImageUpscale, isProtected: true },
      { path: '/ai/background-removal', component: lazyComponents.BackgroundRemoval, isProtected: true },
      { path: '/ferramentas/remover-fundo-pro', component: lazyComponents.BackgroundRemovalPro, isProtected: true },
      { path: '/ferramentas/gerador-logomarcas-pro', component: lazyComponents.LogoGeneratorPro, isProtected: true },
      { path: '/ferramentas/ultra-melhorador-pro', component: lazyComponents.UltraMelhoradorPro, isProtected: true },
      { path: '/ferramentas/upscale-pro', component: lazyComponents.UpscalePro, isProtected: true },
      { path: '/ferramentas/amazon-ads-editor', component: lazyComponents.AmazonAdsEditor, isProtected: true }
    ],
    
    // Agent Routes (Protected)
    AGENT_ROUTES: [
      { path: '/agentes', component: lazyComponents.AgentsPage, isProtected: true },
      { path: '/agentes/bullet-points-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      { path: '/agents/html-description-generator', component: lazyComponents.HtmlDescriptionAgent, isProtected: true },
      { path: '/agents/bullet-point-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      { path: '/agents/bullet-points-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      { path: '/agents/agent-amazon-product-photography', component: lazyComponents.AmazonProductPhotography, isProtected: true },
      { path: '/agents/lifestyle-with-model', component: lazyComponents.LifestyleWithModel, isProtected: true },
      { path: '/agents/infographic-generator', component: lazyComponents.InfographicGenerator, isProtected: true },
      { path: '/agents/advanced-infographic-generator', component: lazyComponents.AdvancedInfographicGenerator, isProtected: true },
      { path: '/agents/amazon-listings-optimizer', component: lazyComponents.AmazonListingsOptimizer, isProtected: true },
      { path: '/agents/amazon-listings-optimizer/result', component: lazyComponents.AmazonListingsOptimizerResult, isProtected: true },
      { path: '/agentes/amazon-customer-service', component: lazyComponents.AmazonCustomerService, isProtected: true },
      { path: '/agentes/amazon-customer-service/resultado/:sessionId', component: lazyComponents.AmazonCustomerServiceResult, isProtected: true },
      { path: '/agents/amazon-negative-reviews', component: lazyComponents.AmazonNegativeReviews, isProtected: true },
      { path: '/agents/amazon-negative-reviews/result', component: lazyComponents.AmazonNegativeReviewsResult, isProtected: true },
      { path: '/agentes/amazon-negative-reviews', component: lazyComponents.AmazonNegativeReviews, isProtected: true },
      { path: '/agentes/amazon-negative-reviews/resultado/:sessionId', component: lazyComponents.AmazonNegativeReviewsResult, isProtected: true },
      { path: '/agentes/amazon-image-processing', component: lazyComponents.AmazonImageProcessing, isProtected: true }
    ],
    
    // My Area Routes (Protected)
    MY_AREA_ROUTES: [
      { path: '/minha-area', component: lazyComponents.MinhaAreaIndex, isProtected: true },
      { path: '/my-area', component: lazyComponents.MyArea, isProtected: true },
      { path: '/user/dashboard', component: lazyComponents.UserDashboard, isProtected: true },
      { path: '/user/usage', component: lazyComponents.UserUsage, isProtected: true },
      { path: '/minha-area/perfil', component: lazyComponents.UserProfile, isProtected: true },
      { path: '/subscription', component: lazyComponents.SubscriptionPage, isProtected: true },
      
      // Products
      { path: '/produtos-novo', component: lazyComponents.ProductsNew, isProtected: true },
      { path: '/produtos-novo/:id/canais', component: lazyComponents.ProductChannelsManager, isProtected: true },
      { path: '/minha-area/produtos/:id/editar', component: lazyComponents.ProductEdit, isProtected: true },
      { path: '/minha-area/produtos/:id/editar-completo', component: lazyComponents.ProductEditWithTabs, isProtected: true },
      { path: '/minha-area/produtos/import-export', component: lazyComponents.ProductImportExport, isProtected: true },
      
      // Imports
      { path: '/minha-area/importacoes', component: lazyComponents.ImportacoesIndex, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores', component: lazyComponents.InternationalSupplierCRM, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores/novo', component: lazyComponents.InternationalSupplierForm, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores/:id', component: lazyComponents.InternationalSupplierDetail, isProtected: true },
      { path: '/minha-area/importacoes/produtos', component: lazyComponents.ImportedProductsIndex, isProtected: true },
      { path: '/minha-area/importacoes/produtos/novo', component: lazyComponents.ImportedProductForm, isProtected: true },
      { path: '/minha-area/importacoes/produtos/:id', component: lazyComponents.ImportedProductDetail, isProtected: true },
      { path: '/minha-area/importacoes/produtos/:id/editar', component: lazyComponents.ImportedProductForm, isProtected: true },
      
      // Packing List Generator
      { path: '/minha-area/importacoes/packing-list-generator', component: lazyComponents.PackingListGenerator, isProtected: true },
      { path: '/minha-area/importacoes/documentos-salvos', component: lazyComponents.DocumentosSalvos, isProtected: true },
      { path: '/minha-area/importacoes/gerador-etiquetas', component: lazyComponents.GeradorEtiquetas, isProtected: true },
      { path: '/minha-area/importacoes/minhas-empresas', component: lazyComponents.MinhasEmpresas, isProtected: true },
      
      // Finanças360
      { path: '/minha-area/financas360', component: lazyComponents.Financas360Index, isProtected: true }
    ],
    
    // Simulator Routes (Protected)
    SIMULATOR_ROUTES: [
      { path: '/simuladores', component: lazyComponents.SimuladoresIndex, isProtected: true },
      { path: '/minha-area/importacoes/simuladores/simplificado', component: lazyComponents.SimuladorSimplificado, isProtected: true },
      { path: '/simuladores/importacao-formal-direta', component: lazyComponents.FormalImportSimulationsFixed, isProtected: true },
      { path: '/simuladores/importacao-formal-direta/nova', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/simuladores/importacao-formal-direta/editar/:id', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/minha-area/importacoes/simuladores/importacao-formal-direta', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/simuladores/simples-nacional', component: lazyComponents.SimplesNacional, isProtected: true },
      { path: '/simuladores/simulador-simples-nacional-completo', component: lazyComponents.SimplesNacionalCompleto, isProtected: true },
      { path: '/simuladores/simulador-de-investimentos-e-roi', component: lazyComponents.InvestimentosROI, isProtected: true }
    ],
    
    // Legal Routes (Public)
    LEGAL_ROUTES: [
      { path: '/terms', component: lazyComponents.TermsOfService, isProtected: false },
      { path: '/privacy', component: lazyComponents.PrivacyPolicy, isProtected: false }
    ]
  }), []);

  const routeGroups: RouteGroup[] = useMemo(() => [
    { name: 'Main', routes: routeDefinitions.MAIN_ROUTES, description: 'Main application routes' },
    { name: 'Authentication', routes: routeDefinitions.AUTH_ROUTES, description: 'Login and authentication pages' },
    { name: 'Administration', routes: routeDefinitions.ADMIN_ROUTES, description: 'Admin panel routes', prefix: '/admin' },
    { name: 'Hub', routes: routeDefinitions.HUB_ROUTES, description: 'Hub resources and content', prefix: '/hub' },
    { name: 'Tools', routes: routeDefinitions.TOOLS_ROUTES, description: 'Tools and utilities', prefix: '/ferramentas' },
    { name: 'Agents', routes: routeDefinitions.AGENT_ROUTES, description: 'AI agents and processors', prefix: '/agentes' },
    { name: 'My Area', routes: routeDefinitions.MY_AREA_ROUTES, description: 'User personal area', prefix: '/minha-area' },
    { name: 'Simulators', routes: routeDefinitions.SIMULATOR_ROUTES, description: 'Financial simulators', prefix: '/simuladores' },
    { name: 'Legal', routes: routeDefinitions.LEGAL_ROUTES, description: 'Legal and policy pages' }
  ], [routeDefinitions]);

  const allRoutes: RouteConfig[] = useMemo(() => {
    return Object.values(routeDefinitions).flat();
  }, [routeDefinitions]);

  const getRouteByPath = (path: string): RouteConfig | undefined => {
    return allRoutes.find(route => route.path === path);
  };

  const getRoutesByGroup = (groupName: string): RouteConfig[] => {
    const group = routeGroups.find(g => g.name === groupName);
    return group ? group.routes : [];
  };

  return {
    routeGroups,
    allRoutes,
    getRouteByPath,
    getRoutesByGroup
  };
}