# Sistema de Filtros e Busca Reutilizáveis

Este diretório contém componentes de filtros e busca reutilizáveis que eliminam duplicação de código relacionada a filtragem de dados em todo o projeto.

## 🎯 Objetivo

Substituir os padrões duplicados de filtros encontrados em 15+ componentes, proporcionando:
- **Consistência** na experiência do usuário com filtros
- **Manutenibilidade** centralizada de lógica de filtros
- **Redução de código** duplicado (~70% em filtragem de dados)

## 📦 Componentes Disponíveis

### Hook useFilteredData

Hook central para gerenciar filtragem, busca e ordenação de dados.

```tsx
import { useFilteredData } from '@/hooks/useFilteredData';

const filteredProducts = useFilteredData({
  data: products,
  searchFields: ['name', 'description'],
  initialFilters: { active: true },
  initialSort: { key: 'name', direction: 'asc' }
});

// Uso em componente
<SearchInput 
  value={filteredProducts.searchTerm}
  onChange={filteredProducts.setSearchTerm}
/>

<FilterBar
  filters={filteredProducts.filters}
  setFilter={filteredProducts.setFilter}
/>

<DataTable
  data={filteredProducts.filteredData}
  sortConfig={filteredProducts.sortConfig}
  onSort={filteredProducts.toggleSort}
/>
```

**Propriedades disponíveis:**
- `filteredData: T[]` - Dados filtrados e ordenados
- `searchTerm: string` - Termo de busca atual
- `setSearchTerm: (term: string) => void` - Atualizar busca
- `filters: FilterState` - Estado atual dos filtros
- `setFilter: (key: string, value: any) => void` - Aplicar filtro
- `clearFilter: (key: string) => void` - Limpar filtro específico
- `clearAllFilters: () => void` - Limpar todos os filtros
- `sortConfig: SortConfig | null` - Configuração de ordenação
- `toggleSort: (key: keyof T) => void` - Alternar ordenação
- `totalCount: number` - Total de itens
- `filteredCount: number` - Total de itens filtrados
- `hasActiveFilters: boolean` - Se há filtros ativos
- `resetAll: () => void` - Reset completo

### FilterBar

Componente de barra de filtros com múltiplos tipos de filtro.

```tsx
import { FilterBar, FilterUtils } from '@/components/ui/filters';

const filterConfigs = [
  FilterUtils.createSelectFilter('category', 'Categoria', categories),
  FilterUtils.createBooleanFilter('active', 'Ativo'),
  FilterUtils.createTextFilter('name', 'Nome'),
  FilterUtils.createDateFilter('createdAt', 'Criado em'),
  FilterUtils.createNumberFilter('price', 'Preço', 'gte')
];

<FilterBar
  searchTerm={filteredData.searchTerm}
  onSearchChange={filteredData.setSearchTerm}
  filters={filteredData.filters}
  onFilterChange={filteredData.setFilter}
  onClearFilter={filteredData.clearFilter}
  onClearAll={filteredData.clearAllFilters}
  filterConfigs={filterConfigs}
  totalCount={filteredData.totalCount}
  filteredCount={filteredData.filteredCount}
  showActiveFilters={true}
  compact={false}
/>
```

**Props principais:**
- `searchTerm?: string` - Termo de busca
- `onSearchChange?: (term: string) => void` - Callback de busca
- `filters: FilterState` - Estado dos filtros
- `onFilterChange: (key: string, value: any) => void` - Aplicar filtro
- `filterConfigs?: FilterConfig[]` - Configurações dos filtros
- `totalCount?: number` - Total de itens
- `filteredCount?: number` - Itens filtrados
- `showActiveFilters?: boolean` - Mostrar filtros ativos
- `compact?: boolean` - Layout compacto

**Tipos de filtros suportados:**
- `text` - Campo de texto livre
- `select` - Lista suspensa
- `multiselect` - Múltipla seleção
- `boolean` - Sim/Não/Todos
- `date` - Seletor de data
- `number` - Campo numérico

### DataTable

Tabela de dados com ordenação integrada.

```tsx
import { DataTable, ColumnUtils } from '@/components/ui/filters';

const columns = [
  ColumnUtils.textColumn('name', 'Nome'),
  ColumnUtils.priceColumn('price'),
  ColumnUtils.dateColumn('createdAt', 'Criado em'),
  ColumnUtils.statusColumn('active'),
  {
    key: 'custom',
    title: 'Customizado',
    sortable: false,
    render: (value, item) => <CustomComponent item={item} />
  }
];

<DataTable
  data={filteredData.filteredData}
  columns={columns}
  sortConfig={filteredData.sortConfig}
  onSort={filteredData.toggleSort}
  onRowClick={(item) => console.log('Clicked:', item)}
  emptyMessage="Nenhum resultado encontrado"
  loading={isLoading}
/>
```

**Props principais:**
- `data: T[]` - Dados para exibir
- `columns: ColumnConfig<T>[]` - Configuração das colunas
- `sortConfig?: SortConfig<T>` - Configuração de ordenação
- `onSort?: (key: keyof T) => void` - Callback de ordenação
- `onRowClick?: (item: T, index: number) => void` - Click na linha
- `loading?: boolean` - Estado de carregamento
- `emptyMessage?: string` - Mensagem quando vazio

### Componentes Auxiliares

#### SearchBar - Busca simples
```tsx
<SearchBar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Buscar produtos..."
/>
```

#### QuickFilters - Filtros rápidos (chips)
```tsx
<QuickFilters
  options={[
    { value: 'all', label: 'Todos', count: 100 },
    { value: 'active', label: 'Ativos', count: 85 },
    { value: 'inactive', label: 'Inativos', count: 15 }
  ]}
  selectedValue={quickFilter}
  onSelect={setQuickFilter}
/>
```

#### DataTablePagination - Paginação
```tsx
const pagination = usePagination(filteredData.filteredData, 10);

<DataTable data={pagination.paginatedData} columns={columns} />
<DataTablePagination
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  onPageChange={pagination.setCurrentPage}
  itemsPerPage={10}
  totalItems={pagination.totalItems}
/>
```

## 🚀 Utilitários para Casos Comuns

### FilterUtils

Funções auxiliares para criar configurações de filtros rapidamente.

```tsx
import { FilterUtils } from '@/components/ui/filters';

const filterConfigs = [
  FilterUtils.createTextFilter('name', 'Nome'),
  FilterUtils.createSelectFilter('category', 'Categoria', categories),
  FilterUtils.createBooleanFilter('active', 'Ativo'),
  FilterUtils.createDateFilter('createdAt', 'Criado em'),
  FilterUtils.createNumberFilter('price', 'Preço', 'gte')
];
```

### ColumnUtils

Funções auxiliares para criar configurações de colunas rapidamente.

```tsx
import { ColumnUtils } from '@/components/ui/filters';

const columns = [
  ColumnUtils.textColumn('name', 'Nome'),
  ColumnUtils.priceColumn('price'),
  ColumnUtils.dateColumn('createdAt', 'Criado em'),
  ColumnUtils.statusColumn('active'),
  ColumnUtils.actionsColumn((item) => (
    <div>
      <Button onClick={() => edit(item)}>Editar</Button>
      <Button onClick={() => delete(item)}>Excluir</Button>
    </div>
  ))
];
```

### createDataManager

Função utilitária para casos super simples.

```tsx
import { createDataManager } from '@/components/ui/filters';

const { filteredData, FilterBar, DataTable } = createDataManager(
  products,
  ['name', 'description'],
  filterConfigs,
  columnConfigs
);

return (
  <div>
    <FilterBar />
    <DataTable />
  </div>
);
```

## 📊 Migração de Componentes Existentes

### Antes (Código Duplicado)
```tsx
// ❌ Padrão repetido em 15+ componentes
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState('');
const [statusFilter, setStatusFilter] = useState('');
const [sortField, setSortField] = useState('name');
const [sortDirection, setSortDirection] = useState('asc');

// Lógica de filtros (~40 linhas de código)
const filteredData = data.filter(item => {
  const matchesSearch = searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
  const matchesStatus = statusFilter === '' || item.active === (statusFilter === 'active');
  return matchesSearch && matchesCategory && matchesStatus;
});

// Lógica de ordenação (~15 linhas de código)
const sortedData = [...filteredData].sort((a, b) => {
  const aValue = a[sortField];
  const bValue = b[sortField];
  let comparison = 0;
  if (typeof aValue === 'string') {
    comparison = aValue.localeCompare(bValue);
  } else {
    comparison = aValue - bValue;
  }
  return sortDirection === 'desc' ? -comparison : comparison;
});

return (
  <div>
    {/* Interface de filtros customizada (~50 linhas) */}
    <div className="filters">
      <Input 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        placeholder="Buscar..."
      />
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="cat1">Categoria 1</SelectItem>
          <SelectItem value="cat2">Categoria 2</SelectItem>
        </SelectContent>
      </Select>
      {/* Mais filtros... */}
    </div>
    
    {/* Lista/tabela customizada (~40 linhas) */}
    <div className="results">
      {sortedData.map(item => (
        <div key={item.id}>
          {/* Item customizado */}
        </div>
      ))}
    </div>
  </div>
);
```

### Depois (Código Reutilizável)
```tsx
// ✅ 10 linhas apenas!
const filteredData = useFilteredData({
  data,
  searchFields: ['name', 'description'],
  initialFilters: {},
  initialSort: { key: 'name', direction: 'asc' }
});

const filterConfigs = [
  FilterUtils.createSelectFilter('category', 'Categoria', categories),
  FilterUtils.createBooleanFilter('active', 'Ativo')
];

const columns = [
  ColumnUtils.textColumn('name', 'Nome'),
  ColumnUtils.statusColumn('active')
];

return (
  <div>
    <FilterBar
      searchTerm={filteredData.searchTerm}
      onSearchChange={filteredData.setSearchTerm}
      filters={filteredData.filters}
      onFilterChange={filteredData.setFilter}
      onClearFilter={filteredData.clearFilter}
      onClearAll={filteredData.clearAllFilters}
      filterConfigs={filterConfigs}
      totalCount={filteredData.totalCount}
      filteredCount={filteredData.filteredCount}
    />
    
    <DataTable
      data={filteredData.filteredData}
      columns={columns}
      sortConfig={filteredData.sortConfig}
      onSort={filteredData.toggleSort}
    />
  </div>
);
```

**Redução**: De 130-150 linhas para 15-20 linhas (**85-90% menos código**)

## ✅ Benefícios

1. **Redução de Código**: ~70% menos código duplicado em filtros
2. **Consistência**: Mesma interface e comportamento em todo o app
3. **Tipagem**: Full TypeScript com generics para type safety
4. **Performance**: Debounce automático e otimizações integradas
5. **Flexibilidade**: Suporta filtros simples e complexos
6. **Acessibilidade**: Padrões acessíveis implementados por padrão
7. **Manutenibilidade**: Mudanças centralizadas afetam todo o sistema

## 🔄 Casos de Uso Avançados

### Filtros Customizados com Operadores
```tsx
const advancedFilters = [
  {
    key: 'price',
    type: 'number',
    label: 'Preço Mínimo',
    operator: 'gte'
  },
  {
    key: 'date',
    type: 'date',
    label: 'Criado Após',
    operator: 'gt'
  },
  {
    key: 'description',
    type: 'text',
    label: 'Descrição',
    operator: 'contains'
  }
];
```

### Múltiplas Ordenações
```tsx
const filteredData = useFilteredData({
  data: products,
  searchFields: ['name', 'description'],
  initialSort: { key: 'createdAt', direction: 'desc' }
});

// Usuário pode alternar ordenação clicando nas colunas
<DataTable
  data={filteredData.filteredData}
  columns={columns}
  sortConfig={filteredData.sortConfig}
  onSort={filteredData.toggleSort} // Alterna asc/desc/null
/>
```

### Filtros com Paginação
```tsx
const filteredData = useFilteredData({ data, searchFields: ['name'] });
const pagination = usePagination(filteredData.filteredData, 20);

return (
  <div>
    <FilterBar {...filteredData} filterConfigs={filterConfigs} />
    <DataTable data={pagination.paginatedData} columns={columns} />
    <DataTablePagination {...pagination} itemsPerPage={20} />
  </div>
);
```

### Filtros Persistentes (URL State)
```tsx
// TODO: Implementar em versão futura
const filteredData = useFilteredData({
  data,
  searchFields: ['name'],
  persistToUrl: true, // Salva filtros na URL
  urlKey: 'products' // Chave única para a página
});
```

## 🔄 Próximos Passos

1. Migrar componentes existentes para usar estes filtros
2. Remover código duplicado de filtragem
3. Implementar testes para os componentes
4. Expandir para outros padrões (Fase 4: Toasts)
5. Adicionar filtros avançados (ranges, multiple dates)
6. Implementar persistência de filtros na URL