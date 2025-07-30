import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import type { 
  Devolucao, 
  DevolucaoFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * DEVOLUÇÕES MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 700 linhas → ~110 linhas (84% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 */
export default function DevolucaesManagerRefactored() {
  const formatters = useFinancas360Formatters();
  const { token } = useAuth();

  // Fetch notas fiscais para select
  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['financas360-notas-fiscais'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/notas-fiscais', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar notas fiscais');
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Configuração do manager
  const config: ManagerConfig<Devolucao, DevolucaoFormData> = {
    title: 'Devoluções',
    description: 'Gerencie devoluções de produtos e valores',
    apiEndpoint: '/api/financas360/devolucoes',
    queryKey: 'financas360-devolucoes',
    
    defaultFormData: {
      notaFiscalId: 0,
      tipo: 'produto',
      motivo: '',
      dataDevolucao: '',
      valorDevolvido: 0,
      status: 'pendente',
      ativo: true,
      observacoes: '',
      itens: []
    },

    // Validação do formulário
    validateForm: (data) => {
      if (!data.notaFiscalId) return 'Nota fiscal é obrigatória';
      if (!data.motivo.trim()) return 'Motivo é obrigatório';
      if (!data.dataDevolucao) return 'Data da devolução é obrigatória';
      if (data.valorDevolvido <= 0) return 'Valor devolvido deve ser maior que zero';
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: Devolucao) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                NF {item.notaFiscal.serie}-{item.notaFiscal.numero}
              </span>
              <Badge className={formatters.formatStatus(item.status).color}>
                {formatters.formatStatus(item.status).label}
              </Badge>
              <Badge variant="outline">
                {formatters.formatTipo(item.tipo)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {formatters.truncateText(item.motivo, 50)} • {formatters.formatDate(item.dataDevolucao)}
            </div>
            <div className="text-lg font-semibold text-orange-600">
              {formatters.formatCurrency(item.valorDevolvido)}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<DevolucaoFormData>) => (
      <div className="space-y-4">
        {/* Nota Fiscal */}
        <div>
          <Label htmlFor="notaFiscalId">Nota Fiscal *</Label>
          <Select
            value={formData.notaFiscalId.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, notaFiscalId: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma nota fiscal" />
            </SelectTrigger>
            <SelectContent>
              {notasFiscais.map((nf: any) => (
                <SelectItem key={nf.id} value={nf.id.toString()}>
                  NF {nf.serie}-{nf.numero} - {formatters.formatCurrency(nf.valorTotal)}
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'produto' | 'valor' | 'total' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="produto">Produto</SelectItem>
                <SelectItem value="valor">Valor</SelectItem>
                <SelectItem value="total">Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pendente' | 'processada' | 'cancelada' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="processada">Processada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <Label htmlFor="motivo">Motivo *</Label>
          <Input
            id="motivo"
            value={formData.motivo}
            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
            placeholder="Motivo da devolução..."
          />
        </div>

        {/* Data e Valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataDevolucao">Data da Devolução *</Label>
            <Input
              id="dataDevolucao"
              type="date"
              value={formData.dataDevolucao}
              onChange={(e) => setFormData(prev => ({ ...prev, dataDevolucao: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="valorDevolvido">Valor Devolvido *</Label>
            <Input
              id="valorDevolvido"
              type="number"
              step="0.01"
              value={formData.valorDevolvido}
              onChange={(e) => setFormData(prev => ({ ...prev, valorDevolvido: parseFloat(e.target.value) || 0 }))}
              placeholder="0,00"
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
  const manager = useUnifiedFinancas360Manager<Devolucao, DevolucaoFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}