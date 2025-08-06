// Estrutura DRE Manager refatorado - Seguindo princípios SOLID e DRY
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Hash, ChevronRight, ChevronDown } from 'lucide-react';
import { BaseManager, useFormState, CardActions, StatusBadge, FormActions } from './common/BaseManager';
import { useEstruturaDRE } from '@/hooks/useFinancas360Api';
import type { EstruturaDRE, EstruturaDREInsert } from '@/types/financas360';

// Estado inicial do formulário
const initialFormState: EstruturaDREInsert = {
  codigo: '',
  nome: '',
  tipo: 'receita',
  nivel: 1,
  contaPaiId: undefined,
  formula: '',
  ordem: 1,
  ativa: true,
  observacoes: ''
};

export default function EstruturaDREManager() {
  const api = useEstruturaDRE();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Adaptadores para compatibilidade de tipos
  const handleCreate = (data: EstruturaDREInsert) => {
    api.create(data);
  };

  const handleUpdate = (id: number, data: Partial<EstruturaDREInsert>) => {
    api.update({ id, data });
  };

  const handleDelete = (id: number) => {
    api.remove(id);
  };

  // Organizar estruturas em árvore
  const organizarEstrutura = (estruturas: EstruturaDRE[]): EstruturaDRE[] => {
    const estruturasMap = new Map<number, EstruturaDRE>();
    const raizes: EstruturaDRE[] = [];

    // Criar map de todas as estruturas
    estruturas.forEach(estrutura => {
      estruturasMap.set(estrutura.id, { ...estrutura, subContas: [] });
    });

    // Organizar hierarquia
    estruturas.forEach(estrutura => {
      const estruturaCompleta = estruturasMap.get(estrutura.id)!;
      
      if (estrutura.contaPai) {
        const pai = estruturasMap.get(estrutura.contaPai.id);
        if (pai) {
          pai.subContas.push(estruturaCompleta);
        }
      } else {
        raizes.push(estruturaCompleta);
      }
    });

    // Ordenar por ordem
    const ordenar = (estruts: EstruturaDRE[]) => {
      estruts.sort((a, b) => a.ordem - b.ordem);
      estruts.forEach(estrutura => {
        if (estrutura.subContas.length > 0) {
          ordenar(estrutura.subContas);
        }
      });
    };

    ordenar(raizes);
    return raizes;
  };

  const estruturasOrganizadas = organizarEstrutura(api.data);

  // Função para renderizar o formulário
  const renderForm = (editingItem: EstruturaDRE | null, onSubmit: (data: EstruturaDREInsert) => void, onClose: () => void) => {
    return (
      <EstruturaDREForm 
        editingItem={editingItem} 
        onSubmit={onSubmit} 
        onClose={onClose}
        estruturas={estruturasOrganizadas}
      />
    );
  };

  // Função para renderizar a lista
  const renderList = (items: EstruturaDRE[], onEdit: (item: EstruturaDRE) => void, onDelete: (id: number) => void) => {
    const estruturasOrganizadasLocal = organizarEstrutura(items);
    return (
      <div className="space-y-2">
        {estruturasOrganizadasLocal.map(estrutura => (
          <EstruturaDREItem
            key={estrutura.id}
            estrutura={estrutura}
            expandedItems={expandedItems}
            onToggleExpanded={(id) => {
              const newExpanded = new Set(expandedItems);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setExpandedItems(newExpanded);
            }}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={api.isDeleting}
            level={0}
          />
        ))}
      </div>
    );
  };

  // Ações adicionais
  const additionalActions = (
    <>
      <Button
        variant="outline"
        onClick={() => setExpandedItems(new Set(api.data.map(e => e.id)))}
      >
        Expandir Tudo
      </Button>
      <Button
        variant="outline"
        onClick={() => setExpandedItems(new Set())}
      >
        Recolher Tudo
      </Button>
    </>
  );

  return (
    <BaseManager
      title="Estrutura DRE"
      icon={<Hash className="h-6 w-6 text-blue-600" />}
      entityName="Estrutura DRE"
      data={api.data}
      isLoading={api.isLoading}
      error={api.error}
      isCreating={api.isCreating}
      isUpdating={api.isUpdating}
      isDeleting={api.isDeleting}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRefetch={api.refetch}
      renderForm={renderForm}
      renderList={renderList}
      searchFields={['nome', 'codigo']}
      additionalActions={additionalActions}
    />
  );
}

// Componente do formulário
interface EstruturaDREFormProps {
  editingItem: EstruturaDRE | null;
  onSubmit: (data: EstruturaDREInsert) => void;
  onClose: () => void;
  estruturas: EstruturaDRE[];
}

function EstruturaDREForm({ editingItem, onSubmit, onClose, estruturas }: EstruturaDREFormProps) {
  const { formData, updateField, resetForm } = useFormState<EstruturaDREInsert>(
    editingItem ? {
      codigo: editingItem.codigo,
      nome: editingItem.nome,
      tipo: editingItem.tipo,
      nivel: editingItem.nivel,
      contaPaiId: editingItem.contaPai?.id,
      formula: editingItem.formula || '',
      ordem: editingItem.ordem,
      ativa: editingItem.ativa,
      observacoes: editingItem.observacoes || ''
    } : initialFormState
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  // Obter contas pai possíveis (exclui a própria conta sendo editada)
  const getContasPai = (estruts: EstruturaDRE[], excludeId?: number): EstruturaDRE[] => {
    const contas: EstruturaDRE[] = [];
    
    const processar = (estruturas: EstruturaDRE[]) => {
      estruturas.forEach(estrut => {
        if (!excludeId || estrut.id !== excludeId) {
          contas.push(estrut);
          processar(estrut.subContas);
        }
      });
    };
    
    processar(estruts);
    return contas;
  };

  const contasPai = getContasPai(estruturas, editingItem?.id);

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      receita: 'Receita',
      custo: 'Custo',
      despesa: 'Despesa',
      resultado: 'Resultado'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => updateField('codigo', e.target.value)}
            placeholder="Ex: 1.1.01"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nivel">Nível *</Label>
          <Input
            id="nivel"
            type="number"
            min="1"
            max="10"
            value={formData.nivel}
            onChange={(e) => updateField('nivel', parseInt(e.target.value) || 1)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ordem">Ordem *</Label>
          <Input
            id="ordem"
            type="number"
            min="1"
            value={formData.ordem}
            onChange={(e) => updateField('ordem', parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => updateField('nome', e.target.value)}
          placeholder="Ex: Receitas de Vendas"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: 'receita' | 'custo' | 'despesa' | 'resultado') => 
              updateField('tipo', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">{getTipoLabel('receita')}</SelectItem>
              <SelectItem value="custo">{getTipoLabel('custo')}</SelectItem>
              <SelectItem value="despesa">{getTipoLabel('despesa')}</SelectItem>
              <SelectItem value="resultado">{getTipoLabel('resultado')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contaPai">Conta Pai</Label>
          <Select
            value={formData.contaPaiId?.toString() || ""}
            onValueChange={(value) => updateField('contaPaiId', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta pai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma (Conta raiz)</SelectItem>
              {contasPai.map(conta => (
                <SelectItem key={conta.id} value={conta.id.toString()}>
                  {conta.codigo} - {conta.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="formula">Fórmula</Label>
        <Input
          id="formula"
          value={formData.formula}
          onChange={(e) => updateField('formula', e.target.value)}
          placeholder="Ex: 1.1.01 + 1.1.02"
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Input
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => updateField('observacoes', e.target.value)}
          placeholder="Observações adicionais"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativa"
          checked={formData.ativa}
          onChange={(e) => updateField('ativa', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <Label htmlFor="ativa">Conta ativa</Label>
      </div>

      <FormActions
        onCancel={onClose}
        onSubmit={() => handleSubmit({} as React.FormEvent<HTMLFormElement>)}
        isSubmitting={false}
      />
    </form>
  );
}

// Componente do item da estrutura DRE
interface EstruturaDREItemProps {
  estrutura: EstruturaDRE;
  expandedItems: Set<number>;
  onToggleExpanded: (id: number) => void;
  onEdit: (item: EstruturaDRE) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  level: number;
}

function EstruturaDREItem({ 
  estrutura, 
  expandedItems, 
  onToggleExpanded, 
  onEdit, 
  onDelete, 
  isDeleting, 
  level 
}: EstruturaDREItemProps) {
  const getTipoColor = (tipo: string) => {
    const colors = {
      receita: 'bg-green-100 text-green-800',
      custo: 'bg-red-100 text-red-800',
      despesa: 'bg-orange-100 text-orange-800',
      resultado: 'bg-blue-100 text-blue-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      receita: 'Receita',
      custo: 'Custo',
      despesa: 'Despesa',
      resultado: 'Resultado'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  return (
    <div>
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div style={{ marginLeft: `${level * 20}px` }}>
                {estrutura.subContas.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpanded(estrutura.id)}
                    className="p-1 h-6 w-6"
                  >
                    {expandedItems.has(estrutura.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {estrutura.subContas.length === 0 && (
                  <div className="w-6" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {estrutura.codigo}
                  </span>
                  <h3 className="font-semibold">{estrutura.nome}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(estrutura.tipo)}`}>
                    {getTipoLabel(estrutura.tipo)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Nível {estrutura.nivel}
                  </span>
                </div>
                
                {estrutura.formula && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Fórmula:</span> {estrutura.formula}
                  </div>
                )}
                
                {estrutura.observacoes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Obs:</span> {estrutura.observacoes}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 items-center">
              <StatusBadge 
                isActive={estrutura.ativa} 
                activeText="Ativa" 
                inactiveText="Inativa" 
              />
              
              <CardActions
                onEdit={() => onEdit(estrutura)}
                onDelete={() => onDelete(estrutura.id)}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {expandedItems.has(estrutura.id) && estrutura.subContas.length > 0 && (
        <div className="ml-4">
          {estrutura.subContas.map(subConta => (
            <EstruturaDREItem
              key={subConta.id}
              estrutura={subConta}
              expandedItems={expandedItems}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}