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
  BackgroundRemovalPro: lazy(() => import('../../pages/tools/Tool_BackgroundRemovalPro')),
  LogoGeneratorPro: lazy(() => import('../../pages/tools/Tool_LogoGeneratorPro')),
  UltraMelhoradorPro: lazy(() => import('../../pages/tools/Tool_UltraMelhoradorPro')),
  UpscalePro: lazy(() => import('../../pages/tools/Tool_UpscalePro')),
  AmazonAdsEditor: lazy(() => import('../../pages/tools/Tool_AmazonAdsEditor')),
  
  // Agents
  Agent_Agents: lazy(() => import('../../pages/Agent_Agents')),
  HtmlDescriptionAgent: lazy(() => import('../../pages/agents/Agent_HtmlDescriptionAgent')),
  BulletPointsAgent: lazy(() => import('../../pages/agents/Agent_BulletPointsAgent')),
  AmazonProductPhotography: lazy(() => import('../../pages/agents/Agent_amazon-product-photography')),
  LifestyleWithModel: lazy(() => import('../../pages/agents/Agent_lifestyle-with-model')),
  InfographicGenerator: lazy(() => import('../../pages/agents/Agent_infographic-generator')),
  AdvancedInfographicGenerator: lazy(() => import('../../pages/agents/Agent_AdvancedInfographicGenerator/AdvancedInfographicGeneratorRefactored')),
  AmazonListingsOptimizer: lazy(() => import('../../pages/agents/Agent_amazon-listings-optimizer-new')),
  AmazonListingsOptimizerResult: lazy(() => import('../../pages/agents/Agent_amazon-listings-optimizer-result')),
  AmazonCustomerService: lazy(() => import('../../pages/agents/Agent_amazon-customer-service')),
  AmazonCustomerServiceResult: lazy(() => import('../../pages/agents/Agent_amazon-customer-service-result')),
  AmazonNegativeReviews: lazy(() => import('../../pages/agents/Agent_amazon-negative-reviews')),
  AmazonNegativeReviewsResult: lazy(() => import('../../pages/agents/Agent_amazon-negative-reviews-result')),
  AmazonImageProcessing: lazy(() => import('../../pages/agents/Agent_amazon-image-processing')),
  
  // My Area
  MyArea: lazy(() => import('../../pages/MyArea')),
  MinhaAreaIndex: lazy(() => import('../../pages/MinhaAreaIndex')),
  UserDashboard: lazy(() => import('../../pages/user/DashboardSimple')),
  UserUsage: lazy(() => import('../../pages/user/Usage')),
  COM360_UserProfile: lazy(() => import('../../pages/myarea/COM360_UserProfile')),
  COM360_Boxes: lazy(() => import('../../pages/myarea/COM360_Boxes')),
  COM360_MyBrands: lazy(() => import('../../pages/myarea/COM360_MyBrands')),
  COM360_MySuppliers: lazy(() => import('../../pages/myarea/COM360_MySuppliers')),
  Comercial360: lazy(() => import('../../pages/myarea/Comercial360')),
  
  // My Area - Products
  COM360_ProductsPro: lazy(() => import('../../pages/myarea/COM360_ProductsPro')),
  COM360_MyProductsList: lazy(() => import('../../pages/myarea/COM360_MyProductsList')),
  COM360_ProductChannelsManager: lazy(() => import('../../pages/myarea/COM360_ProductChannelsManager')),
  COM360_ProductEdit: lazy(() => import('../../pages/myarea/COM360_ProductEdit')),
  ProductEditWithTabs: lazy(() => import('../../pages/myarea/ProductEditWithTabs')),
  COM360_ProductImportExport: lazy(() => import('../../pages/myarea/COM360_ProductImportExport')),
  
  // My Area - Imports
  IMP360_ImportacoesIndex: lazy(() => import('../../pages/myarea/IMP360_ImportacoesIndex')),
  IMP360_InternationalSupplierCRM: lazy(() => import('../../pages/myarea/IMP360_InternationalSupplierCRM')),
  IMP360_InternationalSupplierForm: lazy(() => import('../../pages/myarea/IMP360_InternationalSupplierForm')),
  IMP360_InternationalSupplierDetail: lazy(() => import('../../pages/myarea/IMP360_InternationalSupplierDetail')),
  ImportedProductsIndex: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductsIndex')),
  ImportedProductForm: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductForm')),
  ImportedProductDetail: lazy(() => import('../../pages/myarea/importacoes/produtos/ImportedProductDetail')),
  
  // Finanças360
  FIN360_Financas360Index: lazy(() => import('../../pages/myarea/financas360/FIN360_Financas360Index')),
  
  // Packing List Generator
  PackingListGenerator: lazy(() => import('../../pages/myarea/importacoes/packing-list-generator')),
  DocumentosSalvos: lazy(() => import('../../pages/myarea/importacoes/documentos-salvos')),
  GeradorEtiquetas: lazy(() => import('../../pages/myarea/importacoes/gerador-etiquetas')),
  IMP360_MinhasEmpresas: lazy(() => import('../../pages/myarea/importacoes/IMP360_MinhasEmpresas')),
  
  // Simulators
  SimuladoresIndex: lazy(() => import('../../pages/SimuladoresIndex')),
  Simul_SimuladorSimplificado: lazy(() => import('../../pages/simuladores/Simul_SimuladorSimplificado')),
  FormalImportSimulator: lazy(() => import('../../pages/FormalImportSimulator')),
  FormalImportSimulatorFixed: lazy(() => import('../../pages/FormalImportSimulatorFixed')),
  FormalImportSimulationsFixed: lazy(() => import('../../pages/FormalImportSimulationsFixed')),
  Simul_SimplesNacional: lazy(() => import('../../pages/simuladores/Simul_SimplesNacional')),
  Simul_SimplesNacionalCompleto: lazy(() => import('../../pages/simuladores/Simul_SimplesNacionalCompleto')),
  Simul_InvestimentosROI: lazy(() => import('../../pages/simuladores/Simul_InvestimentosROI')),
  
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
    
    // Admin Routes (Protected + Admin Layout) - PADRONIZADO PORTUGUÊS
    ADMIN_ROUTES: [
      // Principais
      { path: '/admin', component: lazyComponents.AdminDashboard, isProtected: true, layout: 'admin' },
      { path: '/admin/dashboard', component: lazyComponents.Admin, isProtected: true, layout: 'admin' },
      { path: '/admin/configuracoes', component: lazyComponents.AdminDashboard, isProtected: true, layout: 'admin' },
      
      // Gestão de usuários (português como padrão)
      { path: '/admin/usuarios', component: lazyComponents.UserManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/:id/edit', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/novo', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/grupos/:id', component: lazyComponents.GroupDetail, isProtected: true, layout: 'admin' },
      { path: '/admin/usuarios/grupos/:id/edit', component: lazyComponents.GroupEdit, isProtected: true, layout: 'admin' },
      
      // Gestão de conteúdo (português como padrão)
      { path: '/admin/conteudo', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection/:id', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/conteudo/:subsection/:id/:action', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      
      // Gestão de sistema
      { path: '/admin/agentes', component: lazyComponents.AgentProviderSettings, isProtected: true, layout: 'admin' },
      { path: '/admin/cadastros', component: lazyComponents.AdminCadastros, isProtected: true, layout: 'admin' },
      { path: '/admin/cadastros/:subsection', component: lazyComponents.AdminCadastros, isProtected: true, layout: 'admin' },

      // ROTAS DE COMPATIBILIDADE (Legacy) - Para não quebrar links existentes
      { path: '/admin/users', component: lazyComponents.UserManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/users/:id/edit', component: lazyComponents.UserEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/groups/:id/edit', component: lazyComponents.GroupEdit, isProtected: true, layout: 'admin' },
      { path: '/admin/content', component: lazyComponents.ContentManagement, isProtected: true, layout: 'admin' },
      { path: '/admin/agents', component: lazyComponents.AgentProviderSettings, isProtected: true, layout: 'admin' }
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
    
    // Tools Routes (Protected) - PADRONIZADO PORTUGUÊS
    TOOLS_ROUTES: [
      // Principal
      { path: '/ferramentas', component: lazyComponents.Ferramentas, isProtected: true },
      
      // Ferramentas de análise Amazon
      { path: '/ferramentas/amazon-reviews', component: lazyComponents.AmazonReviewExtractor, isProtected: true },
      { path: '/ferramentas/relatorio-keywords', component: lazyComponents.KeywordSearchReport, isProtected: true },
      { path: '/ferramentas/produto-detalhes', component: lazyComponents.AmazonProductDetails, isProtected: true },
      { path: '/ferramentas/comparar-listings', component: lazyComponents.CompararListings, isProtected: true },
      { path: '/ferramentas/keyword-suggestions', component: lazyComponents.AmazonKeywordSuggestions, isProtected: true },
      { path: '/ferramentas/amazon-ads-editor', component: lazyComponents.AmazonAdsEditor, isProtected: true },
      
      // Ferramentas de imagem (português como padrão)
      { path: '/ferramentas/upscale-imagem', component: lazyComponents.ImageUpscale, isProtected: true },
      { path: '/ferramentas/remover-fundo', component: lazyComponents.BackgroundRemoval, isProtected: true },
      { path: '/ferramentas/remover-fundo-pro', component: lazyComponents.BackgroundRemovalPro, isProtected: true },
      { path: '/ferramentas/gerador-logomarcas-pro', component: lazyComponents.LogoGeneratorPro, isProtected: true },
      { path: '/ferramentas/ultra-melhorador-pro', component: lazyComponents.UltraMelhoradorPro, isProtected: true },
      { path: '/ferramentas/upscale-pro', component: lazyComponents.UpscalePro, isProtected: true },
      
      // Ferramentas gerais
      { path: '/ferramentas/consulta-cnpj', component: lazyComponents.CNPJConsulta, isProtected: true },

      // ROTAS DE COMPATIBILIDADE (Legacy)
      { path: '/ai/image-upscale', component: lazyComponents.ImageUpscale, isProtected: true },
      { path: '/ai/background-removal', component: lazyComponents.BackgroundRemoval, isProtected: true }
    ],
    
    // Agent Routes (Protected) - PADRONIZADO PORTUGUÊS
    AGENT_ROUTES: [
      // Página principal dos agentes
      { path: '/agentes', component: lazyComponents.Agent_Agents, isProtected: true },
      
      // Agentes de conteúdo textual
      { path: '/agentes/html-descriptions-generator', component: lazyComponents.HtmlDescriptionAgent, isProtected: true },
      { path: '/agentes/bullet-points-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      
      // Agentes de imagem
      { path: '/agentes/editor-imagem-principal', component: lazyComponents.AmazonProductPhotography, isProtected: true },
      { path: '/agentes/lifestyle-com-modelo', component: lazyComponents.LifestyleWithModel, isProtected: true },
      { path: '/agentes/editor-infograficos', component: lazyComponents.InfographicGenerator, isProtected: true },
      { path: '/agentes/editor-infograficos-avancado', component: lazyComponents.AdvancedInfographicGenerator, isProtected: true },
      { path: '/agentes/copiador-imagens', component: lazyComponents.AmazonImageProcessing, isProtected: true },
      
      // Agentes de otimização
      { path: '/agentes/otimizador-listings', component: lazyComponents.AmazonListingsOptimizer, isProtected: true },
      { path: '/agentes/otimizador-listings/resultado', component: lazyComponents.AmazonListingsOptimizerResult, isProtected: true },
      
      // Agentes de atendimento
      { path: '/agentes/atendimento-cliente', component: lazyComponents.AmazonCustomerService, isProtected: true },
      { path: '/agentes/atendimento-cliente/resultado/:sessionId', component: lazyComponents.AmazonCustomerServiceResult, isProtected: true },
      { path: '/agentes/reviews-negativos', component: lazyComponents.AmazonNegativeReviews, isProtected: true },
      { path: '/agentes/reviews-negativos/resultado/:sessionId', component: lazyComponents.AmazonNegativeReviewsResult, isProtected: true },

      // ROTAS DE COMPATIBILIDADE (Legacy) - Para não quebrar links existentes
      { path: '/agents/html-description-generator', component: lazyComponents.HtmlDescriptionAgent, isProtected: true },
      { path: '/agents/bullet-point-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      { path: '/agents/bullet-points-generator', component: lazyComponents.BulletPointsAgent, isProtected: true },
      { path: '/agents/agent-amazon-product-photography', component: lazyComponents.AmazonProductPhotography, isProtected: true },
      { path: '/agentes/agent-amazon-product-photography', component: lazyComponents.AmazonProductPhotography, isProtected: true },
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
    
    // My Area Routes (Protected) - PADRONIZADO PORTUGUÊS
    MY_AREA_ROUTES: [
      // Principais (português como padrão)
      { path: '/minha-area', component: lazyComponents.MinhaAreaIndex, isProtected: true },
      { path: '/minha-area/perfil', component: lazyComponents.COM360_UserProfile, isProtected: true },
      { path: '/minha-area/assinatura', component: lazyComponents.SubscriptionPage, isProtected: true },
      { path: '/minha-area/caixas', component: lazyComponents.COM360_Boxes, isProtected: true },
      { path: '/minha-area/comercial360', component: lazyComponents.Comercial360, isProtected: true },

      // ROTAS DE COMPATIBILIDADE (Legacy)
      { path: '/my-area', component: lazyComponents.MyArea, isProtected: true },
      { path: '/user/dashboard', component: lazyComponents.UserDashboard, isProtected: true },
      { path: '/user/usage', component: lazyComponents.UserUsage, isProtected: true },
      { path: '/subscription', component: lazyComponents.SubscriptionPage, isProtected: true },
      
      // Products - CONSOLIDADO
      { path: '/minha-area/produtos', component: lazyComponents.COM360_MyProductsList, isProtected: true },
      { path: '/meus-produtos', component: lazyComponents.COM360_MyProductsList, isProtected: true },
      { path: '/produtos-pro', component: lazyComponents.COM360_ProductsPro, isProtected: true },
      { path: '/produtos-novo/:id/canais', component: lazyComponents.COM360_ProductChannelsManager, isProtected: true },
      { path: '/minha-area/produtos/:id/editar', component: lazyComponents.COM360_ProductEdit, isProtected: true },
      { path: '/minha-area/produtos/:id/editar-completo', component: lazyComponents.ProductEditWithTabs, isProtected: true },
      { path: '/minha-area/produtos/import-export', component: lazyComponents.COM360_ProductImportExport, isProtected: true },
      
      // Fornecedores Gerais
      { path: '/minha-area/fornecedores', component: lazyComponents.COM360_MySuppliers, isProtected: true },
      { path: '/minha-area/fornecedores/:id', component: lazyComponents.SupplierDetail, isProtected: true },

      // Marcas
      { path: '/minha-area/marcas', component: lazyComponents.COM360_MyBrands, isProtected: true },

      // Imports - IMP360
      { path: '/minha-area/importacoes', component: lazyComponents.IMP360_ImportacoesIndex, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores', component: lazyComponents.IMP360_InternationalSupplierCRM, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores/novo', component: lazyComponents.IMP360_InternationalSupplierForm, isProtected: true },
      { path: '/minha-area/importacoes/fornecedores/:id', component: lazyComponents.IMP360_InternationalSupplierDetail, isProtected: true },
      { path: '/minha-area/importacoes/produtos', component: lazyComponents.ImportedProductsIndex, isProtected: true },
      { path: '/minha-area/importacoes/produtos/novo', component: lazyComponents.ImportedProductForm, isProtected: true },
      { path: '/minha-area/importacoes/produtos/:id', component: lazyComponents.ImportedProductDetail, isProtected: true },
      { path: '/minha-area/importacoes/produtos/:id/editar', component: lazyComponents.ImportedProductForm, isProtected: true },
      
      // Packing List Generator
      { path: '/minha-area/importacoes/packing-list-generator', component: lazyComponents.PackingListGenerator, isProtected: true },
      { path: '/minha-area/importacoes/documentos-salvos', component: lazyComponents.DocumentosSalvos, isProtected: true },
      { path: '/minha-area/importacoes/gerador-etiquetas', component: lazyComponents.GeradorEtiquetas, isProtected: true },
      { path: '/minha-area/importacoes/minhas-empresas', component: lazyComponents.IMP360_MinhasEmpresas, isProtected: true },
      
      // Finanças360 - FIN360
      { path: '/minha-area/financas360', component: lazyComponents.FIN360_Financas360Index, isProtected: true }
    ],
    
    // Simulator Routes (Protected)
    SIMULATOR_ROUTES: [
      { path: '/simuladores', component: lazyComponents.SimuladoresIndex, isProtected: true },
      { path: '/minha-area/importacoes/simuladores/simplificado', component: lazyComponents.Simul_SimuladorSimplificado, isProtected: true },
      { path: '/simuladores/importacao-formal-direta', component: lazyComponents.FormalImportSimulationsFixed, isProtected: true },
      { path: '/simuladores/importacao-formal-direta/nova', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/simuladores/importacao-formal-direta/editar/:id', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/minha-area/importacoes/simuladores/importacao-formal-direta', component: lazyComponents.FormalImportSimulatorFixed, isProtected: true },
      { path: '/simuladores/simples-nacional', component: lazyComponents.Simul_SimplesNacional, isProtected: true },
      { path: '/simuladores/simulador-simples-nacional-completo', component: lazyComponents.Simul_SimplesNacionalCompleto, isProtected: true },
      { path: '/simuladores/simulador-de-investimentos-e-roi', component: lazyComponents.Simul_InvestimentosROI, isProtected: true }
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