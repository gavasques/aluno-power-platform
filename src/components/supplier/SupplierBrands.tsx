
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Globe, Save, X } from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { SupplierBrand, BRAND_CATEGORIES } from "@/types/supplier";
import { toast } from "@/hooks/use-toast";

interface SupplierBrandsProps {
  supplierId: string;
  brands: SupplierBrand[];
}

const SupplierBrands = ({ supplierId, brands }: SupplierBrandsProps) => {
  const { addBrand, updateBrand, deleteBrand } = useSuppliers();
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrand, setEditingBrand] = useState<SupplierBrand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    category: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      category: '',
      notes: ''
    });
    setIsAdding(false);
    setEditingBrand(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da marca é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editingBrand) {
      updateBrand(supplierId, editingBrand.id, formData);
      toast({
        title: "Marca atualizada",
        description: "A marca foi atualizada com sucesso."
      });
    } else {
      addBrand(supplierId, formData);
      toast({
        title: "Marca adicionada",
        description: "A marca foi adicionada com sucesso."
      });
    }

    resetForm();
  };

  const handleEdit = (brand: SupplierBrand) => {
    setFormData({
      name: brand.name,
      description: brand.description,
      website: brand.website || '',
      category: brand.category,
      notes: brand.notes
    });
    setEditingBrand(brand);
    setIsAdding(false);
  };

  const handleDelete = (brandId: string) => {
    if (confirm('Tem certeza que deseja excluir esta marca?')) {
      deleteBrand(supplierId, brandId);
      toast({
        title: "Marca removida",
        description: "A marca foi removida com sucesso."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista de Marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {brand.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(brand)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(brand.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {brand.description}
              </p>
              
              {brand.website && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <Globe className="h-3 w-3" />
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Website
                  </a>
                </div>
              )}
              
              {brand.notes && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {brand.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botão Adicionar */}
      {!isAdding && !editingBrand && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Nova Marca
        </Button>
      )}

      {/* Formulário */}
      {(isAdding || editingBrand) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBrand ? 'Editar Marca' : 'Nova Marca'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Marca *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da marca"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da marca"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre a marca"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingBrand ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {brands.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma marca cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione as marcas que este fornecedor trabalha
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Marca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierBrands;
