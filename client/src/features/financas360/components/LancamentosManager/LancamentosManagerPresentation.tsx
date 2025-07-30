/**
 * PRESENTATION: LancamentosManagerPresentation
 * Interface visual para gerenciamento de lançamentos financeiros
 * Extraído de LancamentosManager.tsx (672 linhas) para modularização
 */
import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  Download, 
  Upload,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  FileText,
  Calculator
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { LancamentosManagerPresentationProps } from '../../types/lancamentos';

export const LancamentosManagerPresentation: React.FC<LancamentosManagerPresentationProps> = memo(({
  state,
  lancamentosData,
  empresasData,
  parceirosData,
  actions,
  utils,
  readOnly = false,
  showStatistics = true,
  showFilters = true,
}) => {
  // ✅ OTIMIZAÇÃO 3: useMemo para configurações estáticas evita recriação a cada render
  const statusConfig = useMemo(() => ({
    pendente: { 
      label: 'Pendente', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    pago: { 
      label: 'Pago', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    cancelado: { 
      label: 'Cancelado', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    },
    vencido: { 
      label: 'Vencido', 
      color: 'bg-red-100 text-red-800', 
      icon: AlertTriangle 
    }
  }), []);

  // ✅ OTIMIZAÇÃO 3: useMemo para configurações de tipo evita recriação
  const tipoConfig = useMemo(() => ({
    receita: { 
      label: 'Receita', 
      color: 'bg-green-100 text-green-800', 
      icon: TrendingUp 
    },
    despesa: { 
      label: 'Despesa', 
      color: 'bg-red-100 text-red-800', 
      icon: TrendingDown 
    }
  }), []);

  // ===== RENDER FUNCTIONS =====
  const renderStatistics = () => {
    if (!showStatistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Receitas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {utils.formatCurrency(state.totalReceitas)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Despesas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {utils.formatCurrency(state.totalDespesas)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        {/* Saldo Total */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <p className={cn(
                  "text-2xl font-bold",
                  state.saldoTotal >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {utils.formatCurrency(state.saldoTotal)}
                </p>
              </div>
              <DollarSign className={cn(
                "h-8 w-8",
                state.saldoTotal >= 0 ? "text-green-600" : "text-red-600"
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {state.lancamentosPendentes}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Vencidos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {state.lancamentosVencidos}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Descrição, categoria..."
                  value={state.filters.search}
                  onChange={(e) => actions.updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={state.filters.status} 
                onValueChange={(value) => actions.updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={state.filters.tipo} 
                onValueChange={(value) => actions.updateFilter('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Select 
                value={state.filters.empresaId} 
                onValueChange={(value) => actions.updateFilter('empresaId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {empresasData.data.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={state.filters.dataInicio}
                onChange={(e) => actions.updateFilter('dataInicio', e.target.value)}
              />
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={state.filters.dataFim}
                onChange={(e) => actions.updateFilter('dataFim', e.target.value)}
              />
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="valorMin">Valor Mínimo</Label>
              <Input
                id="valorMin"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={state.filters.valorMin || ''}
                onChange={(e) => actions.updateFilter('valorMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <Label htmlFor="valorMax">Valor Máximo</Label>
              <Input
                id="valorMax"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={state.filters.valorMax || ''}
                onChange={(e) => actions.updateFilter('valorMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={actions.resetFilters}
            >
              Limpar Filtros
            </Button>
            <Button onClick={actions.applyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ✅ OTIMIZAÇÃO 2: useCallback para render functions evita recriação
  const renderActions = useCallback(() => {
    if (readOnly) return null;

    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={() => actions.openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
          
          {state.selectedItems.length > 0 && (
            <>
              <Button 
                variant="outline"
                onClick={() => actions.bulkUpdateStatus('pago')}
              >
                Marcar como Pago ({state.selectedItems.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => actions.bulkUpdateStatus('cancelado')}
              >
                Cancelar ({state.selectedItems.length})
              </Button>
              <Button 
                variant="destructive"
                onClick={() => actions.bulkDelete()}
              >
                Excluir ({state.selectedItems.length})
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    );
  }, [readOnly, state.selectedItems.length, actions]);

  const renderLancamentosTable = () => {
    if (lancamentosData.isLoading) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando lançamentos...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (lancamentosData.error) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">Erro ao carregar lançamentos</p>
              <p className="text-sm text-muted-foreground">{lancamentosData.error}</p>
              <Button 
                className="mt-4" 
                onClick={() => lancamentosData.refetch()}
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (lancamentosData.data.length === 0) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold">Nenhum lançamento encontrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Não há lançamentos que correspondam aos filtros aplicados.
              </p>
              {!readOnly && (
                <Button onClick={() => actions.openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Lançamento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Lançamentos ({lancamentosData.data.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {!readOnly && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={state.selectedItems.length === lancamentosData.data.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            actions.selectAll();
                          } else {
                            actions.clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                  )}
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Categoria</TableHead>
                  {!readOnly && <TableHead className="w-[100px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentosData.data.map((lancamento) => {
                  const StatusIcon = statusConfig[lancamento.status]?.icon || Clock;
                  const TipoIcon = tipoConfig[lancamento.tipo]?.icon || DollarSign;
                  const isVencido = utils.isVencido(lancamento);
                  const status = isVencido ? 'vencido' : lancamento.status;

                  return (
                    <TableRow key={lancamento.id}>
                      {!readOnly && (
                        <TableCell>
                          <Checkbox
                            checked={state.selectedItems.includes(lancamento.id)}
                            onCheckedChange={() => actions.selectItem(lancamento.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={tipoConfig[lancamento.tipo]?.color}
                        >
                          <TipoIcon className="h-3 w-3 mr-1" />
                          {tipoConfig[lancamento.tipo]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lancamento.descricao}</p>
                          {lancamento.observacoes && (
                            <p className="text-xs text-muted-foreground">
                              {lancamento.observacoes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className={cn(
                          lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {utils.formatCurrency(lancamento.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{utils.formatDate(lancamento.dataVencimento)}</p>
                          {lancamento.dataPagamento && (
                            <p className="text-xs text-muted-foreground">
                              Pago: {utils.formatDate(lancamento.dataPagamento)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={statusConfig[status]?.color}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {utils.getEmpresaName(lancamento.empresaId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {lancamento.categoria}
                        </Badge>
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => actions.openDialog(lancamento)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => actions.duplicateLancamento(lancamento.id)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {lancamento.status === 'pendente' && (
                                <DropdownMenuItem
                                  onClick={() => actions.markAsPaid(lancamento.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                              )}
                              {lancamento.status === 'pago' && (
                                <DropdownMenuItem
                                  onClick={() => actions.markAsPending(lancamento.id)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Marcar como Pendente
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => actions.markAsCanceled(lancamento.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => actions.deleteLancamento(lancamento.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderFormDialog = () => {
    if (readOnly) return null;

    return (
      <Dialog open={state.isDialogOpen} onOpenChange={actions.closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {state.editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="form-tipo">Tipo *</Label>
              <Select 
                value={state.formData.tipo} 
                onValueChange={(value) => actions.updateFormData('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
              {state.errors.tipo && (
                <p className="text-sm text-red-600">{state.errors.tipo}</p>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="form-empresa">Empresa *</Label>
              <Select 
                value={state.formData.empresaId.toString()} 
                onValueChange={(value) => actions.updateFormData('empresaId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresasData.data.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors.empresaId && (
                <p className="text-sm text-red-600">{state.errors.empresaId}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="form-descricao">Descrição *</Label>
              <Input
                id="form-descricao"
                value={state.formData.descricao}
                onChange={(e) => actions.updateFormData('descricao', e.target.value)}
                placeholder="Descrição do lançamento"
              />
              {state.errors.descricao && (
                <p className="text-sm text-red-600">{state.errors.descricao}</p>
              )}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="form-valor">Valor *</Label>
              <Input
                id="form-valor"
                type="number"
                step="0.01"
                value={state.formData.valor}
                onChange={(e) => actions.updateFormData('valor', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
              {state.errors.valor && (
                <p className="text-sm text-red-600">{state.errors.valor}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="form-status">Status *</Label>
              <Select 
                value={state.formData.status} 
                onValueChange={(value) => actions.updateFormData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {state.errors.status && (
                <p className="text-sm text-red-600">{state.errors.status}</p>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="form-dataVencimento">Data de Vencimento *</Label>
              <Input
                id="form-dataVencimento"
                type="date"
                value={state.formData.dataVencimento}
                onChange={(e) => actions.updateFormData('dataVencimento', e.target.value)}
              />
              {state.errors.dataVencimento && (
                <p className="text-sm text-red-600">{state.errors.dataVencimento}</p>
              )}
            </div>

            {/* Data de Pagamento */}
            {state.formData.status === 'pago' && (
              <div className="space-y-2">
                <Label htmlFor="form-dataPagamento">Data de Pagamento</Label>
                <Input
                  id="form-dataPagamento"
                  type="date"
                  value={state.formData.dataPagamento}
                  onChange={(e) => actions.updateFormData('dataPagamento', e.target.value)}
                />
              </div>
            )}

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="form-categoria">Categoria *</Label>
              <Input
                id="form-categoria"
                value={state.formData.categoria}
                onChange={(e) => actions.updateFormData('categoria', e.target.value)}
                placeholder="Categoria do lançamento"
              />
              {state.errors.categoria && (
                <p className="text-sm text-red-600">{state.errors.categoria}</p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="form-observacoes">Observações</Label>
              <Textarea
                id="form-observacoes"
                value={state.formData.observacoes}
                onChange={(e) => actions.updateFormData('observacoes', e.target.value)}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={actions.closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (state.editingLancamento) {
                  actions.updateLancamento(state.editingLancamento.id, state.formData);
                } else {
                  actions.createLancamento(state.formData);
                }
              }}
              disabled={state.isSaving}
            >
              {state.isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {state.editingLancamento ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="space-y-6">
      {renderStatistics()}
      {renderFilters()}
      {renderActions()}
      {renderLancamentosTable()}
      {renderFormDialog()}
    </div>
  );
});

// ✅ OTIMIZAÇÃO 1: React.memo() implementado com display name para debugging
LancamentosManagerPresentation.displayName = 'LancamentosManagerPresentation';

export default LancamentosManagerPresentation;
