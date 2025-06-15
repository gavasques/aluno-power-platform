
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Edit3 } from "lucide-react";
import { ProductSupplier, Supplier } from "@/types/product";
import { formatCurrency } from "@/utils/productCalculations";
import { toast } from "@/hooks/use-toast";

interface ProductSuppliersManagerProps {
  suppliers: ProductSupplier[];
  availableSuppliers: Supplier[];
  onSuppliersChange: (suppliers: ProductSupplier[]) => void;
}

export const ProductSuppliersManager = ({ 
  suppliers, 
  availableSuppliers, 
  onSuppliersChange 
}: ProductSuppliersManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    supplierId: "",
    supplierProductCode: "",
    cost: 0,
    isMain: false
  });

  const handleAddSupplier = () => {
    if (!newSupplier.supplierId || !newSupplier.supplierProductCode || newSupplier.cost <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha fornecedor, código do produto e custo.",
        variant: "destructive"
      });
      return;
    }

    const id = Date.now().toString();
    const supplierToAdd: ProductSupplier = {
      id,
      ...newSupplier,
      isMain: suppliers.length === 0 || newSupplier.isMain
    };

    // Se for marcado como principal, desmarcar os outros
    let updatedSuppliers = suppliers;
    if (supplierToAdd.isMain) {
      updatedSuppliers = suppliers.map(s => ({ ...s, isMain: false }));
    }

    onSuppliersChange([...updatedSuppliers, supplierToAdd]);
    setNewSupplier({ supplierId: "", supplierProductCode: "", cost: 0, isMain: false });
    setIsAdding(false);
    
    toast({
      title: "Fornecedor adicionado",
      description: "O fornecedor foi adicionado com sucesso."
    });
  };

  const handleRemoveSupplier = (id: string) => {
    const updatedSuppliers = suppliers.filter(s => s.id !== id);
    onSuppliersChange(updatedSuppliers);
    
    toast({
      title: "Fornecedor removido",
      description: "O fornecedor foi removido com sucesso."
    });
  };

  const handleSetMainSupplier = (id: string) => {
    const updatedSuppliers = suppliers.map(s => ({
      ...s,
      isMain: s.id === id
    }));
    onSuppliersChange(updatedSuppliers);
    
    toast({
      title: "Fornecedor principal alterado",
      description: "O fornecedor principal foi atualizado."
    });
  };

  const getSupplierName = (supplierId: string) => {
    return availableSuppliers.find(s => s.id === supplierId)?.tradeName || "Fornecedor não encontrado";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fornecedores do Produto</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Fornecedor
        </Button>
      </div>

      {/* Lista de fornecedores */}
      <div className="space-y-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{getSupplierName(supplier.supplierId)}</h4>
                    {supplier.isMain && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Código: </span>
                      {supplier.supplierProductCode}
                    </div>
                    <div>
                      <span className="font-medium">Custo: </span>
                      {formatCurrency(supplier.cost)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!supplier.isMain && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMainSupplier(supplier.id)}
                      title="Tornar principal"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Remover"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário para adicionar fornecedor */}
      {isAdding && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">Adicionar Novo Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-supplier">Fornecedor</Label>
                <Select value={newSupplier.supplierId} onValueChange={(value) => 
                  setNewSupplier(prev => ({ ...prev, supplierId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSuppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.tradeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="supplier-code">Código no Fornecedor</Label>
                <Input
                  id="supplier-code"
                  value={newSupplier.supplierProductCode}
                  onChange={(e) => setNewSupplier(prev => ({ 
                    ...prev, 
                    supplierProductCode: e.target.value 
                  }))}
                  placeholder="Ex: PROD-123"
                />
              </div>
              
              <div>
                <Label htmlFor="supplier-cost">Custo (R$)</Label>
                <Input
                  id="supplier-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSupplier.cost || ""}
                  onChange={(e) => setNewSupplier(prev => ({ 
                    ...prev, 
                    cost: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-main"
                checked={newSupplier.isMain}
                onChange={(e) => setNewSupplier(prev => ({ 
                  ...prev, 
                  isMain: e.target.checked 
                }))}
                className="rounded"
              />
              <Label htmlFor="is-main" className="text-sm">
                Definir como fornecedor principal
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="button" onClick={handleAddSupplier}>
                Adicionar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewSupplier({ supplierId: "", supplierProductCode: "", cost: 0, isMain: false });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
