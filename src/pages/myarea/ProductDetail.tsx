
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit, Eye, Power, PowerOff } from "lucide-react";
import { Product } from "@/types/product";
import { ProductView } from "@/components/product/ProductView";
import { ProductMetrics } from "@/components/product/ProductMetrics";
import { EditProductModal } from "@/components/product/EditProductModal";
import { EditBasicDataModal } from "@/components/product/EditBasicDataModal";
import { EditChannelsModal } from "@/components/product/EditChannelsModal";
import { mockSuppliers, mockCategories } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";

// Mock product data - em um app real viria de uma API
const mockProduct: Product = {
  id: "1",
  name: "Smartphone Samsung Galaxy A54",
  photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
  sku: "SAM-GS23-A54",
  internalCode: "PROD-001",
  ean: "7891234567890",
  dimensions: { length: 15, width: 7, height: 2 },
  weight: 0.2,
  brand: "Samsung",
  category: "Eletrônicos",
  supplierId: "1",
  ncm: "85171231",
  costItem: 450.00,
  packCost: 15.00,
  taxPercent: 12,
  active: true,
  channels: {
    sitePropio: {
      enabled: true,
      commissionPct: 0,
      fixedFee: 0,
      otherPct: 3,
      otherValue: 0,
      adsPct: 5,
      salePrice: 699.90,
      gatewayPct: 2.5
    },
    amazonFBM: {
      enabled: true,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 8,
      outboundFreight: 12.50,
      salePrice: 749.90
    },
    amazonFBAOnSite: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 8,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonDBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 8,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonFBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 8,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    },
    mlME1: {
      enabled: true,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 6,
      salePrice: 729.90
    },
    mlFlex: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 6,
      outboundFreight: 0,
      flexRevenue: 0,
      salePrice: 0
    },
    mlEnvios: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 6,
      outboundFreight: 0,
      salePrice: 0
    },
    mlFull: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 6,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    }
  },
  createdAt: "2024-01-15T10:30:00Z"
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
          <Button onClick={() => navigate("/minha-area/produtos")}>
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  const handleProductUpdate = (updatedProduct: Product) => {
    updateProduct(product.id, updatedProduct);
    setIsEditModalOpen(false);
    setIsEditBasicDataModalOpen(false);
    setIsEditChannelsModalOpen(false);
  };

  const handleToggleProductStatus = () => {
    const newStatus = !product.active;
    toggleProductStatus(product.id);
    toast({
      title: newStatus ? "Produto ativado" : "Produto desativado",
      description: newStatus ? "O produto foi ativado com sucesso." : "O produto foi desativado e ocultado do sistema."
    });
  };

  // Buscar fornecedor principal
  const getMainSupplierName = () => {
    if (product.suppliers && product.suppliers.length > 0) {
      const mainSupplier = product.suppliers.find(s => s.isMain);
      if (mainSupplier) {
        const supplierData = mockSuppliers.find(ms => ms.id === mainSupplier.supplierId);
        return supplierData?.tradeName || "Fornecedor não encontrado";
      }
    }
    // Fallback para o fornecedor antigo
    return mockSuppliers.find(s => s.id === product.supplierId)?.tradeName || "Fornecedor não encontrado";
  };

  const supplierName = getMainSupplierName();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/minha-area/produtos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {product.brand} • {supplierName}
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
