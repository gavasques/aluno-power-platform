import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Supplier, Department } from '@shared/schema';

interface SupplierInfoDisplayProps {
  supplier: Supplier;
}

export const SupplierInfoDisplay: React.FC<SupplierInfoDisplayProps> = ({ supplier }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados de edição para cada seção
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAdditionalInfo, setEditingAdditionalInfo] = useState(false);
  const [editingCommercialTerms, setEditingCommercialTerms] = useState(false);
  const [editingBankingData, setEditingBankingData] = useState(false);
  
  // Estados dos formulários
  const [basicForm, setBasicForm] = useState({
    tradeName: supplier.tradeName || '',
    corporateName: supplier.corporateName || '',
    cnpj: supplier.cnpj || '',
    categoryId: supplier.categoryId || null,
    supplierType: supplier.supplierType || '',
    country: supplier.country || '',
    state: supplier.state || '',
    city: supplier.city || '',
    cep: supplier.cep || '',
    address: supplier.address || '',
    stateRegistration: supplier.stateRegistration || '',
    municipalRegistration: supplier.municipalRegistration || ''
  });
  
  const [descriptionForm, setDescriptionForm] = useState({
    description: supplier.description || ''
  });
  
  const [additionalInfoForm, setAdditionalInfoForm] = useState({
    additionalInfo: supplier.additionalInfo || ''
  });
  
  const [commercialTermsForm, setCommercialTermsForm] = useState({
    paymentTerm: supplier.paymentTerm || '',
    deliveryTerm: supplier.deliveryTerm || ''
  });
  
  const [bankingDataForm, setBankingDataForm] = useState({
    bankingData: supplier.bankingData || ''
  });

  const COUNTRIES = [
    'Brasil', 'China', 'Taiwan', 'Hong Kong', 'Índia', 
    'Turquia', 'Argentina', 'Paraguai', 'Outro'
  ];

  const SUPPLIER_TYPES = [
    'distribuidora', 'importadora', 'fabricante', 'indústria', 'representante'
  ];
  // Carregar departamentos para exibir o nome da categoria
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    const department = departments.find(d => d.id === categoryId);
    return department?.name || null;
  };

  // Mutation para atualizar fornecedor
  const updateSupplierMutation = useMutation({
    mutationFn: async (updateData: Partial<Supplier>) => {
      return apiRequest(`/api/suppliers/${supplier.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplier.id}`] });
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    },
  });

  // Handlers para salvar cada seção
  const handleSaveBasic = async () => {
    await updateSupplierMutation.mutateAsync(basicForm);
    setEditingBasic(false);
  };

  const handleSaveDescription = async () => {
    await updateSupplierMutation.mutateAsync(descriptionForm);
    setEditingDescription(false);
  };

  const handleSaveAdditionalInfo = async () => {
    await updateSupplierMutation.mutateAsync(additionalInfoForm);
    setEditingAdditionalInfo(false);
  };

  const handleSaveCommercialTerms = async () => {
    await updateSupplierMutation.mutateAsync(commercialTermsForm);
    setEditingCommercialTerms(false);
  };

  const handleSaveBankingData = async () => {
    await updateSupplierMutation.mutateAsync(bankingDataForm);
    setEditingBankingData(false);
  };

  // Handlers para cancelar edição
  const handleCancelBasic = () => {
    setBasicForm({
      tradeName: supplier.tradeName || '',
      corporateName: supplier.corporateName || '',
      cnpj: supplier.cnpj || '',
      categoryId: supplier.categoryId || null,
      supplierType: supplier.supplierType || '',
      country: supplier.country || '',
      state: supplier.state || '',
      city: supplier.city || '',
      cep: supplier.cep || '',
      address: supplier.address || '',
      stateRegistration: supplier.stateRegistration || '',
      municipalRegistration: supplier.municipalRegistration || ''
    });
    setEditingBasic(false);
  };

  const handleCancelDescription = () => {
    setDescriptionForm({ description: supplier.description || '' });
    setEditingDescription(false);
  };

  const handleCancelAdditionalInfo = () => {
    setAdditionalInfoForm({ additionalInfo: supplier.additionalInfo || '' });
    setEditingAdditionalInfo(false);
  };

  const handleCancelCommercialTerms = () => {
    setCommercialTermsForm({
      paymentTerm: supplier.paymentTerm || '',
      deliveryTerm: supplier.deliveryTerm || ''
    });
    setEditingCommercialTerms(false);
  };

  const handleCancelBankingData = () => {
    setBankingDataForm({ bankingData: supplier.bankingData || '' });
    setEditingBankingData(false);
  };

  return (
    <div className="space-y-8">
      {/* Seção 1: Informações Básicas + Inscrições + Localização */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Informações Básicas + Inscrições + Localização
          </h4>
          {!editingBasic ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingBasic(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelBasic}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBasic}
                disabled={updateSupplierMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        {editingBasic ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Informações Básicas</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                  <Input
                    value={basicForm.tradeName}
                    onChange={(e) => setBasicForm({ ...basicForm, tradeName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                  <Input
                    value={basicForm.corporateName}
                    onChange={(e) => setBasicForm({ ...basicForm, corporateName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <Input
                    value={basicForm.cnpj}
                    onChange={(e) => setBasicForm({ ...basicForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Principal</label>
                  <Select 
                    value={basicForm.categoryId ? String(basicForm.categoryId) : ""} 
                    onValueChange={(value) => setBasicForm({ ...basicForm, categoryId: value ? Number(value) : null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Fornecedor</label>
                  <Select 
                    value={basicForm.supplierType} 
                    onValueChange={(value) => setBasicForm({ ...basicForm, supplierType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h5 className="font-medium text-gray-900 mt-6">Inscrições</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                  <Input
                    value={basicForm.stateRegistration}
                    onChange={(e) => setBasicForm({ ...basicForm, stateRegistration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                  <Input
                    value={basicForm.municipalRegistration}
                    onChange={(e) => setBasicForm({ ...basicForm, municipalRegistration: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-4">Localização</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <Select 
                    value={basicForm.country} 
                    onValueChange={(value) => setBasicForm({ ...basicForm, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <Input
                      value={basicForm.state}
                      onChange={(e) => setBasicForm({ ...basicForm, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <Input
                      value={basicForm.city}
                      onChange={(e) => setBasicForm({ ...basicForm, city: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <Input
                    value={basicForm.cep}
                    onChange={(e) => setBasicForm({ ...basicForm, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <Input
                    value={basicForm.address}
                    onChange={(e) => setBasicForm({ ...basicForm, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-3">Informações Básicas</h5>
                <div className="space-y-3">
                  <InfoRow label="Nome Fantasia" value={supplier.tradeName} />
                  <InfoRow label="Razão Social" value={supplier.corporateName} />
                  <InfoRow label="CNPJ" value={supplier.cnpj || "Não informado"} />
                  <InfoRow label="Categoria Principal" value={getCategoryName(supplier.categoryId) || "Não informado"} />
                  <InfoRow label="Tipo" value={supplier.supplierType || "Não informado"} className="capitalize" />
                </div>
              </div>
              
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-3">Inscrições</h5>
                <div className="space-y-3">
                  <InfoRow label="Inscrição Estadual" value={supplier.stateRegistration || "Não informado"} />
                  <InfoRow label="Inscrição Municipal" value={supplier.municipalRegistration || "Não informado"} />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-md font-medium text-gray-900 mb-3">Localização</h5>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">País:</span>
                    <span className="text-gray-900">{supplier.country || "Não informado"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">Estado:</span>
                    <span className="text-gray-900">{supplier.state || "Não informado"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">Cidade:</span>
                    <span className="text-gray-900">{supplier.city || "Não informado"}</span>
                  </div>
                </div>
                <InfoRow label="CEP" value={supplier.cep || "Não informado"} />
                {supplier.address ? (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">Endereço:</span>
                    <span className="text-gray-900 p-3 bg-gray-50 rounded border text-sm">
                      {supplier.address}
                    </span>
                  </div>
                ) : (
                  <InfoRow label="Endereço" value="Não informado" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção 2: Descrição */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Descrição
          </h4>
          {!editingDescription ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingDescription(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelDescription}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveDescription}
                disabled={updateSupplierMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        {editingDescription ? (
          <div className="p-4 bg-blue-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <Textarea
              value={descriptionForm.description}
              onChange={(e) => setDescriptionForm({ description: e.target.value })}
              placeholder="Descrição detalhada do fornecedor, produtos e serviços"
              rows={4}
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-gray-700 leading-relaxed">
              {supplier.description || "Nenhuma descrição fornecida"}
            </p>
          </div>
        )}
      </div>

      {/* Seção 3: Informações Adicionais */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Informações Adicionais
          </h4>
          {!editingAdditionalInfo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingAdditionalInfo(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelAdditionalInfo}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAdditionalInfo}
                disabled={updateSupplierMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        {editingAdditionalInfo ? (
          <div className="p-4 bg-blue-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Informações Adicionais</label>
            <Textarea
              value={additionalInfoForm.additionalInfo}
              onChange={(e) => setAdditionalInfoForm({ additionalInfo: e.target.value })}
              placeholder="Informações adicionais livres sobre o fornecedor (observações, histórico, notas especiais, etc.)"
              rows={4}
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-gray-700 leading-relaxed">
              {supplier.additionalInfo || "Nenhuma informação adicional fornecida"}
            </p>
          </div>
        )}
      </div>

      {/* Seção 4 e 5: Termos Comerciais + Dados Bancários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Termos Comerciais */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Termos Comerciais
            </h4>
            {!editingCommercialTerms ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingCommercialTerms(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCommercialTerms}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveCommercialTerms}
                  disabled={updateSupplierMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            )}
          </div>

          {editingCommercialTerms ? (
            <div className="p-4 bg-blue-50 rounded-lg border space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Pagamento</label>
                <Input
                  value={commercialTermsForm.paymentTerm}
                  onChange={(e) => setCommercialTermsForm({ ...commercialTermsForm, paymentTerm: e.target.value })}
                  placeholder="Ex: 30 dias, À vista, 15/30 dias"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega</label>
                <Input
                  value={commercialTermsForm.deliveryTerm}
                  onChange={(e) => setCommercialTermsForm({ ...commercialTermsForm, deliveryTerm: e.target.value })}
                  placeholder="Ex: 7 dias úteis, 15-20 dias"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow label="Prazo de Pagamento" value={supplier.paymentTerm || "Não informado"} />
              <InfoRow label="Prazo de Entrega" value={supplier.deliveryTerm || "Não informado"} />
            </div>
          )}
        </div>
        
        {/* Dados Bancários */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Dados Bancários
            </h4>
            {!editingBankingData ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBankingData(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelBankingData}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveBankingData}
                  disabled={updateSupplierMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            )}
          </div>

          {editingBankingData ? (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dados Bancários</label>
              <Textarea
                value={bankingDataForm.bankingData}
                onChange={(e) => setBankingDataForm({ bankingData: e.target.value })}
                placeholder="Informações bancárias do fornecedor (banco, agência, conta, PIX, etc.)"
                rows={4}
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded border">
              <p className="text-gray-700 leading-relaxed text-sm">
                {supplier.bankingData || "Nenhum dado bancário fornecido"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, className = '' }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-700 w-32">{label}:</span>
    <span className={`text-gray-900 flex-1 ${className}`}>{value}</span>
  </div>
);