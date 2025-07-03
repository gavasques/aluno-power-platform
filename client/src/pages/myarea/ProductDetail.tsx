
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit, Eye, Power, PowerOff } from "lucide-react";
import { ProductView } from "@/components/product/ProductView";
import { ProductMetrics } from "@/components/product/ProductMetrics";
import { EditProductModal } from "@/components/product/EditProductModal";
import { EditBasicDataModal } from "@/components/product/EditBasicDataModal";
import { EditChannelsModal } from "@/components/product/EditChannelsModal";
import { mockSuppliers, mockCategories } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";
import type { Product as DbProduct } from '@shared/schema';

const ProductDetail = () => {
  const [, params] = useRoute("/minha-area/produtos/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const { getProductById, updateProduct, toggleProductStatus } = useProducts();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditBasicDataModalOpen, setIsEditBasicDataModalOpen] = useState(false);
  const [isEditChannelsModalOpen, setIsEditChannelsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'metrics'>('overview');

  const product = getProductById(id || "");

  if (!product) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Button onClick={() => setLocation("/minha-area/produtos")}>
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  const handleProductUpdate = (updatedProduct: DbProduct) => {
    updateProduct(product.id.toString(), updatedProduct);
    setIsEditModalOpen(false);
    setIsEditBasicDataModalOpen(false);
    setIsEditChannelsModalOpen(false);
  };

  const handleToggleProductStatus = () => {
    const newStatus = !product.active;
    toggleProductStatus(product.id.toString());
    toast({
      title: newStatus ? "Produto ativado" : "Produto desativado",
      description: newStatus ? "O produto foi ativado com sucesso." : "O produto foi desativado e ocultado do sistema."
    });
  };

  // Nome do fornecedor - simplificado para dados do banco
  const supplierName = product.brand || "Marca não definida";

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/minha-area/produtos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{product.name || "Produto sem nome"}</h1>
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {supplierName}
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
              <Switch
                checked={product.active}
                onCheckedChange={handleToggleProductStatus}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm font-medium">
                {product.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              onClick={() => setViewMode('overview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visão Geral
            </Button>
            <Button
              variant={viewMode === 'metrics' ? 'default' : 'outline'}
              onClick={() => setViewMode('metrics')}
            >
              Métricas
            </Button>
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Tudo
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {viewMode === 'overview' ? (
          <ProductView 
            product={product} 
            supplierName={supplierName}
            onEditBasicData={() => setIsEditBasicDataModalOpen(true)}
            onEditChannels={() => setIsEditChannelsModalOpen(true)}
          />
        ) : (
          <ProductMetrics product={product} />
        )}
      </div>

      <EditProductModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProductUpdate}
        mockSuppliers={mockSuppliers}
        mockCategories={mockCategories}
      />

      <EditBasicDataModal
        product={product}
        isOpen={isEditBasicDataModalOpen}
        onClose={() => setIsEditBasicDataModalOpen(false)}
        onSave={handleProductUpdate}
        mockSuppliers={mockSuppliers}
        mockCategories={mockCategories}
      />

      <EditChannelsModal
        product={product}
        isOpen={isEditChannelsModalOpen}
        onClose={() => setIsEditChannelsModalOpen(false)}
        onSave={handleProductUpdate}
      />
    </div>
  );
};

export default ProductDetail;
