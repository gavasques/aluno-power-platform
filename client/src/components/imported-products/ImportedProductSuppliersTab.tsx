import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: number;
  tradeName: string;
  corporateName: string;
  commercialEmail: string;
}

interface ProductSupplier {
  id: string;
  supplierId: number;
  supplierProductCode: string;
  supplierProductName: string;
  moq: number;
  leadTimeDays: number;
  supplierTradeName: string;
  supplierCorporateName: string;
  supplierEmail: string;
}

interface ImportedProductSuppliersTabProps {
  productId: string;
}

interface ImportedProductSuppliersTabRef {
  getTempSuppliers: () => ProductSupplier[];
  clearTempSuppliers: () => void;
  saveTempSuppliersToDatabase: (newProductId: string) => Promise<boolean>;
}

const ImportedProductSuppliersTab = forwardRef<ImportedProductSuppliersTabRef, ImportedProductSuppliersTabProps>(
  ({ productId }, ref) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>([]);
  const [tempSuppliers, setTempSuppliers] = useState<ProductSupplier[]>([]); // Para modo temporário
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTemporaryMode, setIsTemporaryMode] = useState(!productId || productId === '');
  const { toast } = useToast();

  // Estados para o formulário de adição/edição
  const [formData, setFormData] = useState({
    supplierId: 0,
    supplierProductCode: '',
    supplierProductName: '',
    moq: 0,
    leadTimeDays: 0
  });

  // Carregar dados inicial
  useEffect(() => {
    loadData();
  }, [productId]);

  useEffect(() => {
    setIsTemporaryMode(!productId || productId === '');
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar fornecedores do CRM
      const suppliersResponse = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData || []);
      }

      // Carregar fornecedores do produto apenas se não estiver em modo temporário
      if (productId && productId !== '') {
        const productSuppliersResponse = await fetch(`/api/imported-products/${productId}/suppliers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (productSuppliersResponse.ok) {
          const productSuppliersData = await productSuppliersResponse.json();
          setProductSuppliers(productSuppliersData.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos fornecedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    try {
      if (!formData.supplierId) {
        toast({
          title: "Erro",
          description: "Selecione um fornecedor",
          variant: "destructive",
        });
        return;
      }

      if (isTemporaryMode) {
        // Modo temporário - adicionar à lista local
        const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
        if (selectedSupplier) {
          const newTempSupplier: ProductSupplier = {
            id: `temp-${Date.now()}`, // ID temporário
            supplierId: formData.supplierId,
            supplierProductCode: formData.supplierProductCode,
            supplierProductName: formData.supplierProductName,
            moq: formData.moq,
            leadTimeDays: formData.leadTimeDays,
            supplierTradeName: selectedSupplier.tradeName,
            supplierCorporateName: selectedSupplier.corporateName,
            supplierEmail: selectedSupplier.commercialEmail
          };
          
          setTempSuppliers(prev => [...prev, newTempSupplier]);
          
          toast({
            title: "Sucesso",
            description: "Fornecedor adicionado temporariamente. Salve o produto para confirmar.",
          });
        }
      } else {
        // Modo normal - enviar para API
        const response = await fetch(`/api/imported-products/${productId}/suppliers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Fornecedor adicionado com sucesso",
          });
          loadData();
        } else {
          const errorData = await response.json();
          toast({
            title: "Erro",
            description: errorData.error || "Erro ao adicionar fornecedor",
            variant: "destructive",
          });
        }
      }

      setShowAddForm(false);
      setFormData({
        supplierId: 0,
        supplierProductCode: '',
        supplierProductName: '',
        moq: 0,
        leadTimeDays: 0
      });
      
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSupplier = async (productSupplierId: string, supplierId: number) => {
    try {
      const response = await fetch(`/api/imported-products/${productId}/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso",
        });
        setEditingId(null);
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao atualizar fornecedor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplierIdOrTempId: string | number) => {
    if (!confirm('Tem certeza que deseja remover este fornecedor do produto?')) {
      return;
    }

    try {
      if (isTemporaryMode || String(supplierIdOrTempId).startsWith('temp-')) {
        // Modo temporário - remover da lista local
        setTempSuppliers(prev => prev.filter(s => s.id !== supplierIdOrTempId));
        toast({
          title: "Sucesso",
          description: "Fornecedor removido temporariamente",
        });
      } else {
        // Modo normal - remover via API
        const response = await fetch(`/api/imported-products/${productId}/suppliers/${supplierIdOrTempId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Fornecedor removido com sucesso",
          });
          loadData();
        } else {
          const errorData = await response.json();
          toast({
            title: "Erro",
            description: errorData.error || "Erro ao remover fornecedor",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    }
  };

  const startEdit = (productSupplier: ProductSupplier) => {
    setEditingId(productSupplier.id);
    setFormData({
      supplierId: productSupplier.supplierId,
      supplierProductCode: productSupplier.supplierProductCode || '',
      supplierProductName: productSupplier.supplierProductName || '',
      moq: productSupplier.moq || 0,
      leadTimeDays: productSupplier.leadTimeDays || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      supplierId: 0,
      supplierProductCode: '',
      supplierProductName: '',
      moq: 0,
      leadTimeDays: 0
    });
  };

  // Função para salvar fornecedores temporários no banco quando o produto for salvo
  const saveTempSuppliersToDatabase = async (newProductId: string): Promise<boolean> => {
    if (tempSuppliers.length === 0) return true;

    try {
      for (const supplier of tempSuppliers) {
        const supplierData = {
          supplierId: supplier.supplierId,
          supplierProductCode: supplier.supplierProductCode,
          supplierProductName: supplier.supplierProductName,
          moq: supplier.moq,
          leadTimeDays: supplier.leadTimeDays
        };

        const response = await fetch(`/api/imported-products/${newProductId}/suppliers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(supplierData)
        });

        if (!response.ok) {
          console.error(`Erro ao salvar fornecedor ${supplier.supplierTradeName}`);
          return false;
        }
      }
      
      setTempSuppliers([]);
      return true;
    } catch (error) {
      console.error('Erro ao salvar fornecedores temporários:', error);
      return false;
    }
  };

  // Expor funções via ref
  useImperativeHandle(ref, () => ({
    getTempSuppliers: () => tempSuppliers,
    clearTempSuppliers: () => setTempSuppliers([]),
    saveTempSuppliersToDatabase
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Carregando fornecedores...</div>
        </CardContent>
      </Card>
    );
  }

  // Lista unificada de fornecedores (temporários + persistidos)
  const displaySuppliers = isTemporaryMode ? tempSuppliers : productSuppliers;

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Fornecedores do Produto</h3>
          <p className="text-sm text-gray-600">Gerencie os fornecedores deste produto importado</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Fornecedor
        </Button>
      </div>

      {/* Formulário de adição */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Select
                  value={formData.supplierId.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.tradeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplierProductCode">Código do Produto no Fornecedor</Label>
                <Input
                  id="supplierProductCode"
                  value={formData.supplierProductCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierProductCode: e.target.value.toUpperCase() }))}
                  placeholder="Código no fornecedor"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="supplierProductName">Nome do Produto no Fornecedor</Label>
                <Input
                  id="supplierProductName"
                  value={formData.supplierProductName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierProductName: e.target.value.toUpperCase() }))}
                  placeholder="Nome no fornecedor"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="moq">MOQ (Quantidade Mínima)</Label>
                <Input
                  id="moq"
                  type="text"
                  value={formData.moq.toString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, moq: parseInt(value) || 0 }));
                  }}
                  placeholder="MOQ"
                  inputMode="numeric"
                />
              </div>

              <div>
                <Label htmlFor="leadTimeDays">Lead Time (dias)</Label>
                <Input
                  id="leadTimeDays"
                  type="text"
                  value={formData.leadTimeDays.toString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, leadTimeDays: parseInt(value) || 0 }));
                  }}
                  placeholder="Lead time em dias"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddSupplier}>
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de fornecedores */}
      <div className="space-y-4">
        {displaySuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Nenhum fornecedor adicionado ainda.
              <br />
              Clique em "Adicionar Fornecedor" para começar.
            </CardContent>
          </Card>
        ) : (
          displaySuppliers.map((productSupplier) => (
            <Card key={productSupplier.id}>
              <CardContent className="p-6">
                {editingId === productSupplier.id ? (
                  // Modo de edição
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Código do Produto no Fornecedor</Label>
                        <Input
                          value={formData.supplierProductCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, supplierProductCode: e.target.value.toUpperCase() }))}
                          placeholder="Código no fornecedor"
                          className="uppercase"
                        />
                      </div>

                      <div>
                        <Label>Nome do Produto no Fornecedor</Label>
                        <Input
                          value={formData.supplierProductName}
                          onChange={(e) => setFormData(prev => ({ ...prev, supplierProductName: e.target.value.toUpperCase() }))}
                          placeholder="Nome no fornecedor"
                          className="uppercase"
                        />
                      </div>

                      <div>
                        <Label>MOQ (Quantidade Mínima)</Label>
                        <Input
                          type="text"
                          value={formData.moq.toString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setFormData(prev => ({ ...prev, moq: parseInt(value) || 0 }));
                          }}
                          placeholder="MOQ"
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <Label>Lead Time (dias)</Label>
                        <Input
                          type="text"
                          value={formData.leadTimeDays.toString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setFormData(prev => ({ ...prev, leadTimeDays: parseInt(value) || 0 }));
                          }}
                          placeholder="Lead time em dias"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={() => handleUpdateSupplier(productSupplier.id, productSupplier.supplierId)}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{productSupplier.supplierTradeName}</h4>
                        <p className="text-sm text-gray-600">{productSupplier.supplierCorporateName}</p>
                        {productSupplier.supplierEmail && (
                          <p className="text-sm text-blue-600">{productSupplier.supplierEmail}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(productSupplier)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(productSupplier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Código no Fornecedor</Label>
                        <p className="font-medium">{productSupplier.supplierProductCode || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Nome no Fornecedor</Label>
                        <p className="font-medium">{productSupplier.supplierProductName || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">MOQ</Label>
                        <p className="font-medium">
                          {productSupplier.moq ? (
                            <Badge variant="secondary">{productSupplier.moq} unidades</Badge>
                          ) : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Lead Time</Label>
                        <p className="font-medium">
                          {productSupplier.leadTimeDays ? (
                            <Badge variant="outline">{productSupplier.leadTimeDays} dias</Badge>
                          ) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
});

ImportedProductSuppliersTab.displayName = 'ImportedProductSuppliersTab';

export default ImportedProductSuppliersTab;
export type { ImportedProductSuppliersTabRef };