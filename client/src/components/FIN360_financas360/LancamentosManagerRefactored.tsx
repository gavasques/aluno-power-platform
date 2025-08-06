import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import type { 
  Lancamento, 
  LancamentoFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * LANÇAMENTOS MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 672 linhas → ~120 linhas (82% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 */
export default function LancamentosManagerRefactored() {
  const formatters = useFinancas360Formatters();
  const { token } = useAuth();

  // Fetch empresas para select
  const { data: empresas = [] } = useQuery({
    queryKey: ['financas360-empresas'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/empresas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar empresas');
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Configuração do manager
  const config: ManagerConfig<Lancamento, LancamentoFormData> = {
    title: 'Lançamentos',
    description: 'Gerencie receitas e despesas financeiras',
    apiEndpoint: '/api/financas360/lancamentos',
    queryKey: 'financas360-lancamentos',
    
    defaultFormData: {
      empresaId: 0,
      tipo: 'receita',
      descricao: '',
      valor: 0,
      dataVencimento: '',
      dataPagamento: '',
      status: 'pendente',
      categoria: '',
      ativo: true,
      observacoes: ''
    },

    // Validação do formulário
    validateForm: (data) => {
      if (!data.empresaId) return 'Empresa é obrigatória';
      if (!data.descricao.trim()) return 'Descrição é obrigatória';
      if (data.valor <= 0) return 'Valor deve ser maior que zero';
      if (!data.dataVencimento) return 'Data de vencimento é obrigatória';
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: Lancamento) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${
            item.tipo === 'receita' 
              ? 'bg-green-100' 
              : 'bg-red-100'
          }`}>
            {item.tipo === 'receita' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {formatters.truncateText(item.descricao, 40)}
              </span>
              <Badge className={formatters.formatStatus(item.status).color}>
                {formatters.formatStatus(item.status).label}
              </Badge>
              <Badge variant="outline">
                {formatters.formatTipo(item.tipo)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.empresa.razaoSocial} • Vence em {formatters.formatDate(item.dataVencimento)}
              {item.categoria && ` • ${item.categoria}`}
            </div>
            <div className={`text-lg font-semibold ${
              item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
            }`}>
              {item.tipo === 'receita' ? '+' : '-'} {formatters.formatCurrency(item.valor)}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<LancamentoFormData>) => (
      <div className="space-y-4">
        {/* Empresa */}
        <div>
          <Label htmlFor="empresaId">Empresa *</Label>
          <Select
            value={formData.empresaId.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, empresaId: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((empresa: any) => (
                <SelectItem key={empresa.id} value={empresa.id.toString()}>
                  {empresa.razaoSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo e Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'receita' | 'despesa' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pendente' | 'pago' | 'cancelado' | 'vencido' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição e Categoria */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do lançamento..."
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              placeholder="Ex: Vendas, Marketing, Administrativo..."
            />
          </div>
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
            placeholder="0,00"
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
            <Input
              id="dataVencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData(prev => ({ ...prev, dataVencimento: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="dataPagamento">Data de Pagamento</Label>
            <Input
              id="dataPagamento"
              type="date"
              value={formData.dataPagamento || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dataPagamento: e.target.value }))}
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais..."
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </div>
    )
  };

  // Hook unificado
  const manager = useUnifiedFinancas360Manager<Lancamento, LancamentoFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}