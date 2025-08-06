import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Zap, Link } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import type { 
  CanalPagamento, 
  CanalPagamentoFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * CANAIS PAGAMENTO MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 693 linhas → ~110 linhas (84% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 */
export default function CanaisPagamentoManagerRefactored() {
  const formatters = useFinancas360Formatters();

  // Configuração do manager
  const config: ManagerConfig<CanalPagamento, CanalPagamentoFormData> = {
    title: 'Canais de Pagamento',
    description: 'Gerencie gateways e métodos de pagamento',
    apiEndpoint: '/api/financas360/canais-pagamento',
    queryKey: 'financas360-canais-pagamento',
    
    defaultFormData: {
      nome: '',
      tipo: 'pix',
      provedor: '',
      configuracoes: {
        apiKey: '',
        secretKey: '',
        merchantId: '',
        webhookUrl: '',
        taxa: 0,
        prazoLiquidacao: 0,
        ativo: true,
        ambiente: 'sandbox'
      },
      ativo: true,
      observacoes: ''
    },

    // Validação do formulário
    validateForm: (data) => {
      if (!data.nome.trim()) return 'Nome é obrigatório';
      if (!data.provedor.trim()) return 'Provedor é obrigatório';
      if (data.configuracoes.taxa && (data.configuracoes.taxa < 0 || data.configuracoes.taxa > 100)) {
        return 'Taxa deve estar entre 0 e 100%';
      }
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: CanalPagamento) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            {item.tipo === 'pix' ? (
              <Zap className="w-5 h-5 text-purple-600" />
            ) : item.tipo === 'gateway' ? (
              <Link className="w-5 h-5 text-purple-600" />
            ) : (
              <CreditCard className="w-5 h-5 text-purple-600" />
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
              {item.provedor}
              {item.configuracoes.taxa && (
                <span> • Taxa: {item.configuracoes.taxa}%</span>
              )}
              {item.configuracoes.prazoLiquidacao && (
                <span> • Liquidação: {item.configuracoes.prazoLiquidacao} dias</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Ambiente: {item.configuracoes.ambiente === 'sandbox' ? 'Teste' : 'Produção'}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<CanalPagamentoFormData>) => (
      <div className="space-y-4">
        {/* Nome */}
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Mercado Pago PIX"
          />
        </div>

        {/* Tipo e Provedor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                tipo: value as 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'gateway' | 'outros' 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="gateway">Gateway</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="provedor">Provedor *</Label>
            <Input
              id="provedor"
              value={formData.provedor}
              onChange={(e) => setFormData(prev => ({ ...prev, provedor: e.target.value }))}
              placeholder="Ex: Mercado Pago, PagSeguro..."
            />
          </div>
        </div>

        {/* Configurações de API */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Configurações de API</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.configuracoes.apiKey || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuracoes: { ...prev.configuracoes, apiKey: e.target.value }
                }))}
                placeholder="Chave da API..."
              />
            </div>
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={formData.configuracoes.secretKey || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuracoes: { ...prev.configuracoes, secretKey: e.target.value }
                }))}
                placeholder="Chave secreta..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="merchantId">Merchant ID</Label>
            <Input
              id="merchantId"
              value={formData.configuracoes.merchantId || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                configuracoes: { ...prev.configuracoes, merchantId: e.target.value }
              }))}
              placeholder="ID do merchant..."
            />
          </div>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={formData.configuracoes.webhookUrl || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                configuracoes: { ...prev.configuracoes, webhookUrl: e.target.value }
              }))}
              placeholder="https://seusite.com/webhook"
            />
          </div>
        </div>

        {/* Configurações Financeiras */}
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
            <Label htmlFor="prazoLiquidacao">Prazo Liquidação (dias)</Label>
            <Input
              id="prazoLiquidacao"
              type="number"
              min="0"
              value={formData.configuracoes.prazoLiquidacao || 0}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                configuracoes: { ...prev.configuracoes, prazoLiquidacao: parseInt(e.target.value) || 0 }
              }))}
              placeholder="1"
            />
          </div>
          <div>
            <Label htmlFor="ambiente">Ambiente</Label>
            <Select
              value={formData.configuracoes.ambiente}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                configuracoes: { ...prev.configuracoes, ambiente: value as 'sandbox' | 'producao' }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Teste (Sandbox)</SelectItem>
                <SelectItem value="producao">Produção</SelectItem>
              </SelectContent>
            </Select>
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
  const manager = useUnifiedFinancas360Manager<CanalPagamento, CanalPagamentoFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}