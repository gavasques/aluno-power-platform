import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Package, Plus, Edit, Trash2, Save, X, Box } from 'lucide-react';

interface ProductPackage {
  id: string;
  packageNumber: number;
  packageType: string;
  contentsDescription: string;
  packageEan: string;
  dimensionsLength: number;
  dimensionsWidth: number;
  dimensionsHeight: number;
  weightGross: number;
  weightNet: number;
  volumeCbm: number;
  unitsInPackage: number;
  packagingMaterial: string;
  specialHandling: string;
}

interface PackageManagerProps {
  productId: string;
  hasMultiplePackages: boolean;
  totalPackages: number;
  onHasMultiplePackagesChange: (value: boolean) => void;
  onTotalPackagesChange: (value: number) => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  productId,
  hasMultiplePackages,
  totalPackages,
  onHasMultiplePackagesChange,
  onTotalPackagesChange,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ProductPackage>>({
    packageNumber: 1,
    packageType: 'CAIXA',
    contentsDescription: '',
    packageEan: '',
    dimensionsLength: 0,
    dimensionsWidth: 0,
    dimensionsHeight: 0,
    weightGross: 0,
    weightNet: 0,
    unitsInPackage: 1,
    packagingMaterial: '',
    specialHandling: '',
  });

  // Carregar pacotes existentes
  useEffect(() => {
    if (productId && productId !== '' && hasMultiplePackages) {
      loadPackages();
    }
  }, [productId, hasMultiplePackages]);

  // Calcular número da próxima embalagem
  useEffect(() => {
    if (showAddForm && !editingId) {
      const nextPackageNumber = packages.length > 0 
        ? Math.max(...packages.map(p => p.packageNumber)) + 1 
        : 1;
      setFormData(prev => ({ ...prev, packageNumber: nextPackageNumber }));
    }
  }, [showAddForm, editingId, packages]);

  const loadPackages = async () => {
    if (!token || !productId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/product-packages/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async () => {
    if (!token || !productId) return;
    
    try {
      const response = await fetch('/api/product-packages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          productId,
          volumeCbm: calculateVolume(formData.dimensionsLength, formData.dimensionsWidth, formData.dimensionsHeight)
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Embalagem adicionada com sucesso",
        });
        loadPackages();
        setShowAddForm(false);
        resetForm();
      } else {
        throw new Error('Erro ao adicionar embalagem');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar embalagem",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePackage = async (packageId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/product-packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          volumeCbm: calculateVolume(formData.dimensionsLength, formData.dimensionsWidth, formData.dimensionsHeight)
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Embalagem atualizada com sucesso",
        });
        loadPackages();
        setEditingId(null);
        resetForm();
      } else {
        throw new Error('Erro ao atualizar embalagem');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar embalagem",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!token) return;
    
    if (!confirm('Tem certeza que deseja excluir esta embalagem?')) return;
    
    try {
      const response = await fetch(`/api/product-packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Embalagem removida com sucesso",
        });
        loadPackages();
      } else {
        throw new Error('Erro ao remover embalagem');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover embalagem",
        variant: "destructive",
      });
    }
  };

  const startEdit = (pkg: ProductPackage) => {
    setFormData(pkg);
    setEditingId(pkg.id);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      packageNumber: packages.length + 1,
      packageType: 'CAIXA',
      contentsDescription: '',
      packageEan: '',
      dimensionsLength: 0,
      dimensionsWidth: 0,
      dimensionsHeight: 0,
      weightGross: 0,
      weightNet: 0,
      unitsInPackage: 1,
      packagingMaterial: '',
      specialHandling: '',
    });
  };

  const calculateVolume = (length?: number, width?: number, height?: number): number => {
    if (!length || !width || !height) return 0;
    return (length * width * height) / 1000000; // cm³ para m³
  };

  const formatNumber = (value: string) => {
    return value.replace(/[^0-9.,]/g, '').replace(',', '.');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando embalagens...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles principais */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Switch
            checked={hasMultiplePackages}
            onCheckedChange={onHasMultiplePackagesChange}
          />
          <Label>Produto com múltiplas embalagens</Label>
        </div>
        
        {hasMultiplePackages && (
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Embalagem
          </Button>
        )}
      </div>

      {/* Campo total de embalagens */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="totalPackages">Total de Embalagens</Label>
          <Input
            id="totalPackages"
            type="text"
            value={totalPackages.toString()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onTotalPackagesChange(parseInt(value) || 1);
            }}
            placeholder="1"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Formulário de adicionar/editar embalagem */}
      {(showAddForm || editingId) && hasMultiplePackages && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Editar Embalagem' : 'Nova Embalagem'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="packageNumber">Número da Embalagem</Label>
                <Input
                  id="packageNumber"
                  type="text"
                  value={formData.packageNumber?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, packageNumber: parseInt(value) || 1 }));
                  }}
                  placeholder="1"
                  inputMode="numeric"
                />
                <p className="text-xs text-gray-500 mt-1">Ex: Caixa 1/4, 2/4, etc.</p>
              </div>

              <div>
                <Label htmlFor="packageType">Tipo de Embalagem</Label>
                <Input
                  id="packageType"
                  value={formData.packageType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value.toUpperCase() }))}
                  placeholder="CAIXA"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="packageEan">EAN da Embalagem</Label>
                <Input
                  id="packageEan"
                  value={formData.packageEan || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageEan: e.target.value }))}
                  placeholder="EAN da embalagem"
                />
              </div>

              <div>
                <Label htmlFor="unitsInPackage">Unidades na Embalagem</Label>
                <Input
                  id="unitsInPackage"
                  type="text"
                  value={formData.unitsInPackage?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, unitsInPackage: parseInt(value) || 1 }));
                  }}
                  placeholder="1"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contentsDescription">Descrição do Conteúdo</Label>
              <Input
                id="contentsDescription"
                value={formData.contentsDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contentsDescription: e.target.value.toUpperCase() }))}
                placeholder="DESCRIÇÃO DO QUE CONTÉM NESTA EMBALAGEM"
                className="uppercase"
              />
            </div>

            {/* Dimensões */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dimensionsLength">Comprimento (cm)</Label>
                <Input
                  id="dimensionsLength"
                  type="text"
                  value={formData.dimensionsLength?.toString() || ''}
                  onChange={(e) => {
                    const value = formatNumber(e.target.value);
                    setFormData(prev => ({ ...prev, dimensionsLength: parseFloat(value) || 0 }));
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>

              <div>
                <Label htmlFor="dimensionsWidth">Largura (cm)</Label>
                <Input
                  id="dimensionsWidth"
                  type="text"
                  value={formData.dimensionsWidth?.toString() || ''}
                  onChange={(e) => {
                    const value = formatNumber(e.target.value);
                    setFormData(prev => ({ ...prev, dimensionsWidth: parseFloat(value) || 0 }));
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>

              <div>
                <Label htmlFor="dimensionsHeight">Altura (cm)</Label>
                <Input
                  id="dimensionsHeight"
                  type="text"
                  value={formData.dimensionsHeight?.toString() || ''}
                  onChange={(e) => {
                    const value = formatNumber(e.target.value);
                    setFormData(prev => ({ ...prev, dimensionsHeight: parseFloat(value) || 0 }));
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Pesos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weightGross">Peso Bruto (kg)</Label>
                <Input
                  id="weightGross"
                  type="text"
                  value={formData.weightGross?.toString() || ''}
                  onChange={(e) => {
                    const value = formatNumber(e.target.value);
                    setFormData(prev => ({ ...prev, weightGross: parseFloat(value) || 0 }));
                  }}
                  placeholder="0.000"
                  inputMode="decimal"
                />
              </div>

              <div>
                <Label htmlFor="weightNet">Peso Líquido (kg)</Label>
                <Input
                  id="weightNet"
                  type="text"
                  value={formData.weightNet?.toString() || ''}
                  onChange={(e) => {
                    const value = formatNumber(e.target.value);
                    setFormData(prev => ({ ...prev, weightNet: parseFloat(value) || 0 }));
                  }}
                  placeholder="0.000"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Material e manuseio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packagingMaterial">Material da Embalagem</Label>
                <Input
                  id="packagingMaterial"
                  value={formData.packagingMaterial || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, packagingMaterial: e.target.value.toUpperCase() }))}
                  placeholder="PAPELÃO, PLÁSTICO, MADEIRA..."
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="specialHandling">Manuseio Especial</Label>
                <Input
                  id="specialHandling"
                  value={formData.specialHandling || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialHandling: e.target.value.toUpperCase() }))}
                  placeholder="FRÁGIL, ESTE LADO PARA CIMA..."
                  className="uppercase"
                />
              </div>
            </div>

            {/* Volume calculado */}
            {formData.dimensionsLength && formData.dimensionsWidth && formData.dimensionsHeight && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium">Volume Calculado</Label>
                <p className="text-lg font-semibold text-blue-600">
                  {calculateVolume(formData.dimensionsLength, formData.dimensionsWidth, formData.dimensionsHeight).toFixed(4)} m³
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (editingId) {
                    cancelEdit();
                  } else {
                    setShowAddForm(false);
                    resetForm();
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (editingId) {
                    handleUpdatePackage(editingId);
                  } else {
                    handleAddPackage();
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de embalagens */}
      {hasMultiplePackages && packages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Box className="w-4 h-4" />
            Embalagens Cadastradas ({packages.length})
          </h4>
          
          {packages.map((pkg) => (
            <Card key={pkg.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                {editingId === pkg.id ? (
                  // Modo de edição inline seria aqui, mas já está implementado acima
                  <div className="text-center text-gray-500">
                    Use o formulário acima para editar esta embalagem.
                  </div>
                ) : (
                  // Modo de visualização
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-lg">
                          <Badge variant="secondary" className="mr-2">
                            {pkg.packageNumber}/{totalPackages}
                          </Badge>
                          {pkg.packageType}
                        </h5>
                        <p className="text-sm text-gray-600">{pkg.contentsDescription}</p>
                        {pkg.packageEan && (
                          <p className="text-sm text-blue-600">EAN: {pkg.packageEan}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(pkg)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-500">Dimensões (cm)</Label>
                        <p className="font-medium">
                          {pkg.dimensionsLength} × {pkg.dimensionsWidth} × {pkg.dimensionsHeight}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Volume</Label>
                        <p className="font-medium text-blue-600">
                          {pkg.volumeCbm?.toFixed(4)} m³
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Peso Bruto</Label>
                        <p className="font-medium">{pkg.weightGross} kg</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Peso Líquido</Label>
                        <p className="font-medium">{pkg.weightNet} kg</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Unidades</Label>
                        <p className="font-medium">
                          <Badge variant="outline">{pkg.unitsInPackage} unidades</Badge>
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Material</Label>
                        <p className="font-medium">{pkg.packagingMaterial || '-'}</p>
                      </div>
                    </div>

                    {pkg.specialHandling && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded">
                        <Label className="text-xs text-yellow-700">Manuseio Especial</Label>
                        <p className="text-sm text-yellow-800">{pkg.specialHandling}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {hasMultiplePackages && packages.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma embalagem cadastrada ainda.</p>
            <p className="text-sm">Clique em "Adicionar Embalagem" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};