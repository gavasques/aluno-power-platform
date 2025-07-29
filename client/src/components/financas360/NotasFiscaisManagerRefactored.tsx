import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Receipt, DollarSign } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  NotaFiscal, 
  NotaFiscalFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * NOTAS FISCAIS MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 810 linhas → ~120 linhas (85% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 * 
 * FUNCIONALIDADES PRESERVADAS:
 * - CRUD completo de notas fiscais
 * - Filtros por tipo e status
 * - Formatação de valores
 * - Validação de formulários
 * - Integração com empresas
 */
export default function NotasFiscaisManagerRefactored() {
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
  const config: ManagerConfig<NotaFiscal, NotaFiscalFormData> = {
    title: 'Notas Fiscais',
    description: 'Gerencie notas fiscais de entrada e saída',
    apiEndpoint: '/api/financas360/notas-fiscais',
    queryKey: 'financas360-notas-fiscais',
    
    defaultFormData: {
      empresaId: 0,
      serie: '',
      numero: '',
      dataEmissao: '',
      valorTotal: 0,
      status: 'emitida',
      tipo: 'entrada',
      ativo: true,
      observacoes: ''
    },

    // Configuração de colunas
    columns: [
      { key: 'serie', label: 'Série', sortable: true },
      { key: 'numero', label: 'Número', sortable: true },
      { key: 'tipo', label: 'Tipo', filterable: true },
      { key: 'status', label: 'Status', filterable: true },
      { key: 'valorTotal', label: 'Valor Total' },
      { key: 'dataEmissao', label: 'Data Emissão', sortable: true }
    ],

    // Filtros disponíveis
    filters: [
      {
        key: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: [
          { value: 'entrada', label: 'Entrada' },
          { value: 'saida', label: 'Saída' }
        ]
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'emitida', label: 'Emitida' },
          { value: 'enviada', label: 'Enviada' },
          { value: 'cancelada', label: 'Cancelada' }
        ]
      }
    ],

    // Validação do formulário
    validateForm: (data) => {
      if (!data.empresaId) return 'Empresa é obrigatória';
      if (!data.serie.trim()) return 'Série é obrigatória';
      if (!data.numero.trim()) return 'Número é obrigatório';
      if (!data.dataEmissao) return 'Data de emissão é obrigatória';
      if (data.valorTotal <= 0) return 'Valor total deve ser maior que zero';
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: NotaFiscal) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                NF {item.serie}-{item.numero}
              </span>
              <Badge className={formatters.formatStatus(item.status).color}>
                {formatters.formatStatus(item.status).label}
              </Badge>
              <Badge variant="outline">
                {formatters.formatTipo(item.tipo)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.empresa.razaoSocial} • {formatters.formatDate(item.dataEmissao)}
            </div>
            <div className="text-lg font-semibold text-green-600">
              {formatters.formatCurrency(item.valorTotal)}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<NotaFiscalFormData>) => (
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

        {/* Série e Número */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serie">Série *</Label>
            <Input
              id="serie"
              value={formData.serie}
              onChange={(e) => setFormData(prev => ({ ...prev, serie: e.target.value }))}
              placeholder="Ex: 001"
            />
          </div>
          <div>
            <Label htmlFor="numero">Número *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
              placeholder="Ex: 123456"
            />
          </div>
        </div>

        {/* Tipo e Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'entrada' | 'saida' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'emitida' | 'enviada' | 'cancelada' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emitida">Emitida</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data e Valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataEmissao">Data de Emissão *</Label>
            <Input
              id="dataEmissao"
              type="date"
              value={formData.dataEmissao}
              onChange={(e) => setFormData(prev => ({ ...prev, dataEmissao: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="valorTotal">Valor Total *</Label>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              value={formData.valorTotal}
              onChange={(e) => setFormData(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
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
  const manager = useUnifiedFinancas360Manager<NotaFiscal, NotaFiscalFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}