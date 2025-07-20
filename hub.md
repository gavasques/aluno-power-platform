# Guia Completo para Criação de Ferramentas no HUB
## Aluno Power Platform - Sistema Hub de Recursos

Este documento fornece todas as informações necessárias para criar uma nova ferramenta no Hub, detalhando como elas funcionam, o que impactam, como se ligam, toda a parte sistêmica, permissões, liberações e tudo o que é necessário para uma ferramenta funcionar perfeitamente no Hub na primeira implementação.

---

## 📋 Índice

1. [Visão Geral do Sistema Hub](#1-visão-geral-do-sistema-hub)
2. [Arquitetura do Hub](#2-arquitetura-do-hub)
3. [Tipos de Ferramentas Hub](#3-tipos-de-ferramentas-hub)
4. [Estrutura de Dados Hub](#4-estrutura-de-dados-hub)
5. [Sistema de Permissões Hub](#5-sistema-de-permissões-hub)
6. [Padrões de Interface Hub](#6-padrões-de-interface-hub)
7. [Integração com APIs Externas](#7-integração-com-apis-externas)
8. [Sistema de Créditos no Hub](#8-sistema-de-créditos-no-hub)
9. [Gestão de Estado e Caching](#9-gestão-de-estado-e-caching)
10. [Guia Passo a Passo](#10-guia-passo-a-passo)
11. [Padrões de Código Hub](#11-padrões-de-código-hub)
12. [Checklist Completo](#12-checklist-completo)

---

## 1. Visão Geral do Sistema Hub

### O Que é o Hub

O **Hub de Recursos** é o centro de conhecimento e ferramentas da plataforma, funcionando como um **diretório público** de recursos educacionais e ferramentas especializadas para e-commerce Amazon. Diferentemente das ferramentas pessoais, o Hub é focado em:

- **Descoberta de Recursos**: Catálogo organizado e pesquisável
- **Comunidade**: Sistema de avaliações e reviews
- **Verificação**: Badges de confiança e validação
- **Especialização**: Ferramentas avançadas com integração de IA
- **Categorização**: Organização sistemática por tipos e categorias

### Diferenças Fundamentais: Hub vs Ferramentas Pessoais

| Aspecto | Hub de Recursos | Ferramentas Pessoais |
|---------|----------------|---------------------|
| **Público** | Diretório público/catálogo | Funcionalidade individual |
| **Foco** | Descoberta e comunidade | Workflow pessoal |
| **Dados** | Relativamente estáticos | Dinâmicos e frequentes |
| **Permissões** | `hub.*` namespace | Permissões específicas |
| **Caching** | Agressivo (1-4 horas) | Conservador (5-30 min) |
| **UI** | Cards, filtros, ratings | Formulários, processamento |
| **Integração** | APIs externas + créditos | Processamento direto |

---

## 2. Arquitetura do Hub

### 2.1 Estrutura de Diretórios

```
/client/src/
├── pages/hub/                    # Páginas principais do Hub
│   ├── Hub.tsx                  # Dashboard central do Hub
│   ├── Materials.tsx            # Catálogo de materiais
│   ├── Partners.tsx             # Diretório de parceiros
│   ├── Suppliers.tsx            # Fornecedores verificados
│   ├── Tools.tsx                # Ferramentas externas
│   ├── PromptsIA.tsx            # Biblioteca de prompts
│   ├── AmazonKeywordSuggestions.tsx    # Ferramentas Amazon
│   ├── AmazonProductDetails.tsx
│   ├── AmazonReviewExtractor.tsx
│   └── CNPJConsulta.tsx         # Ferramentas de negócio
├── components/hub/               # Componentes específicos do Hub
│   ├── PartnerFiles.tsx         # Gestão de arquivos
│   ├── PartnerRatingDisplay.tsx # Sistema de avaliações
│   └── PartnerReviews.tsx       # Sistema de reviews
└── contexts/                     # Contextos de dados
    ├── MaterialsContext.tsx
    ├── PartnersContext.tsx
    ├── SuppliersContext.tsx
    ├── ToolsContext.tsx
    └── PromptsContext.tsx

/server/
├── controllers/                  # Controllers Hub
│   ├── MaterialController.ts
│   ├── SupplierController.ts
│   └── OptimizedSupplierController.ts
├── routes/                      # Rotas da API
│   ├── materialRoutes.ts
│   ├── supplierRoutes.ts
│   └── index.ts
├── services/                    # Serviços especializados
│   ├── amazonListingService.ts
│   └── permissionService.ts
└── middleware/
    ├── auth.ts
    └── permissions.ts
```

### 2.2 Navegação e Roteamento

**Padrão de URLs Hub:**
```typescript
/hub                    # Dashboard central
/hub/materiais         # Lista de materiais
/hub/materiais/:id     # Detalhe do material
/hub/parceiros         # Diretório de parceiros
/hub/parceiros/:id     # Perfil do parceiro
/hub/fornecedores      # Catálogo de fornecedores
/hub/ferramentas       # Catálogo de ferramentas
/hub/prompts          # Biblioteca de prompts IA
```

**Roteamento Centralizado:**
```typescript
// client/src/App.tsx
<Route path="/hub">
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Hub />
      </Suspense>
    </Layout>
  </ProtectedRoute>
</Route>

<Route path="/hub/:section">
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <HubSection />
      </Suspense>
    </Layout>
  </ProtectedRoute>
</Route>
```

---

## 3. Tipos de Ferramentas Hub

### 3.1 Catálogos de Recursos (Tipo 1)

**Características:**
- Dados relativamente estáticos
- Foco em descoberta e navegação
- Sistema de filtros avançado
- Não requerem créditos

**Exemplos:**
- **Materials** - Biblioteca de recursos educacionais
- **Partners** - Diretório de parceiros verificados  
- **Suppliers** - Catálogo de fornecedores
- **Tools** - Ferramentas externas recomendadas
- **Prompts IA** - Biblioteca de prompts especializados

**Padrão de Implementação:**
```typescript
// Página de catálogo padrão
export default function HubCatalogPage() {
  return (
    <PermissionGuard featureCode="hub.categoria">
      <div className="space-y-6">
        {/* Header com título e descrição */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Título do Catálogo</h1>
          <p className="text-gray-600">Descrição da categoria</p>
        </div>

        {/* Filtros avançados */}
        <CatalogFilters />

        {/* Grid/Lista de itens */}
        <CatalogGrid />
      </div>
    </PermissionGuard>
  );
}
```

### 3.2 Ferramentas Especializadas (Tipo 2)

**Características:**
- Integração com APIs externas
- Sistema de créditos integrado
- Processamento com IA
- Sessões de processamento

**Exemplos:**
- **Amazon Keyword Suggestions** - Geração de palavras-chave
- **Amazon Product Details** - Extração de dados de produtos
- **Amazon Review Extractor** - Análise de avaliações
- **CNPJ Consulta** - Consulta de empresas brasileiras

**Padrão de Implementação:**
```typescript
// Ferramenta especializada com créditos
export default function HubSpecializedTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const { checkCredits, logAIGeneration } = useCreditSystem();

  const FEATURE_CODE = 'tools.specialized_tool';
  const CREDIT_COST = 5;

  const handleProcess = async (inputData: any) => {
    // 1. Verificar créditos
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsProcessing(true);
    
    try {
      // 2. Processar com API externa
      const response = await fetch('/api/specialized-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      });

      const result = await response.json();
      setResult(result);

      // 3. Log da geração
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'external_api',
        // ... outros dados
      });

    } catch (error) {
      toast.error('Erro no processamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PermissionGuard featureCode={FEATURE_CODE}>
      <SpecializedToolInterface 
        onProcess={handleProcess}
        isProcessing={isProcessing}
        result={result}
        creditCost={CREDIT_COST}
      />
    </PermissionGuard>
  );
}
```

---

## 4. Estrutura de Dados Hub

### 4.1 Entidades Principais

#### Materials (Materiais)
```typescript
// shared/schema.ts
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  typeId: integer("type_id").references(() => materialTypes.id).notNull(),
  categoryId: integer("category_id").references(() => materialCategories.id),
  accessLevel: text("access_level").notNull().default("public"), // 'public', 'restricted'
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  externalUrl: text("external_url"),
  embedCode: text("embed_code"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  viewCount: integer("view_count").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Partners (Parceiros)
```typescript
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  logo: text("logo"),
  partnerTypeId: integer("partner_type_id").references(() => partnerTypes.id),
  specialties: text("specialties").array(),
  description: text("description"),
  address: jsonb("address"),
  website: text("website"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  videoUrl: text("video_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Tools (Ferramentas Externas)
```typescript
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  typeId: integer("type_id").references(() => toolTypes.id).notNull(),
  logo: text("logo").notNull(),
  website: text("website"),
  pricing: text("pricing"),
  features: text("features").array(),
  pros: text("pros").array(),
  cons: text("cons").array(),
  brazilSupport: text("brazil_support").notNull(), // 'works', 'partial', 'no'
  verified: boolean("verified").notNull().default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### 4.2 Sistemas de Relacionamento

#### Sistema de Tipos e Categorias
```sql
-- Cada entidade tem sua tabela de tipos
CREATE TABLE material_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'FileText',
  description TEXT
);

CREATE TABLE partner_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Users',
  description TEXT
);

CREATE TABLE tool_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Tool',
  description TEXT
);
```

#### Sistema de Avaliações
```sql
-- Reviews aplicáveis a várias entidades
CREATE TABLE partner_reviews (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tool_reviews (
  id SERIAL PRIMARY KEY,
  tool_id INTEGER REFERENCES tools(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sistema de Arquivos
```sql
-- Arquivos associados a entidades
CREATE TABLE partner_files (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'presentation', 'catalog', 'pricing', 'services', 'other'
  file_size INTEGER,
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Inserções de Exemplo

```sql
-- 1. Criar tipos
INSERT INTO material_types (name, icon, description) VALUES 
('Planilhas', 'FileSpreadsheet', 'Planilhas e ferramentas de cálculo'),
('Apresentações', 'Presentation', 'Slides e apresentações'),
('Documentos', 'FileText', 'Documentos e guias');

-- 2. Criar categorias
INSERT INTO material_categories (name, description) VALUES 
('Amazon FBA', 'Materiais relacionados ao Amazon FBA'),
('Importação', 'Guias e documentos de importação'),
('Marketing', 'Materiais de marketing digital');

-- 3. Inserir material
INSERT INTO materials (title, description, type_id, category_id, file_url, access_level)
VALUES (
  'Planilha de Análise de Produtos',
  'Planilha completa para análise de viabilidade de produtos Amazon',
  (SELECT id FROM material_types WHERE name = 'Planilhas'),
  (SELECT id FROM material_categories WHERE name = 'Amazon FBA'),
  'https://storage.com/planilha-analise.xlsx',
  'public'
);
```

---

## 5. Sistema de Permissões Hub

### 5.1 Namespace de Permissões Hub

**Estrutura Hierárquica:**
```typescript
// server/services/permissionService.ts - HUB Category
const hubPermissions = [
  { code: 'hub.videos', name: 'Vídeos do YouTube', category: 'HUB', sortOrder: 1 },
  { code: 'hub.partners', name: 'Parceiros', category: 'HUB', sortOrder: 2 },
  { code: 'hub.suppliers', name: 'Fornecedores', category: 'HUB', sortOrder: 3 },
  { code: 'hub.tools', name: 'Ferramentas', category: 'HUB', sortOrder: 4 },
  { code: 'hub.materials', name: 'Materiais', category: 'HUB', sortOrder: 5 },
  { code: 'hub.prompts', name: 'Prompts IA', category: 'HUB', sortOrder: 6 },
];
```

### 5.2 Implementação de Middleware

```typescript
// server/middleware/permissions.ts
export const requireMaterialAccess = requirePermission('hub.materials');
export const requireToolAccess = requirePermission('hub.tools');
export const requirePartnerAccess = requirePermission('hub.partners');
export const requireSupplierAccess = requirePermission('hub.suppliers');
export const requirePromptAccess = requirePermission('hub.prompts');
```

### 5.3 Controle de Acesso nas Rotas

```typescript
// server/routes/materialRoutes.ts
import { requireAuth } from '../middleware/auth';
import { requireMaterialAccess, requireContentManagement } from '../middleware/permissions';

const router = Router();

// Acesso público para visualização
router.get('/', materialController.getAll.bind(materialController));
router.get('/:id', materialController.getById.bind(materialController));

// Requer autenticação para tracking
router.post('/:id/view', requireAuth, requireMaterialAccess, materialController.incrementView.bind(materialController));
router.post('/:id/download', requireAuth, requireMaterialAccess, materialController.incrementDownload.bind(materialController));

// Admin apenas para gestão de conteúdo
router.post('/', requireAuth, requireContentManagement, materialController.create.bind(materialController));
router.put('/:id', requireAuth, requireContentManagement, materialController.update.bind(materialController));
router.delete('/:id', requireAuth, requireContentManagement, materialController.delete.bind(materialController));
```

### 5.4 Guards Frontend

```typescript
// Componente com proteção de acesso
import { PermissionGuard } from '@/components/guards/PermissionGuard';

export default function HubSection() {
  return (
    <PermissionGuard featureCode="hub.materials">
      <MaterialsPage />
    </PermissionGuard>
  );
}

// Guard com fallback customizado
<PermissionGuard 
  featureCode="hub.tools" 
  fallback={
    <div className="text-center p-8">
      <Lock className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900">Acesso Restrito</h3>
      <p className="text-gray-600">Você precisa de permissão para acessar as ferramentas do Hub.</p>
    </div>
  }
>
  <ToolsPage />
</PermissionGuard>
```

### 5.5 Configuração de Grupos

```typescript
// Grupos de permissão padrão
const permissionGroups = [
  {
    code: 'gratuito',
    name: 'Gratuito',
    permissions: ['hub.materials', 'hub.tools'] // Acesso básico
  },
  {
    code: 'pagantes',
    name: 'Pagantes',
    permissions: ['hub.*'] // Acesso completo ao Hub
  },
  {
    code: 'alunos',
    name: 'Alunos',
    permissions: ['hub.*', 'tools.*'] // Hub + ferramentas
  }
];
```

---

## 6. Padrões de Interface Hub

### 6.1 Layout de Cards Padrão

**Estrutura Base:**
```typescript
// Componente de card Hub padrão
export interface HubCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  href?: string;
  onClick?: () => void;
}

export function HubCard({ 
  title, 
  description, 
  imageUrl, 
  verified, 
  rating, 
  reviewCount,
  tags,
  href,
  onClick 
}: HubCardProps) {
  const CardWrapper = href ? Link : 'div';
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardWrapper href={href} onClick={onClick}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {imageUrl && (
                <img src={imageUrl} alt={title} className="w-8 h-8 rounded" />
              )}
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {title}
              </CardTitle>
              {verified && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
          {rating && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount && <span>({reviewCount} avaliações)</span>}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
          {tags && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </CardWrapper>
    </Card>
  );
}
```

### 6.2 Sistema de Filtros Avançados

```typescript
// Componente de filtros Hub
export interface HubFiltersProps {
  searchTerm: string;
  selectedType: string;
  selectedCategory: string;
  minRating: number;
  onSearchChange: (term: string) => void;
  onTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onRatingChange: (rating: number) => void;
  types: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function HubFilters({
  searchTerm,
  selectedType,
  selectedCategory,
  minRating,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onRatingChange,
  types,
  categories
}: HubFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar recursos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minRating.toString()} onValueChange={(value) => onRatingChange(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Avaliação mínima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Qualquer avaliação</SelectItem>
            <SelectItem value="3">3+ estrelas</SelectItem>
            <SelectItem value="4">4+ estrelas</SelectItem>
            <SelectItem value="4.5">4.5+ estrelas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

### 6.3 Sistema de Avaliações

```typescript
// Componente de avaliações
export function RatingSystem({ 
  entityId, 
  entityType, 
  currentRating, 
  totalReviews 
}: RatingSystemProps) {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async () => {
    if (userRating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(`/api/${entityType}-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          rating: userRating,
          comment
        })
      });

      toast.success('Avaliação enviada com sucesso!');
      setUserRating(0);
      setComment('');
    } catch (error) {
      toast.error('Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Exibição da avaliação atual */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= currentRating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {currentRating.toFixed(1)} ({totalReviews} avaliações)
        </span>
      </div>

      {/* Formulário de nova avaliação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deixe sua avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sua avaliação</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    star <= userRating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                  onClick={() => setUserRating(star)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </div>
          </div>

          <Button 
            onClick={submitReview}
            disabled={isSubmitting || userRating === 0}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.4 Seções Expansíveis

```typescript
// Componente de seção expansível
export function ExpandableSection({ 
  title, 
  children, 
  defaultExpanded = false,
  icon: Icon
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div 
        className={`transition-all duration-300 ${
          isExpanded 
            ? 'max-h-screen opacity-100 py-4 px-4' 
            : 'max-h-0 opacity-0 py-0 px-4'
        } overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 7. Integração com APIs Externas

### 7.1 Padrão de Serviço Externo

```typescript
// server/services/externalApiService.ts
export class ExternalApiService {
  private static readonly API_BASE_URL = process.env.EXTERNAL_API_URL;
  private static readonly API_KEY = process.env.EXTERNAL_API_KEY;

  static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async processWithCredits<T>(
    userId: number,
    featureCode: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    // 1. Deduzir créditos antes da chamada
    await CreditService.deductCredits(userId, featureCode);

    const startTime = Date.now();
    
    try {
      // 2. Fazer chamada da API
      const result = await apiCall();
      
      // 3. Log de sucesso
      await this.logApiCall(userId, featureCode, 'success', Date.now() - startTime);
      
      return result;
    } catch (error) {
      // 4. Log de erro (créditos já foram deduzidos)
      await this.logApiCall(userId, featureCode, 'error', Date.now() - startTime, error.message);
      throw error;
    }
  }

  private static async logApiCall(
    userId: number,
    featureCode: string,
    status: 'success' | 'error',
    duration: number,
    errorMessage?: string
  ) {
    // Log para auditoria e monitoramento
    await db.insert(apiCallLogs).values({
      userId,
      featureCode,
      status,
      duration,
      errorMessage,
      timestamp: new Date()
    });
  }
}
```

### 7.2 Implementação Amazon Services

```typescript
// server/services/amazonHubService.ts
export class AmazonHubService extends ExternalApiService {
  static async getProductDetails(asin: string, country: string, userId: number) {
    return this.processWithCredits(
      userId,
      'tools.product_details',
      async () => {
        const response = await this.makeRequest(`/product-details`, {
          method: 'POST',
          body: JSON.stringify({ asin, country })
        });

        return this.formatProductDetails(response);
      }
    );
  }

  static async extractReviews(asin: string, country: string, userId: number) {
    return this.processWithCredits(
      userId,
      'tools.amazon_reviews',
      async () => {
        const reviews = [];
        let page = 1;
        const maxPages = 10;

        while (page <= maxPages) {
          try {
            const response = await this.makeRequest(`/reviews`, {
              method: 'POST',
              body: JSON.stringify({ asin, country, page })
            });

            if (!response.reviews || response.reviews.length === 0) {
              break;
            }

            reviews.push(...response.reviews);
            page++;

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Erro na página ${page}:`, error);
            break;
          }
        }

        return { reviews, totalPages: page - 1 };
      }
    );
  }

  static async generateKeywords(productTitle: string, userId: number) {
    return this.processWithCredits(
      userId,
      'tools.keyword_suggestions',
      async () => {
        const response = await this.makeRequest(`/keyword-suggestions`, {
          method: 'POST',
          body: JSON.stringify({ title: productTitle })
        });

        return this.formatKeywords(response);
      }
    );
  }

  private static formatProductDetails(data: any) {
    return {
      title: data.title || 'N/A',
      price: data.price || 'N/A',
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      images: data.images || [],
      description: data.description || 'N/A',
      features: data.features || [],
      specifications: data.specifications || {},
      availability: data.availability || 'N/A'
    };
  }

  private static formatKeywords(data: any) {
    return {
      primary: data.primary_keywords || [],
      secondary: data.secondary_keywords || [],
      longtail: data.longtail_keywords || [],
      competitors: data.competitor_keywords || []
    };
  }
}
```

### 7.3 CNPJ Service Integration

```typescript
// server/services/cnpjService.ts
export class CNPJService extends ExternalApiService {
  private static readonly CNPJ_API_URL = 'https://dados-cnpj.p.rapidapi.com';
  private static readonly RAPID_API_KEY = process.env.RAPIDAPI_KEY;

  static async consultCNPJ(cnpj: string, userId: number) {
    return this.processWithCredits(
      userId,
      'tools.cnpj_lookup',
      async () => {
        // Limpar CNPJ (remover formatação)
        const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
        
        if (cleanCNPJ.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }

        try {
          const response = await fetch(
            `${this.CNPJ_API_URL}/buscar-base.php?cnpj=${cleanCNPJ}`,
            {
              headers: {
                'X-RapidAPI-Key': this.RAPID_API_KEY,
                'X-RapidAPI-Host': 'dados-cnpj.p.rapidapi.com'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Erro na consulta CNPJ');
          }

          const data = await response.json();
          return this.formatCNPJData(data);
        } catch (error) {
          // Fallback para dados demo em caso de erro
          console.warn('Usando dados demo para CNPJ:', cleanCNPJ);
          return this.getDemoData(cleanCNPJ);
        }
      }
    );
  }

  private static formatCNPJData(data: any) {
    return {
      razaoSocial: data.razao_social || 'N/A',
      nomeFantasia: data.nome_fantasia || 'N/A',
      cnpj: data.cnpj || 'N/A',
      situacao: data.situacao || 'N/A',
      dataAbertura: data.data_abertura || 'N/A',
      atividadePrincipal: data.atividade_principal || 'N/A',
      endereco: {
        logradouro: data.logradouro || 'N/A',
        numero: data.numero || 'N/A',
        bairro: data.bairro || 'N/A',
        cidade: data.cidade || 'N/A',
        uf: data.uf || 'N/A',
        cep: data.cep || 'N/A'
      },
      contato: {
        telefone: data.telefone || 'N/A',
        email: data.email || 'N/A'
      },
      socios: data.socios || []
    };
  }

  private static getDemoData(cnpj: string) {
    return {
      razaoSocial: 'EMPRESA EXEMPLO LTDA',
      nomeFantasia: 'Empresa Exemplo',
      cnpj: cnpj,
      situacao: 'ATIVA',
      dataAbertura: '01/01/2020',
      atividadePrincipal: 'Comércio varejista não especializado',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01000-000'
      },
      contato: {
        telefone: '(11) 1234-5678',
        email: 'contato@exemplo.com.br'
      },
      socios: [
        { nome: 'João Silva', participacao: '50%' },
        { nome: 'Maria Santos', participacao: '50%' }
      ]
    };
  }
}
```

---

## 8. Sistema de Créditos no Hub

### 8.1 Configuração de Custos

```sql
-- Configuração de custos para ferramentas Hub
INSERT INTO feature_costs (feature_name, cost_per_use, description, category, is_active) VALUES
('tools.keyword_suggestions', 3.00, 'Amazon Keyword Suggestions', 'Hub', true),
('tools.product_details', 2.00, 'Amazon Product Details', 'Hub', true),
('tools.amazon_reviews', 5.00, 'Amazon Review Extractor', 'Hub', true),
('tools.cnpj_lookup', 1.00, 'Consulta CNPJ', 'Hub', true);
```

### 8.2 Hook de Créditos Hub

```typescript
// client/src/hooks/useHubCredits.ts
export function useHubCredits() {
  const { checkCredits, logAIGeneration } = useCreditSystem();

  const processHubTool = async (
    featureCode: string,
    operation: () => Promise<any>,
    metadata: {
      provider?: string;
      model?: string;
      inputData?: string;
      responseData?: string;
    } = {}
  ) => {
    // 1. Verificar créditos
    const creditCheck = await checkCredits(featureCode);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(
        creditCheck.requiredCredits, 
        creditCheck.currentBalance
      );
      throw new Error('Créditos insuficientes');
    }

    // 2. Executar operação
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;

    // 3. Log da geração
    await logAIGeneration({
      featureCode,
      provider: metadata.provider || 'external_api',
      model: metadata.model || 'hub_tool',
      inputTokens: Math.ceil((metadata.inputData?.length || 0) / 4),
      outputTokens: Math.ceil((metadata.responseData?.length || JSON.stringify(result).length) / 4),
      totalTokens: Math.ceil(((metadata.inputData?.length || 0) + (metadata.responseData?.length || JSON.stringify(result).length)) / 4),
      cost: creditCheck.requiredCredits,
      prompt: metadata.inputData?.substring(0, 1000) || '',
      response: metadata.responseData?.substring(0, 1000) || JSON.stringify(result).substring(0, 1000),
      duration
    });

    return result;
  };

  const showInsufficientCreditsToast = (required: number, available: number) => {
    toast.error(
      `Créditos insuficientes. Necessário: ${required}, Disponível: ${available}`,
      {
        action: {
          label: 'Comprar Créditos',
          onClick: () => {
            // Redirecionar para página de compra
            window.location.href = '/subscription';
          }
        }
      }
    );
  };

  return {
    processHubTool,
    checkCredits,
    showInsufficientCreditsToast
  };
}
```

### 8.3 Componente de Créditos

```typescript
// client/src/components/hub/CreditCostDisplay.tsx
export function CreditCostDisplay({ 
  featureCode, 
  description,
  className 
}: CreditCostDisplayProps) {
  const [cost, setCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCost = async () => {
      try {
        const response = await fetch(`/api/feature-costs/${featureCode}`);
        const data = await response.json();
        setCost(data.costPerUse);
      } catch (error) {
        console.error('Erro ao carregar custo:', error);
        setCost(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCost();
  }, [featureCode]);

  if (loading) {
    return <Badge variant="outline">Carregando...</Badge>;
  }

  return (
    <Badge variant="secondary" className={className}>
      <Coins className="w-3 h-3 mr-1" />
      {cost} {cost === 1 ? 'crédito' : 'créditos'}
      {description && ` - ${description}`}
    </Badge>
  );
}
```

---

## 9. Gestão de Estado e Caching

### 9.1 Estratégias de Cache por Tipo

```typescript
// client/src/contexts/HubContext.tsx
export function HubProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClient>
      <MaterialsProvider>
        <PartnersProvider>
          <SuppliersProvider>
            <ToolsProvider>
              <PromptsProvider>
                {children}
              </PromptsProvider>
            </ToolsProvider>
          </SuppliersProvider>
        </PartnersProvider>
      </MaterialsProvider>
    </QueryClient>
  );
}

// Configurações de cache por contexto
const getCacheConfig = (entityType: string) => {
  const configs = {
    // Dados estáticos (Tools, Partners) - cache agressivo
    tools: {
      staleTime: 60 * 60 * 1000, // 1 hora
      gcTime: 4 * 60 * 60 * 1000, // 4 horas
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    
    // Dados semi-estáticos (Materials, Prompts) - cache moderado
    materials: {
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 2 * 60 * 60 * 1000, // 2 horas
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    
    // Dados dinâmicos (Suppliers) - cache conservador
    suppliers: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  };

  return configs[entityType] || configs.materials;
};
```

### 9.2 Context Provider Padrão

```typescript
// client/src/contexts/MaterialsContext.tsx
interface MaterialsContextType {
  materials: DbMaterial[];
  materialTypes: DbMaterialType[];
  materialCategories: DbMaterialCategory[];
  loading: boolean;
  error: string | null;
  filters: MaterialFilters;
  setFilters: (filters: Partial<MaterialFilters>) => void;
  getFilteredMaterials: () => DbMaterial[];
  refetch: () => Promise<any>;
}

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [filters, setFiltersState] = useState<MaterialFilters>({
    search: '',
    typeId: 'all',
    categoryId: 'all',
    accessLevel: 'all'
  });

  // Query principal para materiais
  const {
    data: materials = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
    ...getCacheConfig('materials'),
    structuralSharing: true,
  });

  // Query para tipos
  const { data: materialTypes = [] } = useQuery({
    queryKey: ['/api/material-types'],
    queryFn: () => apiRequest<DbMaterialType[]>('/api/material-types'),
    ...getCacheConfig('materials'),
  });

  // Query para categorias
  const { data: materialCategories = [] } = useQuery({
    queryKey: ['/api/material-categories'],
    queryFn: () => apiRequest<DbMaterialCategory[]>('/api/material-categories'),
    ...getCacheConfig('materials'),
  });

  const setFilters = (newFilters: Partial<MaterialFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredMaterials = (): DbMaterial[] => {
    let filtered = materials;

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(material =>
        material.title?.toLowerCase().includes(searchLower) ||
        material.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (filters.typeId && filters.typeId !== 'all') {
      filtered = filtered.filter(material => 
        material.typeId?.toString() === filters.typeId
      );
    }

    // Filtro por categoria
    if (filters.categoryId && filters.categoryId !== 'all') {
      filtered = filtered.filter(material => 
        material.categoryId?.toString() === filters.categoryId
      );
    }

    // Filtro por nível de acesso
    if (filters.accessLevel && filters.accessLevel !== 'all') {
      filtered = filtered.filter(material => 
        material.accessLevel === filters.accessLevel
      );
    }

    return filtered;
  };

  const value: MaterialsContextType = {
    materials,
    materialTypes,
    materialCategories,
    loading,
    error: error?.message || null,
    filters,
    setFilters,
    getFilteredMaterials,
    refetch
  };

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  );
}
```

### 9.3 Invalidação Estratégica

```typescript
// Padrões de invalidação de cache
export class HubCacheManager {
  static async invalidateEntity(queryClient: QueryClient, entityType: string, entityId?: string) {
    const patterns = {
      materials: ['/api/materials', '/api/material-types', '/api/material-categories'],
      partners: ['/api/partners', '/api/partner-types'],
      suppliers: ['/api/suppliers', '/api/departments'],
      tools: ['/api/tools', '/api/tool-types'],
      prompts: ['/api/prompts', '/api/prompt-categories']
    };

    const queries = patterns[entityType] || [];
    
    for (const queryKey of queries) {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    }

    // Invalidar cache específico se ID fornecido
    if (entityId) {
      await queryClient.invalidateQueries({ 
        queryKey: [`/api/${entityType}`, entityId] 
      });
    }
  }

  static async prefetchEntity(queryClient: QueryClient, entityType: string, entityId: string) {
    await queryClient.prefetchQuery({
      queryKey: [`/api/${entityType}`, entityId],
      queryFn: () => apiRequest(`/api/${entityType}/${entityId}`),
      ...getCacheConfig(entityType)
    });
  }
}
```

---

## 10. Guia Passo a Passo

### Passo 1: Definição e Planejamento
1. [ ] **Tipo de Ferramenta**
   - [ ] Catálogo de recursos (Tipo 1) ou Ferramenta especializada (Tipo 2)
   - [ ] Definir entidade principal (Material, Partner, Tool, etc.)
   - [ ] Especificar se requer integração externa

2. [ ] **Especificações**
   - [ ] Nome e descrição da ferramenta
   - [ ] Permissão necessária (`hub.nova_categoria`)
   - [ ] Custo em créditos (se aplicável)
   - [ ] API externa necessária (se aplicável)

3. [ ] **UI/UX Planning**
   - [ ] Layout: Cards, filtros, listagem
   - [ ] Funcionalidades: busca, ordenação, categorias
   - [ ] Sistema de avaliações (se aplicável)

### Passo 2: Database Schema
1. [ ] **Tabela Principal**
```sql
CREATE TABLE nova_entidade (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type_id INTEGER REFERENCES nova_entidade_types(id),
  category_id INTEGER REFERENCES categories(id),
  
  -- Campos específicos da entidade
  url TEXT,
  logo TEXT,
  
  -- Sistema de verificação/rating
  is_verified BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. [ ] **Tabelas de Apoio**
```sql
-- Tipos
CREATE TABLE nova_entidade_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'FileText',
  description TEXT
);

-- Reviews (se aplicável)
CREATE TABLE nova_entidade_reviews (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER REFERENCES nova_entidade(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. [ ] **Configuração de Custos** (se aplicável)
```sql
INSERT INTO feature_costs (feature_name, cost_per_use, description, category)
VALUES ('tools.nova_ferramenta', 3.00, 'Nova Ferramenta Hub', 'Hub');
```

### Passo 3: Permissões
1. [ ] **Adicionar Feature**
```typescript
// server/services/permissionService.ts
{ code: 'hub.nova_categoria', name: 'Nova Categoria', category: 'HUB', sortOrder: 7 },
```

2. [ ] **Middleware**
```typescript
// server/middleware/permissions.ts
export const requireNovaCategoriaAccess = requirePermission('hub.nova_categoria');
```

3. [ ] **Configurar Grupos**
```sql
-- Adicionar permissão aos grupos relevantes
INSERT INTO group_permissions (group_id, feature_id, has_access)
SELECT g.id, f.id, true
FROM permission_groups g, system_features f
WHERE g.code IN ('pagantes', 'alunos') AND f.code = 'hub.nova_categoria';
```

### Passo 4: Backend API
1. [ ] **Controller**
```typescript
// server/controllers/NovaEntidadeController.ts
export class NovaEntidadeController extends BaseController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const entities = await storage.getNovaEntidades();
      ResponseHandler.success(res, entities);
    } catch (error) {
      this.handleError(error, res, 'GET_ALL_NOVA_ENTIDADE');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const entity = await storage.getNovaEntidadeById(parseInt(id));
      
      if (!entity) {
        return ResponseHandler.notFound(res, 'Entidade não encontrada');
      }
      
      ResponseHandler.success(res, entity);
    } catch (error) {
      this.handleError(error, res, 'GET_NOVA_ENTIDADE_BY_ID');
    }
  }

  // Admin apenas
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ValidationHelper.validateBody(req, insertNovaEntidadeSchema);
      const entity = await storage.createNovaEntidade(validatedData);
      ResponseHandler.created(res, entity);
    } catch (error) {
      this.handleError(error, res, 'CREATE_NOVA_ENTIDADE');
    }
  }
}
```

2. [ ] **Routes**
```typescript
// server/routes/novaEntidadeRoutes.ts
const router = Router();
const controller = new NovaEntidadeController();

// Público para visualização
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));

// Admin para gestão
router.post('/', requireAuth, requireContentManagement, controller.create.bind(controller));
router.put('/:id', requireAuth, requireContentManagement, controller.update.bind(controller));
router.delete('/:id', requireAuth, requireContentManagement, controller.delete.bind(controller));

// Tracking autenticado
router.post('/:id/view', requireAuth, requireNovaCategoriaAccess, controller.incrementView.bind(controller));

export default router;
```

3. [ ] **Integrar Routes**
```typescript
// server/routes/index.ts
import novaEntidadeRoutes from './novaEntidadeRoutes';
router.use('/api/nova-entidade', novaEntidadeRoutes);
```

### Passo 5: Context e Estado
1. [ ] **Context Provider**
```typescript
// client/src/contexts/NovaEntidadeContext.tsx
interface NovaEntidadeContextType {
  entities: DbNovaEntidade[];
  types: DbNovaEntidadeType[];
  loading: boolean;
  error: string | null;
  filters: NovaEntidadeFilters;
  setFilters: (filters: Partial<NovaEntidadeFilters>) => void;
  getFilteredEntities: () => DbNovaEntidade[];
  refetch: () => Promise<any>;
}

export function NovaEntidadeProvider({ children }: { children: React.ReactNode }) {
  const {
    data: entities = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/nova-entidade'],
    queryFn: () => apiRequest<DbNovaEntidade[]>('/api/nova-entidade'),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    refetchOnWindowFocus: false,
    structuralSharing: true,
  });

  // ... resto da implementação
}
```

### Passo 6: Frontend Components
1. [ ] **Página Principal**
```typescript
// client/src/pages/hub/NovaEntidade.tsx
export default function NovaEntidadePage() {
  const { entities, types, loading, filters, setFilters, getFilteredEntities } = useNovaEntidade();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEntities = getFilteredEntities();

  return (
    <PermissionGuard featureCode="hub.nova_categoria">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Nova Categoria</h1>
          <p className="text-gray-600 mt-2">
            Descrição da nova categoria do Hub
          </p>
        </div>

        {/* Filtros */}
        <NovaEntidadeFilters
          searchTerm={filters.search}
          selectedType={filters.typeId}
          onSearchChange={(search) => setFilters({ search })}
          onTypeChange={(typeId) => setFilters({ typeId })}
          types={types}
        />

        {/* Toggle View Mode */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {filteredEntities.length} {filteredEntities.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <NovaEntidadeGrid entities={filteredEntities} viewMode={viewMode} />
        )}
      </div>
    </PermissionGuard>
  );
}
```

2. [ ] **Componente de Card**
```typescript
// client/src/components/hub/NovaEntidadeCard.tsx
export function NovaEntidadeCard({ entity }: { entity: DbNovaEntidade }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <Link href={`/hub/nova-entidade/${entity.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {entity.logo && (
                <img src={entity.logo} alt={entity.title} className="w-8 h-8 rounded" />
              )}
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {entity.title}
              </CardTitle>
              {entity.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
          {entity.averageRating > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{entity.averageRating.toFixed(1)}</span>
              <span>({entity.totalReviews} avaliações)</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm line-clamp-2">{entity.description}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
```

3. [ ] **Página de Detalhe**
```typescript
// client/src/pages/hub/NovaEntidadeDetail.tsx
export default function NovaEntidadeDetailPage() {
  const { id } = useParams();
  const [entity, setEntity] = useState<DbNovaEntidade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const response = await fetch(`/api/nova-entidade/${id}`);
        const data = await response.json();
        setEntity(data);
      } catch (error) {
        console.error('Erro ao carregar entidade:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntity();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!entity) {
    return <div>Entidade não encontrada</div>;
  }

  return (
    <PermissionGuard featureCode="hub.nova_categoria">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {entity.logo && (
                    <img src={entity.logo} alt={entity.title} className="w-12 h-12 rounded" />
                  )}
                  <div>
                    <CardTitle className="text-2xl">{entity.title}</CardTitle>
                    {entity.isVerified && (
                      <Badge variant="secondary" className="mt-1">
                        <Check className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{entity.description}</p>
                
                {/* Informações adicionais específicas da entidade */}
                {entity.url && (
                  <div className="mt-4">
                    <Button asChild>
                      <a href={entity.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Acessar
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sistema de avaliações (se aplicável) */}
            {entity.totalReviews > 0 && (
              <RatingSystem
                entityId={entity.id}
                entityType="nova-entidade"
                currentRating={entity.averageRating}
                totalReviews={entity.totalReviews}
              />
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
```

### Passo 7: Integração e Roteamento
1. [ ] **Adicionar Rota**
```typescript
// client/src/App.tsx
<Route path="/hub/nova-entidade">
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <NovaEntidadePage />
      </Suspense>
    </Layout>
  </ProtectedRoute>
</Route>

<Route path="/hub/nova-entidade/:id">
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <NovaEntidadeDetailPage />
      </Suspense>
    </Layout>
  </ProtectedRoute>
</Route>
```

2. [ ] **Adicionar ao Hub Dashboard**
```typescript
// client/src/pages/Hub.tsx
const hubSections = [
  // ... outras seções
  {
    title: "Nova Categoria",
    description: "Descrição da nova categoria",
    href: "/hub/nova-entidade",
    icon: IconComponent,
    permission: "hub.nova_categoria",
    featured: false
  }
];
```

### Passo 8: Ferramentas Especializadas (Tipo 2)
Se for uma ferramenta com integração externa:

1. [ ] **Service Backend**
```typescript
// server/services/novaFerramentaService.ts
export class NovaFerramentaService extends ExternalApiService {
  static async processWithTool(inputData: any, userId: number) {
    return this.processWithCredits(
      userId,
      'tools.nova_ferramenta',
      async () => {
        const response = await this.makeRequest('/nova-ferramenta', {
          method: 'POST',
          body: JSON.stringify(inputData)
        });

        return this.formatResponse(response);
      }
    );
  }

  private static formatResponse(data: any) {
    return {
      // Formatar dados conforme necessário
      result: data.result,
      metadata: data.metadata
    };
  }
}
```

2. [ ] **Componente Especializado**
```typescript
// client/src/components/hub/NovaFerramentaTool.tsx
export function NovaFerramentaTool() {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { processHubTool } = useHubCredits();

  const handleProcess = async () => {
    if (!inputData.trim()) {
      toast.error('Por favor, insira os dados');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processHubTool(
        'tools.nova_ferramenta',
        async () => {
          const response = await fetch('/api/nova-ferramenta/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputData })
          });
          return response.json();
        },
        {
          provider: 'external_api',
          inputData,
          responseData: JSON.stringify(result)
        }
      );

      setResult(result);
      toast.success('Processamento concluído!');
    } catch (error) {
      if (error.message !== 'Créditos insuficientes') {
        toast.error('Erro no processamento');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PermissionGuard featureCode="tools.nova_ferramenta">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Ferramenta</CardTitle>
            <div className="flex items-center gap-2">
              <CreditCostDisplay featureCode="tools.nova_ferramenta" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dados de Entrada
              </label>
              <Textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Insira os dados para processamento..."
                rows={4}
                disabled={isProcessing}
              />
            </div>
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || !inputData.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Processando...
                </>
              ) : (
                'Processar'
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
```

---

## 11. Padrões de Código Hub

### 11.1 Nomenclatura Hub

**Arquivos e Componentes:**
- **Páginas**: `NovaCategoria.tsx` (PascalCase)
- **Componentes**: `NovaCategoriaCard.tsx`, `NovaCategoriaFilters.tsx`
- **Contextos**: `NovaCategoriaContext.tsx`
- **Services**: `novaCategoriaService.ts` (camelCase)
- **Routes**: `novaCategoriaRoutes.ts`

**Permissões:**
- **Namespace**: `hub.nova_categoria` (lowercase com underscore)
- **Middleware**: `requireNovaCategoriaAccess`

**APIs:**
- **Endpoints**: `/api/nova-categoria` (kebab-case)
- **Features**: `tools.nova_ferramenta` (para ferramentas especializadas)

### 11.2 Estrutura de Tipos

```typescript
// types/nova-categoria.ts
export interface DbNovaCategoria {
  id: number;
  title: string;
  description: string;
  typeId?: number;
  categoryId?: number;
  url?: string;
  logo?: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NovaCategoriaFilters {
  search: string;
  typeId: string;
  categoryId: string;
  verified: boolean | null;
  minRating: number;
}

export interface NovaCategoriaFormData {
  title: string;
  description: string;
  typeId: number;
  categoryId?: number;
  url?: string;
  logo?: string;
}
```

### 11.3 Padrões de Error Handling

```typescript
// Frontend
try {
  const result = await apiCall();
  toast.success('Operação realizada com sucesso!');
} catch (error: any) {
  console.error('Erro na operação:', error);
  
  if (error.message === 'Créditos insuficientes') {
    // Já tratado pelo hook de créditos
    return;
  }
  
  toast.error(error.message || 'Erro na operação');
}

// Backend
try {
  const result = await service.operation();
  ResponseHandler.success(res, result);
} catch (error: any) {
  console.error(`[HUB_NOVA_CATEGORIA] Erro:`, error);
  ResponseHandler.error(res, error.message, 500);
}
```

### 11.4 Padrões de Loading States

```typescript
// Loading para listas
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <HubCardSkeleton key={i} />
    ))}
  </div>
) : (
  <HubGrid items={filteredItems} />
)}

// Loading para processamento
{isProcessing ? (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner />
    <span className="ml-2">Processando...</span>
  </div>
) : (
  <ProcessingForm onSubmit={handleProcess} />
)}
```

### 11.5 Padrões de Validação

```typescript
// Zod schema para validação
export const insertNovaCategoriaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255),
  description: z.string().min(1, 'Descrição é obrigatória'),
  typeId: z.number().positive('Tipo é obrigatório'),
  categoryId: z.number().positive().optional(),
  url: z.string().url('URL inválida').optional(),
  logo: z.string().url('Logo deve ser uma URL válida').optional(),
});

export const updateNovaCategoriaSchema = insertNovaCategoriaSchema.partial();
export const novaCategoriaFiltersSchema = z.object({
  search: z.string().optional(),
  typeId: z.string().optional(),
  categoryId: z.string().optional(),
  verified: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
});
```

---

## 12. Checklist Completo

### Database ✅
- [ ] Tabela principal criada com campos obrigatórios
- [ ] Tabelas de tipos e categorias criadas
- [ ] Sistema de reviews implementado (se aplicável)
- [ ] Tabelas de arquivos criadas (se aplicável)
- [ ] Foreign keys e constraints configurados
- [ ] Índices de performance criados
- [ ] Seeds/dados iniciais inseridos

### Permissões ✅
- [ ] Feature adicionada ao PermissionService
- [ ] Middleware criado e exportado
- [ ] Permissão configurada para grupos relevantes
- [ ] Testes de acesso realizados
- [ ] Admin permissions configuradas

### Backend API ✅
- [ ] Controller implementado com todos os métodos
- [ ] Routes configuradas com middleware adequado
- [ ] Validação de dados implementada
- [ ] Error handling adequado
- [ ] Logging implementado
- [ ] Testes de API realizados

### Context e Estado ✅
- [ ] Context provider implementado
- [ ] Configuração de cache apropriada
- [ ] Filtros e busca implementados
- [ ] Error states tratados
- [ ] Loading states implementados
- [ ] Invalidação de cache configurada

### Frontend Components ✅
- [ ] Página principal criada
- [ ] Sistema de filtros implementado
- [ ] Cards/lista de itens criados
- [ ] Página de detalhes criada
- [ ] Loading states visuais
- [ ] Error states visuais
- [ ] Responsividade testada

### Sistema de Créditos (se aplicável) ✅
- [ ] Feature cost configurado no banco
- [ ] Hook de créditos integrado
- [ ] Verificação pré-operação implementada
- [ ] Logging de uso implementado
- [ ] Feedback de créditos insuficientes
- [ ] Display de custo na interface

### API Externa (se aplicável) ✅
- [ ] Service de integração criado
- [ ] Error handling da API externa
- [ ] Rate limiting implementado
- [ ] Fallback para falhas implementado
- [ ] Logging de chamadas externas
- [ ] Testes de integração realizados

### Navegação e Integração ✅
- [ ] Rotas adicionadas ao App.tsx
- [ ] Guards de permissão aplicados
- [ ] Navegação do Hub atualizada
- [ ] Breadcrumbs implementados
- [ ] Links internos funcionando
- [ ] SEO básico configurado

### Sistema de Reviews (se aplicável) ✅
- [ ] Componente de rating implementado
- [ ] Formulário de review criado
- [ ] Lista de reviews implementada
- [ ] Sistema de resposta a reviews
- [ ] Agregação de ratings funcionando
- [ ] Validação de reviews implementada

### Performance e Cache ✅
- [ ] Estratégia de cache implementada
- [ ] Invalidação de cache configurada
- [ ] Lazy loading implementado
- [ ] Paginação implementada (se necessário)
- [ ] Otimizações de bundle realizadas
- [ ] Performance testada

### Qualidade e Testes ✅
- [ ] TypeScript sem erros
- [ ] Componentes seguem padrões Hub
- [ ] Acessibilidade básica implementada
- [ ] Testes manuais realizados
- [ ] Cross-browser testado
- [ ] Mobile responsivo testado

### Documentação ✅
- [ ] Comentários no código crítico
- [ ] README atualizado
- [ ] API documentada
- [ ] Changelog atualizado
- [ ] Guia de uso criado

---

## Exemplo Completo: Ferramenta Hub de Podcasts

### Definição
- **Nome**: Hub de Podcasts E-commerce
- **Tipo**: Catálogo de recursos (Tipo 1)
- **Funcionalidade**: Diretório de podcasts especializados em e-commerce
- **Permissão**: `hub.podcasts`
- **Features**: Busca, filtros por categoria, player integrado, avaliações

### Database Schema
```sql
-- Tabela principal
CREATE TABLE podcasts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  host TEXT NOT NULL,
  category_id INTEGER REFERENCES podcast_categories(id),
  cover_image TEXT,
  spotify_url TEXT,
  apple_podcasts_url TEXT,
  website TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorias
CREATE TABLE podcast_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Headphones',
  description TEXT
);

-- Reviews
CREATE TABLE podcast_reviews (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER REFERENCES podcasts(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Episódios (opcional)
CREATE TABLE podcast_episodes (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER REFERENCES podcasts(id),
  title TEXT NOT NULL,
  description TEXT,
  episode_url TEXT,
  duration INTEGER, -- em segundos
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Permissão
```typescript
// server/services/permissionService.ts
{ code: 'hub.podcasts', name: 'Podcasts E-commerce', category: 'HUB', sortOrder: 7 },
```

### Context
```typescript
// client/src/contexts/PodcastsContext.tsx
export function PodcastsProvider({ children }: { children: React.ReactNode }) {
  const {
    data: podcasts = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/podcasts'],
    queryFn: () => apiRequest<DbPodcast[]>('/api/podcasts'),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    refetchOnWindowFocus: false,
    structuralSharing: true,
  });

  // ... implementação dos filtros e busca
}
```

### Frontend
```typescript
// client/src/pages/hub/Podcasts.tsx
export default function PodcastsPage() {
  const { podcasts, categories, loading, filters, setFilters, getFilteredPodcasts } = usePodcasts();
  const filteredPodcasts = getFilteredPodcasts();

  return (
    <PermissionGuard featureCode="hub.podcasts">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Podcasts E-commerce</h1>
          <p className="text-gray-600 mt-2">
            Descobra os melhores podcasts sobre e-commerce e Amazon FBA
          </p>
        </div>

        <PodcastFilters
          searchTerm={filters.search}
          selectedCategory={filters.categoryId}
          onSearchChange={(search) => setFilters({ search })}
          onCategoryChange={(categoryId) => setFilters({ categoryId })}
          categories={categories}
        />

        {loading ? (
          <PodcastGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
```

### Resultado
Uma ferramenta Hub completa para descobrir e avaliar podcasts de e-commerce, seguindo todos os padrões estabelecidos, com sistema de avaliações, filtros avançados, e integração completa com o sistema de permissões da plataforma.

---

## Conclusão

Este guia fornece uma estrutura completa para criar ferramentas no Hub do Aluno Power Platform. Seguindo estes padrões, você garante:

- **Consistência** com o sistema Hub existente
- **Performance** através de estratégias de cache apropriadas
- **Segurança** via sistema de permissões granular
- **Escalabilidade** com padrões de código bem estruturados
- **Experiência do Usuário** consistente e intuitiva

**Próximos Passos**: Use este documento como referência para implementar sua nova ferramenta Hub e consulte os exemplos existentes no código para padrões específicos.