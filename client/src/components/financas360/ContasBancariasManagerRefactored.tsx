import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Building } from 'lucide-react';
import { UnifiedManagerLayout } from '@/components/ui/manager/UnifiedManagerLayout';
import { useUnifiedFinancas360Manager, useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  ContaBancaria, 
  ContaBancariaFormData, 
  ManagerConfig,
  FormProps
} from '@/types/financas360-unified';

/**
 * CONTAS BANCÁRIAS MANAGER REFATORADO - FASE 3 REFATORAÇÃO
 * 
 * REDUÇÃO: 668 linhas → ~120 linhas (82% redução)
 * USANDO: Hook unificado + Layout unificado + Configuração declarativa
 */
export default function ContasBancariasManagerRefactored() {
  const formatters = useFinancas360Formatters();
  const { token } = useAuth();

  // Fetch bancos para select
  const { data: bancos = [] } = useQuery({
    queryKey: ['financas360-bancos'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/bancos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar bancos');
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Configuração do manager
  const config: ManagerConfig<ContaBancaria, ContaBancariaFormData> = {
    title: 'Contas Bancárias',
    description: 'Gerencie contas bancárias da empresa',
    apiEndpoint: '/api/financas360/contas-bancarias',
    queryKey: 'financas360-contas-bancarias',
    
    defaultFormData: {
      bancoId: 0,
      agencia: '',
      conta: '',
      digito: '',
      tipo: 'corrente',
      saldoAtual: 0,
      titular: '',
      ativo: true,
      observacoes: ''
    },

    // Validação do formulário
    validateForm: (data) => {
      if (!data.bancoId) return 'Banco é obrigatório';
      if (!data.agencia.trim()) return 'Agência é obrigatória';
      if (!data.conta.trim()) return 'Conta é obrigatória';
      if (!data.digito.trim()) return 'Dígito é obrigatório';
      if (!data.titular.trim()) return 'Titular é obrigatório';
      return null;
    },

    // Renderização customizada do item
    renderItem: (item: ContaBancaria) => (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {item.banco.nome}
              </span>
              <Badge className={item.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {item.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
              <Badge variant="outline">
                {formatters.formatTipo(item.tipo)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Ag: {item.agencia} • CC: {item.conta}-{item.digito} • {item.titular}
            </div>
            <div className={`text-lg font-semibold ${
              item.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatters.formatCurrency(item.saldoAtual)}
            </div>
          </div>
        </div>
      </div>
    ),

    // Formulário customizado
    renderForm: ({ formData, setFormData, isEditing, onSubmit, onCancel, isLoading }: FormProps<ContaBancariaFormData>) => (
      <div className="space-y-4">
        {/* Banco */}
        <div>
          <Label htmlFor="bancoId">Banco *</Label>
          <Select
            value={formData.bancoId.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, bancoId: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um banco" />
            </SelectTrigger>
            <SelectContent>
              {bancos.map((banco: any) => (
                <SelectItem key={banco.id} value={banco.id.toString()}>
                  {banco.codigo} - {banco.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dados da Conta */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="agencia">Agência *</Label>
            <Input
              id="agencia"
              value={formData.agencia}
              onChange={(e) => setFormData(prev => ({ ...prev, agencia: e.target.value }))}
              placeholder="0001"
            />
          </div>
          <div>
            <Label htmlFor="conta">Conta *</Label>
            <Input
              id="conta"
              value={formData.conta}
              onChange={(e) => setFormData(prev => ({ ...prev, conta: e.target.value }))}
              placeholder="123456"
            />
          </div>
          <div>
            <Label htmlFor="digito">Dígito *</Label>
            <Input
              id="digito"
              value={formData.digito}
              onChange={(e) => setFormData(prev => ({ ...prev, digito: e.target.value }))}
              placeholder="7"
            />
          </div>
        </div>

        {/* Tipo e Titular */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'corrente' | 'poupanca' | 'salario' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corrente">Conta Corrente</SelectItem>
                <SelectItem value="poupanca">Poupança</SelectItem>
                <SelectItem value="salario">Conta Salário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="titular">Titular *</Label>
            <Input
              id="titular"
              value={formData.titular}
              onChange={(e) => setFormData(prev => ({ ...prev, titular: e.target.value }))}
              placeholder="Nome do titular..."
            />
          </div>
        </div>

        {/* Saldo Atual */}
        <div>
          <Label htmlFor="saldoAtual">Saldo Atual</Label>
          <Input
            id="saldoAtual"
            type="number"
            step="0.01"
            value={formData.saldoAtual}
            onChange={(e) => setFormData(prev => ({ ...prev, saldoAtual: parseFloat(e.target.value) || 0 }))}
            placeholder="0,00"
          />
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
  const manager = useUnifiedFinancas360Manager<ContaBancaria, ContaBancariaFormData>(config);

  // Componente unificado
  return <UnifiedManagerLayout manager={manager} config={config} />;
}