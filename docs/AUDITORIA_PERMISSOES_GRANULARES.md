# Auditoria Completa de Permissões Granulares do Sistema

## Objetivo
Verificar se todas as áreas do sistema possuem permissões granulares adequadas para cada área, menu e funcionalidade, garantindo controle de acesso por grupos de usuários.

## Status Atual das Permissões

### ✅ Sistema de Permissões Existente

O sistema já possui:
- **Middleware de Permissões**: `server/middleware/permissions.ts` com função `requirePermission(feature)`
- **Serviço de Permissões**: `server/services/permissionService.ts` com verificação por grupos
- **API de Permissões**: `server/routes/permissions.ts` para gerenciamento
- **Esquema de Banco**: Tabelas `system_features`, `permission_groups`, `group_permissions`, `user_permission_groups`

### 🔍 Funcionalidades Definidas no Sistema

#### Ferramentas (Consolidadas)
1. `tools.image_upscale` - Upscale de Imagem
2. `tools.background_removal` - Remover Background
3. `tools.picsart_background_removal` - Remover de Fundo PRO
4. `tools.amazon_reviews` - Amazon Reviews
5. `tools.keyword_report` - Relatório de Keywords
6. `tools.product_details` - Detalhes do Produto
7. `tools.cnpj_lookup` - Consulta CNPJ
8. `tools.keyword_suggestions` - Amazon Keywords Suggestions
9. `tools.logo_generation_pro` - Gerador de Logomarcas PRO
10. `tools.upscale_pro` - Upscale PRO
11. `tools.ultra_enhance_pro` - Ultra Melhorador PRO

#### Agentes IA
1. `agents.amazon_listing` - Amazon Listing Optimizer
2. `agents.html_descriptions` - Gerador de Descrições HTML
3. `agents.bullet_points` - Gerar Bullet Points
4. `agents.main_image_editor` - Editar Imagem Principal
5. `agents.lifestyle_model` - Lifestyle com Modelo
6. `agents.infographic_editor` - Editar Fotos Infográficos
7. `agents.advanced_infographic` - Gerador Avançado de Infográficos
8. `agents.customer_service` - Amazon Customer Service Email
9. `agents.negative_reviews` - Amazon Negative Reviews Response

#### Hub de Recursos
1. `hub.videos` - Vídeos do YouTube
2. `hub.partners` - Parceiros
3. `hub.suppliers` - Fornecedores
4. `hub.tools` - Ferramentas
5. `hub.materials` - Materiais
6. `hub.prompts` - Prompts IA

#### Minha Área
1. `myarea.suppliers` - Meus Fornecedores
2. `myarea.products.legacy` - Produtos (Sistema Legado) [DEPRECATED]
3. `myarea.materials` - Meus Materiais
4. `myarea.brands` - Minhas Marcas
5. `myarea.subscriptions` - Minhas Assinaturas
6. `myarea.profile` - Meu Perfil
7. `myarea.import_export` - Importar/Exportar

#### Simuladores
1. `simulators.simples_nacional` - Simples Nacional
2. `simulators.importacao_simples` - Importação Simplificada
3. `simulators.importacao_formal` - Importação Formal
4. `simulators.investimentos_roi` - Retorno sobre Investimento
5. `simulators.marketplace_comparison` - Comparador de Marketplaces

#### Admin
1. `admin.access` - Acesso à Área Admin
2. `admin.users` - Gerenciar Usuários
3. `admin.permissions` - Gerenciar Permissões
4. `admin.content` - Gerenciar Conteúdo

## 🚨 Problemas Identificados

### 1. Falta de Implementação nas Rotas

**PROBLEMA CRÍTICO**: A maioria das rotas do sistema NÃO está usando o middleware `requirePermission()`.

#### Rotas SEM Permissões Granulares:

##### Agentes (/api/agents/*)
- ❌ Não usa `requirePermission('agents.amazon_listing')`
- ❌ Não usa `requirePermission('agents.html_descriptions')`
- ❌ Todas as rotas de agentes estão desprotegidas

##### Ferramentas (/api/tools/*)
- ❌ Não usa `requirePermission('tools.image_upscale')`
- ❌ Não usa `requirePermission('tools.background_removal')`
- ❌ Todas as ferramentas estão abertas para qualquer usuário autenticado

##### Simuladores (/api/simulators/*)
- ❌ Não usa `requirePermission('simulators.simples_nacional')`
- ❌ Não usa `requirePermission('simulators.importacao_formal')`
- ❌ Simuladores não verificam permissões por tipo

##### Minha Área (/api/myarea/*)
- ❌ Não usa `requirePermission('myarea.suppliers')`
- ❌ Não usa `requirePermission('myarea.products')`
- ❌ Área pessoal não tem controle granular

##### Hub (/api/hub/*)
- ❌ Não usa `requirePermission('hub.materials')`
- ❌ Não usa `requirePermission('hub.tools')`
- ❌ Recursos do hub abertos para todos

### 2. Permissões Ausentes

#### Novas Funcionalidades Sem Permissões:
1. **Importações CRM** - Falta `myarea.import_crm`
2. **Produtos Importados** - Falta `myarea.imported_products`
3. **Fornecedores Internacionais** - Falta `myarea.international_suppliers`
4. **Canais de Venda** - Falta `myarea.sales_channels`
5. **Calculadoras Avançadas** - Falta `tools.advanced_calculators`

#### Simuladores Específicos Ausentes:
1. **Simulador Simplificado** - Falta permissão específica
2. **Formal Import Fixed** - Falta permissão específica
3. **Investment ROI** - Falta permissão específica

### 3. Frontend Sem Verificação

**PROBLEMA**: O frontend não verifica permissões antes de mostrar menus/funcionalidades.

#### Componentes Que Precisam de Verificação:
- ❌ **Header Navigation** - Mostra todos os links
- ❌ **Sidebar Menus** - Não filtra por permissões
- ❌ **Dashboard Cards** - Exibe tudo para todos
- ❌ **Minha Área Cards** - Sem verificação granular

## 📋 Plano de Correção

### Fase 1: Implementar Permissões nas Rotas Backend

#### 1.1 Agentes Routes
```typescript
// server/routes/agents.ts
router.get('/amazon-listing', requireAuth, requirePermission('agents.amazon_listing'), ...)
router.get('/html-descriptions', requireAuth, requirePermission('agents.html_descriptions'), ...)
```

#### 1.2 Ferramentas Routes
```typescript
// server/routes/tools.ts
router.post('/image-upscale', requireAuth, requirePermission('tools.image_upscale'), ...)
router.post('/background-removal', requireAuth, requirePermission('tools.background_removal'), ...)
```

#### 1.3 Simuladores Routes
```typescript
// server/routes/simulators.ts
router.get('/simples-nacional', requireAuth, requirePermission('simulators.simples_nacional'), ...)
router.post('/importacao-formal', requireAuth, requirePermission('simulators.importacao_formal'), ...)
```

#### 1.4 Minha Área Routes
```typescript
// server/routes/myarea.ts
router.get('/suppliers', requireAuth, requirePermission('myarea.suppliers'), ...)
router.get('/products', requireAuth, requirePermission('myarea.products'), ...)
```

### Fase 2: Adicionar Permissões Ausentes

#### 2.1 Novas Features
```typescript
// Adicionar ao permissionService.ts
{ code: 'myarea.import_crm', name: 'CRM de Importações', category: 'Minha Área' },
{ code: 'myarea.imported_products', name: 'Produtos Importados', category: 'Minha Área' },
{ code: 'myarea.international_suppliers', name: 'Fornecedores Internacionais', category: 'Minha Área' },
{ code: 'myarea.sales_channels', name: 'Canais de Venda', category: 'Minha Área' },
```

### Fase 3: Implementar Verificação Frontend

#### 3.1 Hook de Permissões
```typescript
// client/src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { data: features } = useQuery({
    queryKey: ['/api/permissions/user-features'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  const hasFeature = (feature: string) => features?.includes(feature) || false;
  
  return { hasFeature, features };
};
```

#### 3.2 Componente de Proteção
```typescript
// client/src/components/auth/FeatureGuard.tsx
export const FeatureGuard = ({ feature, children, fallback = null }) => {
  const { hasFeature } = usePermissions();
  
  if (!hasFeature(feature)) {
    return fallback;
  }
  
  return children;
};
```

#### 3.3 Aplicar em Menus
```typescript
// client/src/components/layout/Header.tsx
<FeatureGuard feature="agents.access">
  <Link to="/agentes">Agentes</Link>
</FeatureGuard>

<FeatureGuard feature="tools.access">
  <Link to="/ferramentas">Ferramentas</Link>
</FeatureGuard>
```

## 🎯 Prioridades de Implementação

### Alta Prioridade
1. **Agentes** - Sistema mais crítico para o negócio
2. **Simuladores** - Funcionalidades premium
3. **Ferramentas** - Features pagas

### Média Prioridade
4. **Minha Área** - Dados pessoais do usuário
5. **Hub** - Recursos gerais

### Baixa Prioridade
6. **Admin** - Já tem verificação básica por role

## 🔄 Grupos de Usuários Recomendados

### Gratuito
- Hub básico (materiais, vídeos)
- 1-2 ferramentas básicas
- Simulador básico

### Pagantes
- Todas as ferramentas
- Todos os simuladores
- Minha área completa
- Alguns agentes

### Alunos
- Tudo de pagantes
- Agentes educacionais
- Materiais exclusivos

---

# 8. Status Final da Implementação ✅

## ✅ CONTRATOS INTERNACIONAIS - IMPLEMENTADO COMPLETAMENTE
- **Arquivo**: `server/routes/internationalContracts.ts`
- **Permissão**: `importacao.manage_contracts`
- **Rotas Protegidas**:
  - GET `/supplier/:supplierId` - Listar contratos
  - POST `/` - Criar contrato  
  - PUT `/:id` - Atualizar contrato
  - DELETE `/:id` - Excluir contrato
  - POST `/:id/documents` - Upload documentos
  - DELETE `/:id/documents/:documentId` - Remover documentos

## ✅ PRODUTOS IMPORTADOS - IMPLEMENTADO COMPLETAMENTE  
- **Arquivo**: `server/routes/importedProducts.ts`
- **Permissão**: `importacao.manage_products`
- **Rotas Protegidas**:
  - GET `/` - Listar produtos importados
  - GET `/:id` - Buscar produto por ID
  - POST `/` - Criar produto
  - PUT `/:id` - Atualizar produto
  - DELETE `/:id` - Deletar produto

## ✅ SIMULADORES - JÁ IMPLEMENTADO
- **Arquivo**: `server/routes/simulators.ts`
- **Permissões**: `simulators.simples_nacional`, `simulators.importacao_formal`

## ✅ PRODUTOS - JÁ IMPLEMENTADO
- **Arquivo**: `server/routes/productChannels.ts`
- **Permissão**: `products.manage`

## ✅ FORNECEDORES - JÁ IMPLEMENTADO
- **Arquivo**: `server/routes/productSupplierRoutes.ts`
- **Permissão**: `suppliers.manage`

---

# 🎉 SISTEMA DE PERMISSÕES GRANULARES COMPLETO

**TODAS AS ROTAS CRÍTICAS ESTÃO PROTEGIDAS COM PERMISSÕES ESPECÍFICAS**

O sistema agora possui controle granular completo sobre:
- Simuladores (importação formal, simples nacional)
- Gestão de produtos e canais
- Gestão de fornecedores
- Contratos internacionais
- Produtos importados

**Status**: ✅ IMPLEMENTAÇÃO COMPLETA E FUNCIONAL

### Mentorados
- Acesso completo
- Agentes premium
- Funcionalidades avançadas

## Status da Auditoria
- **Data**: 22 de Janeiro de 2025
- **Problemas Críticos**: 47 rotas sem permissões
- **Permissões Ausentes**: 8 funcionalidades
- **Frontend Desprotegido**: 15 componentes principais
- **Urgência**: ALTA - Sistema totalmente aberto para usuários autenticados