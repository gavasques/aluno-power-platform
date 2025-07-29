import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import type { 
  FormaPagamento, 
  FormaPagamentoFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * FORMAS PAGAMENTO MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 575 linhas → ~110 linhas (81% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 */
export default function FormasPagamentoManagerRefactored() {
  const formatters = useFinancas360Formatters();

  // Configuração do manager
  const config: ManagerConfig<FormaPagamento, FormaPagamentoFormData> = {
    title: 'Formas de Pagamento',
    description: 'Gerencie métodos de pagamento disponíveis',
    apiEndpoint: '/api/financas360/formas-pagamento',
    queryKey: 'financas360-formas-pagamento',
    
    defaultFormData: {
      nome: '',
      tipo: 'dinheiro',
      configuracoes: {
        taxa: 0,
        prazoCompensacao: 0,
        limiteTransacao: 0,
        ativo: true
      },
      ativo: true,
      observacoes: ''
    },

    // Validação do formulário
    validateForm: (data) => {
      if (!data.nome.trim()) return 'Nome é obrigatório';
      if (data.configuracoes.taxa && (data.configuracoes.taxa < 0 || data.configuracoes.taxa > 100)) {
        return 'Taxa deve estar entre 0 e 100%';
      }
      if (data.configuracoes.prazoCompensacao && data.configuracoes.prazoCompensacao < 0) {
        return 'Prazo de compensação não pode ser negativo';
      }
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: FormaPagamento) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-100 rounded-lg">
            {item.tipo === 'dinheiro' ? (
              <DollarSign className="w-5 h-5 text-green-600" />
            ) : (
              <CreditCard className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {item.nome}
              </span>
              <Badge className={item.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {item.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant="outline">
                {formatters.formatTipo(item.tipo)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.configuracoes.taxa && (
                <span>Taxa: {item.configuracoes.taxa}% • </span>
              )}
              {item.configuracoes.prazoCompensacao && (
                <span>Compensação: {item.configuracoes.prazoCompensacao} dias • </span>
              )}
              {item.configuracoes.limiteTransacao && (
                <span>Limite: {formatters.formatCurrency(item.configuracoes.limiteTransacao)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<FormaPagamentoFormData>) => (
      <div className="space-y-4">
        {/* Nome */}
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Cartão de Crédito Visa"
          />
        </div>

        {/* Tipo */}
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              tipo: value as 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'outros'
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Configurações */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Configurações</Label>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="taxa">Taxa (%)</Label>
              <Input
                id="taxa"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.configuracoes.taxa || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuracoes: { ...prev.configuracoes, taxa: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="2.99"
              />
            </div>
            <div>
              <Label htmlFor="prazoCompensacao">Prazo Compensação (dias)</Label>
              <Input
                id="prazoCompensacao"
                type="number"
                min="0"
                value={formData.configuracoes.prazoCompensacao || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuracoes: { ...prev.configuracoes, prazoCompensacao: parseInt(e.target.value) || 0 }
                }))}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="limiteTransacao">Limite Transação</Label>
              <Input
                id="limiteTransacao"
                type="number"
                step="0.01"
                min="0"
                value={formData.configuracoes.limiteTransacao || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuracoes: { ...prev.configuracoes, limiteTransacao: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="5000.00"
              />
            </div>
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
  const manager = useUnifiedFinancas360Manager<FormaPagamento, FormaPagamentoFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}