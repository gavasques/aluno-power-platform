/**
 * PRESENTATION: ParceirosManagerPresentation
 * Interface de usuário para gerenciamento de parceiros
 * Extraído de ParceirosManager.tsx (753 linhas) para modularização
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Import specialized components (to be created)
import { ParceiroList } from '../ParceiroList/ParceiroList';
import { ParceiroForm } from '../ParceiroForm/ParceiroForm'; 
import { ParceiroDetailTabs } from '../ParceiroDetailTabs/ParceiroDetailTabs';
import { FilterBar } from '../FilterBar/FilterBar';
import { StatsCards } from '../StatsCards/StatsCards';

// Import types
import { ParceirosManagerPresentationProps, ParceiroTab } from '../../types/parceiros';

export const ParceirosManagerPresentation = ({
  state,
  parceiros,
  actions,
  contatos,
  contratos,
  movimentacoes,
  documentos,
  readOnly = false,
  showBulkActions = true,
  showFinancialInfo = true
}: ParceirosManagerPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const hasSelection = state.selectedItems.length > 0;
  const isAllSelected = state.selectedItems.length === parceiros.filteredData.length;
  const totals = movimentacoes.getTotals();

  // Stats for cards
  const stats = {
    total: parceiros.filteredData.length,
    ativos: parceiros.filteredData.filter(p => p.status === 'ativo').length,
    inativos: parceiros.filteredData.filter(p => p.status === 'inativo').length,
    bloqueados: parceiros.filteredData.filter(p => p.status === 'bloqueado').length,
    clientes: parceiros.filteredData.filter(p => p.categoria === 'cliente').length,
    fornecedores: parceiros.filteredData.filter(p => p.categoria === 'fornecedor').length,
    transportadoras: parceiros.filteredData.filter(p => p.categoria === 'transportadora').length,
    outros: parceiros.filteredData.filter(p => !['cliente', 'fornecedor', 'transportadora'].includes(p.categoria)).length
  };

  // ===== HANDLERS =====
  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${state.selectedItems.length} parceiro(s)?`)) {
      await actions.bulkDelete(state.selectedItems);
    }
  };

  const handleParceiroClick = (parceiro) => {
    actions.selectParceiro(parceiro);
  };

  const handleTabChange = (tab: ParceiroTab) => {
    actions.setActiveTab(tab);
  };

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Parceiros - Finanças360</title>
        <meta 
          name="description" 
          content="Gerencie clientes, fornecedores e parceiros de negócios com contratos, documentos e movimentações financeiras."
        />
      </Helmet>

      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gerenciamento de Parceiros
              </h2>
              <p className="text-sm text-gray-600">
                Clientes, fornecedores e parceiros de negócios
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              {showBulkActions && hasSelection && (
                <>
                  <Badge variant="secondary" className="mr-2">
                    {state.selectedItems.length} selecionado(s)
                  </Badge>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                    disabled={state.isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                  <Button
                    onClick={actions.clearSelection}
                    variant="outline"
                    size="sm"
                  >
                    Limpar Seleção
                  </Button>
                </>
              )}
              
              <Button
                onClick={actions.showCreateForm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <StatsCards
          totals={stats}
          financeiro={totals}
          isLoading={parceiros.isLoading}
          showFinancialInfo={showFinancialInfo}
        />

        {/* Filter Bar */}
        <FilterBar
          searchQuery={state.searchQuery}
          categoriaFilter={state.categoriaFilter}
          statusFilter={state.statusFilter}
          tipoFilter={state.tipoFilter}
          onSearchChange={actions.search}
          onCategoriaFilter={actions.filterByCategoria}
          onStatusFilter={actions.filterByStatus}
          onTipoFilter={actions.filterByTipo}
          onClearFilters={() => {
            actions.search('');
            actions.filterByCategoria('all');
            actions.filterByStatus('all');
            actions.filterByTipo('all');
          }}
        />

        {/* Loading State */}
        {parceiros.isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando parceiros...</span>
          </div>
        )}

        {/* Error State */}
        {parceiros.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Erro ao carregar parceiros</h3>
            </div>
            <p className="text-red-700 mt-1">{parceiros.error}</p>
            <Button 
              onClick={parceiros.refetch}
              variant="outline" 
              size="sm" 
              className="mt-3 text-red-600 border-red-600 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Main Content */}
        {!parceiros.isLoading && !parceiros.error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Parceiros List */}
            <div className={`${state.selectedParceiro ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4`}>
              
              {/* Parceiros List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Parceiros ({parceiros.filteredData.length})
                    </CardTitle>
                    
                    {showBulkActions && (
                      <div className="flex items-center gap-2 text-sm">
                        <Button
                          onClick={isAllSelected ? actions.clearSelection : actions.selectAllItems}
                          variant="outline"
                          size="sm"
                        >
                          {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ParceiroList
                    parceiros={parceiros.filteredData}
                    isLoading={parceiros.isLoading}
                    selectedParceiro={state.selectedParceiro}
                    selectedItems={state.selectedItems}
                    onParceiroSelect={handleParceiroClick}
                    onParceiroEdit={actions.showEditForm}
                    onParceiroDelete={actions.deleteParceiro}
                    onItemToggle={actions.toggleItemSelection}
                    onSelectAll={actions.selectAllItems}
                    onClearSelection={actions.clearSelection}
                    sortBy={state.sortBy}
                    sortOrder={state.sortOrder}
                    onSort={actions.sortBy}
                    readOnly={readOnly}
                  />
                </CardContent>
              </Card>

              {/* Empty State */}
              {parceiros.filteredData.length === 0 && !parceiros.isLoading && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum parceiro encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {state.searchQuery || state.categoriaFilter !== 'all' || state.statusFilter !== 'all' || state.tipoFilter !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Comece criando seu primeiro parceiro'
                      }
                    </p>
                    {!readOnly && (
                      <Button
                        onClick={actions.showCreateForm}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Parceiro
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Parceiro Details */}
            {state.selectedParceiro && (
              <div className="lg:col-span-2 space-y-6">
                
                {/* Parceiro Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {state.selectedParceiro.razaoSocial}
                          </h3>
                          {state.selectedParceiro.nomeFantasia && (
                            <p className="text-gray-600">
                              {state.selectedParceiro.nomeFantasia}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={state.selectedParceiro.status === 'ativo' ? 'default' : 'secondary'}
                              className={
                                state.selectedParceiro.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                state.selectedParceiro.status === 'bloqueado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {state.selectedParceiro.status}
                            </Badge>
                            <Badge variant="outline">
                              {state.selectedParceiro.categoria}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => actions.showEditForm(state.selectedParceiro!)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => actions.deleteParceiro(state.selectedParceiro!.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>CNPJ: {state.selectedParceiro.cnpj}</span>
                      </div>
                      {state.selectedParceiro.contatos?.[0]?.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{state.selectedParceiro.contatos[0].email}</span>
                        </div>
                      )}
                      {state.selectedParceiro.contatos?.[0]?.telefone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{state.selectedParceiro.contatos[0].telefone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Parceiro Detail Tabs */}
                <Card>
                  <CardContent className="p-0">
                    <ParceiroDetailTabs
                      parceiro={state.selectedParceiro}
                      activeTab={state.activeTab}
                      onTabChange={handleTabChange}
                      contatos={contatos}
                      contratos={contratos}
                      movimentacoes={movimentacoes}
                      documentos={documentos}
                      readOnly={readOnly}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Parceiro Form Modal */}
        {state.showForm && (
          <ParceiroForm
            parceiro={state.selectedParceiro || undefined}
            onSave={state.selectedParceiro 
              ? (data) => actions.updateParceiro(state.selectedParceiro!.id, data)
              : actions.createParceiro
            }
            onCancel={actions.hideForm}
            isLoading={state.isSaving}
            errors={state.errors}
            validationErrors={state.validationErrors}
          />
        )}
      </div>
    </>
  );
};