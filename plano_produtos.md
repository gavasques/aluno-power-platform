# Plano de Implementação - Gestão de Produtos Importados

## Visão Geral

Desenvolvimento sistemático da área "Gestão de Produtos Importados" dentro de `/minha-area/importacoes`, seguindo uma abordagem simplificada e funcional.

## Estrutura do Desenvolvimento

**Localização:** `/minha-area/importacoes/produtos-importados`
**Objetivo:** Sistema completo para gestão de produtos em processo de importação
**Tempo Estimado:** 8-11 dias de desenvolvimento

---

## FASE 1: ESTRUTURA BASE E BANCO DE DADOS (2-3 dias)

### Passo 1.1: Criar Migrations do Banco de Dados
- [x] Criar migration `imported_products` (tabela principal)
- [x] Criar migration `product_packages` (sistema de embalagens)
- [x] Criar migration `product_files` (arquivos e documentos)
- [x] Criar migration `product_notes` (anotações)
- [x] Executar migrations no banco PostgreSQL

### Passo 1.2: Atualizar Schema Drizzle
- [x] Adicionar tabelas em `shared/schema.ts`
- [x] Configurar relacionamentos entre tabelas
- [x] Criar schemas de validação com Zod
- [x] Gerar tipos TypeScript automaticamente

### Passo 1.3: Criar Tipos TypeScript
- [x] Tipos integrados no `shared/schema.ts`
- [x] Interfaces para formulários (InsertImportedProduct, etc)
- [x] Definir enums para status e categorias
- [x] Relations configuradas entre todas as tabelas

### Passo 1.4: Teste da Estrutura Base
- [x] Verificar se migrations executaram corretamente
- [x] Testar conexões entre tabelas
- [x] Validar tipos TypeScript
- [x] Confirmar que schema está sincronizado

**✅ Checkpoint Fase 1 CONCLUÍDA:** Estrutura de dados criada e funcionando (Jan 22, 2025)

---

## FASE 2: BACKEND E APIs (2-3 dias)

### Passo 2.1: Criar Serviços de Backend
- [x] Criar `server/routes/importedProducts.ts`
- [x] Implementar CRUD completo para produtos
- [x] Criar endpoints para embalagens
- [x] Implementar upload de arquivos

### Passo 2.2: APIs Essenciais - Produtos
- [x] `GET /api/imported-products` - Listar produtos
- [x] `POST /api/imported-products` - Criar produto
- [x] `GET /api/imported-products/:id` - Buscar produto específico
- [x] `PUT /api/imported-products/:id` - Atualizar produto
- [x] `DELETE /api/imported-products/:id` - Deletar produto

### Passo 2.3: APIs de Embalagens
- [x] `GET /api/imported-products/:id/packages` - Listar embalagens
- [x] `POST /api/imported-products/:id/packages` - Criar embalagem
- [x] `PUT /api/packages/:id` - Atualizar embalagem
- [x] `DELETE /api/packages/:id` - Deletar embalagem

### Passo 2.4: APIs de Arquivos e Integrações
- [x] `POST /api/imported-products/:id/files` - Upload arquivos
- [x] `GET /api/suppliers/search` - Buscar fornecedores (integração CRM)
- [x] Implementar validação com Zod
- [x] Configurar middleware de autenticação

### Passo 2.5: Teste das APIs
- [x] Registrar rotas no sistema modular (server/routes/index.ts)
- [x] Criar produto de teste no banco de dados
- [x] Verificar logs de requisições funcionando
- [x] Testar autenticação middleware
- [x] Confirmar estrutura de APIs completa

**✅ Checkpoint Fase 2 CONCLUÍDA:** Backend completo e APIs funcionando (Jan 22, 2025)

---

## FASE 3: FRONTEND - ESTRUTURA DE PÁGINAS (2-3 dias)

### Passo 3.1: Criar Estrutura de Páginas
- [ ] Criar `client/src/pages/myarea/importacoes/produtos/`
- [ ] Página principal: `ImportedProductsIndex.tsx`
- [ ] Formulário: `ImportedProductForm.tsx`
- [ ] Detalhes: `ImportedProductDetail.tsx`

### Passo 3.2: Página de Listagem Principal
- [ ] Tabela responsiva com produtos
- [ ] Colunas: Nome, Código, Fornecedor, Status, Embalagens, Ações
- [ ] Sistema de filtros (Status, Fornecedor, Categoria)
- [ ] Busca por nome/código
- [ ] Paginação
- [ ] Botões de ação (Ver, Editar, Deletar)

### Passo 3.3: Sistema de Roteamento
- [ ] Adicionar rotas em `App.tsx`
- [ ] Configurar rota principal `/minha-area/importacoes/produtos`
- [ ] Configurar rota de formulário `/minha-area/importacoes/produtos/novo`
- [ ] Configurar rota de edição `/minha-area/importacoes/produtos/:id/editar`
- [ ] Configurar rota de detalhes `/minha-area/importacoes/produtos/:id`

### Passo 3.4: Integração com Menu Importações
- [ ] Adicionar novo item "Produtos Importados" em `ImportacoesIndex.tsx`
- [ ] Configurar ícone e descrição
- [ ] Testar navegação entre páginas

### Passo 3.5: Teste da Navegação
- [ ] Testar todas as rotas funcionam
- [ ] Verificar breadcrumbs
- [ ] Confirmar integração com menu principal
- [ ] Testar navegação mobile

**✅ Checkpoint Fase 3:** Estrutura de páginas criada e navegação funcionando

---

## FASE 4: FORMULÁRIO COM ABAS (2-3 dias)

### Passo 4.1: Estrutura Base do Formulário
- [ ] Criar `ImportedProductFormContainer.tsx` (Container)
- [ ] Criar `ImportedProductFormPresentation.tsx` (Presentational)
- [ ] Implementar sistema de abas com 6 seções
- [ ] Configurar validação com React Hook Form + Zod

### Passo 4.2: ABA 1 - Informações Básicas
- [ ] Campo: Nome do produto (obrigatório)
- [ ] Campo: Código interno (obrigatório)
- [ ] Campo: Descrição básica
- [ ] Campo: Descrição detalhada
- [ ] Campos: Categoria, Marca, Modelo, Cor, Material
- [ ] Seletor: Status do produto
- [ ] Validações em tempo real

### Passo 4.3: ABA 2 - Fornecedor
- [ ] Seletor de fornecedor (integração CRM)
- [ ] Campo: Código do produto no fornecedor
- [ ] Campo: Nome conforme fornecedor
- [ ] Campo: Descrição do fornecedor
- [ ] Campos: MOQ e Lead Time
- [ ] Validação de fornecedor obrigatório

### Passo 4.4: ABA 3 - Especificações e Códigos
- [ ] Campo: Especificações técnicas (texto longo)
- [ ] Campo: Código NCM/HS
- [ ] Campo: Percentual de IPI
- [ ] Campo: EAN do produto geral
- [ ] Campo: UPC do produto
- [ ] Campo: Código interno personalizado
- [ ] Campo: Descrição para alfândega

### Passo 4.5: ABA 4 - Embalagens (PRINCIPAL)
- [ ] Checkbox: "Múltiplas embalagens?"
- [ ] Modo simples: campos diretos para 1 embalagem
- [ ] Modo múltiplo: interface dinâmica
- [ ] Campos por embalagem: tipo, conteúdo, EAN, dimensões C×L×A
- [ ] Campos: peso bruto/líquido, unidades, material
- [ ] Botões: Adicionar/Remover embalagem
- [ ] Cálculos automáticos de totais

### Passo 4.6: ABA 5 - Arquivos
- [ ] Upload de imagens (arrastar e soltar)
- [ ] Upload de documentos
- [ ] Galeria organizada por tipo
- [ ] Marcar imagem principal
- [ ] Preview de arquivos

### Passo 4.7: ABA 6 - Observações
- [ ] Campo de notas livres
- [ ] Sistema de notas com títulos
- [ ] Marcar notas importantes
- [ ] Histórico de alterações

### Passo 4.8: Teste do Formulário Completo
- [ ] Testar validações de todos os campos
- [ ] Verificar navegação entre abas
- [ ] Testar salvamento de dados
- [ ] Confirmar sistema de embalagens
- [ ] Validar upload de arquivos

**✅ Checkpoint Fase 4:** Formulário completo com 6 abas funcionando

---

## FASE 5: COMPONENTES ESPECIALIZADOS (1-2 dias)

### Passo 5.1: PackageManager.tsx
- [ ] Componente para gerenciar embalagens
- [ ] Toggle entre modo simples/múltiplo
- [ ] Interface para adicionar/remover embalagens
- [ ] Cálculos automáticos de totais
- [ ] Validação de campos obrigatórios

### Passo 5.2: SupplierSelector.tsx
- [ ] Seletor inteligente de fornecedores
- [ ] Busca em tempo real
- [ ] Integração com CRM existente
- [ ] Preview de dados do fornecedor

### Passo 5.3: FileUploadZone.tsx
- [ ] Zona de upload com drag & drop
- [ ] Preview de imagens
- [ ] Lista de documentos
- [ ] Organização por tipo de arquivo

### Passo 5.4: ProductStatusBadge.tsx
- [ ] Badge visual para status
- [ ] Cores específicas por status
- [ ] Tooltips informativos

### Passo 5.5: Teste dos Componentes
- [ ] Testar PackageManager isoladamente
- [ ] Verificar SupplierSelector com CRM
- [ ] Validar FileUploadZone
- [ ] Confirmar StatusBadge visual

**✅ Checkpoint Fase 5:** Componentes especializados criados e testados

---

## FASE 6: PÁGINA DE DETALHES (1-2 dias)

### Passo 6.1: Layout da Página de Detalhes
- [ ] Header com nome, código e status
- [ ] Seções organizadas: Resumo, Especificações, Embalagens
- [ ] Seção de arquivos com galeria
- [ ] Histórico de alterações

### Passo 6.2: Visualização de Embalagens
- [ ] Lista visual das embalagens
- [ ] Totais automáticos (peso, volume, unidades)
- [ ] Alertas para dimensões incomuns

### Passo 6.3: Galeria de Arquivos
- [ ] Grid de imagens com lightbox
- [ ] Lista de documentos com download
- [ ] Organização por tipo

### Passo 6.4: Ações Disponíveis
- [ ] Botão "Editar Produto"
- [ ] Botão "Simular Importação" (integração)
- [ ] Botão "Duplicar Produto"
- [ ] Botão "Deletar" (com confirmação)

### Passo 6.5: Teste da Página de Detalhes
- [ ] Verificar todas as informações são exibidas
- [ ] Testar todos os botões de ação
- [ ] Validar responsividade
- [ ] Confirmar integração com simuladores

**✅ Checkpoint Fase 6:** Página de detalhes completa e funcional

---

## FASE 7: INTEGRAÇÕES E REFINAMENTOS (1-2 dias)

### Passo 7.1: Integração com Simuladores
- [ ] Botão "Simular Importação" na página de detalhes
- [ ] Envio automático de dados do produto
- [ ] Link direto para simuladores existentes
- [ ] Múltiplas opções: Simplificada, Formal, Courier

### Passo 7.2: Cálculos Automáticos
- [ ] Totais de peso/volume em múltiplas embalagens
- [ ] Densidade (peso/volume) para otimização
- [ ] Alertas para valores incomuns
- [ ] Atualização em tempo real

### Passo 7.3: Validações Inteligentes
- [ ] Validação de formato NCM, EAN, UPC
- [ ] Verificação de dimensões consistentes
- [ ] Alertas para MOQ muito alto
- [ ] Sugestões automáticas

### Passo 7.4: Otimizações de Performance
- [ ] Lazy loading de componentes pesados
- [ ] Debounce em buscas (800ms)
- [ ] Cache de fornecedores (15 min)
- [ ] Paginação otimizada

### Passo 7.5: Teste das Integrações
- [ ] Testar integração com simuladores
- [ ] Verificar cálculos automáticos
- [ ] Validar todas as validações
- [ ] Confirmar performance

**✅ Checkpoint Fase 7:** Integrações e otimizações implementadas

---

## FASE 8: RESPONSIVIDADE E UX (1 dia)

### Passo 8.1: Layout Mobile
- [ ] Formulário adaptativo para mobile
- [ ] Tabela responsiva com scroll horizontal
- [ ] Navegação otimizada para touch
- [ ] Botões adequados para dedos

### Passo 8.2: Loading States
- [ ] Spinners em todas as operações assíncronas
- [ ] Skeleton loading na listagem
- [ ] Progress bar em uploads
- [ ] Feedback visual para ações

### Passo 8.3: Mensagens e Feedbacks
- [ ] Toast notifications para ações
- [ ] Confirmações para exclusões
- [ ] Mensagens de erro claras
- [ ] Tooltips informativos

### Passo 8.4: Teste da Experiência do Usuário
- [ ] Testar fluxo completo em mobile
- [ ] Verificar todos os loading states
- [ ] Validar todas as mensagens
- [ ] Confirmar acessibilidade básica

**✅ Checkpoint Fase 8:** Interface responsiva e experiência do usuário polida

---

## FASE 9: TESTES FINAIS E DOCUMENTAÇÃO (1 dia)

### Passo 9.1: Testes de Funcionalidade
- [ ] Criar produto completo com múltiplas embalagens
- [ ] Testar upload de vários arquivos
- [ ] Verificar integração com fornecedores
- [ ] Testar simulação de importação

### Passo 9.2: Testes de Edge Cases
- [ ] Produto com 1 embalagem
- [ ] Produto com 10+ embalagens
- [ ] Upload de arquivos grandes
- [ ] Formulário com dados inválidos

### Passo 9.3: Testes de Performance
- [ ] Listagem com 100+ produtos
- [ ] Busca e filtros com muitos dados
- [ ] Upload simultâneo de arquivos
- [ ] Navegação em dispositivos lentos

### Passo 9.4: Documentação
- [ ] Comentar código complexo
- [ ] Criar guia de uso para usuários
- [ ] Documentar APIs no README
- [ ] Atualizar `replit.md` com implementação

### Passo 9.5: Deploy e Verificação Final
- [ ] Verificar se todas as migrations estão aplicadas
- [ ] Testar em ambiente de produção
- [ ] Validar todas as funcionalidades
- [ ] Confirmar integração com sistema existente

**✅ Checkpoint Final:** Sistema completo, testado e documentado

---

## Checklist de Validação Geral

### Funcionalidades Principais
- [ ] ✅ Listagem de produtos importados
- [ ] ✅ Formulário completo com 6 abas
- [ ] ✅ Sistema de embalagens (simples e múltiplas)
- [ ] ✅ Upload e gestão de arquivos
- [ ] ✅ Integração com CRM de fornecedores
- [ ] ✅ Página de detalhes completa
- [ ] ✅ Integração com simuladores

### Integrações
- [ ] ✅ CRM de fornecedores funcionando
- [ ] ✅ Upload de arquivos operacional
- [ ] ✅ Link para simuladores funcionando
- [ ] ✅ Cálculos automáticos corretos

### Qualidade e Performance
- [ ] ✅ Interface responsiva (desktop/mobile)
- [ ] ✅ Loading states em todas as operações
- [ ] ✅ Validações funcionando corretamente
- [ ] ✅ Performance otimizada

### Testes Realizados
- [ ] ✅ Produto com 1 embalagem
- [ ] ✅ Produto com múltiplas embalagens
- [ ] ✅ Upload de imagens e documentos
- [ ] ✅ Busca e filtros
- [ ] ✅ Integração com fornecedores
- [ ] ✅ Simulação de importação

---

## Próximos Passos

Após completar todas as fases com ✅, a área "Gestão de Produtos Importados" estará totalmente funcional e integrada ao sistema existente, proporcionando aos usuários uma ferramenta completa para gerenciar seus produtos em processo de importação.

**Status Atual:** Pronto para iniciar Fase 1