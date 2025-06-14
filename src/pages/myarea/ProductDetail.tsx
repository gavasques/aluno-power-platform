
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { ProductView } from "@/components/product/ProductView";
import { ProductMetrics } from "@/components/product/ProductMetrics";
import { EditProductModal } from "@/components/product/EditProductModal";
import { mockSuppliers, mockCategories } from "@/data/mockData";

// Mock product data - em um app real viria de uma API
const mockProduct: Product = {
  id: "1",
  name: "Smartphone Samsung Galaxy A54",
  photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
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
  channels: {
    sitePropio: {
      enabled: true,
      commissionPct: 0,
      fixedFee: 0,
      otherPct: 3,
      otherValue: 0,
      adsPct: 5,
      salePrice: 699.90
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
    mlME1: {
      enabled: true,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 6,
      salePrice: 729.90
    }
  },
  createdAt: "2024-01-15T10:30:00Z"
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [product, setProduct] = useState<Product>(mockProduct);
  const [viewMode, setViewMode] = useState<'overview' | 'metrics'>('overview');

  const handleProductUpdate = (updatedProduct: Product) => {
    setProduct(updatedProduct);
    setIsEditModalOpen(false);
  };

  const supplierName = mockSuppliers.find(s => s.id === product.supplierId)?.tradeName || "Fornecedor não encontrado";

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
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              {product.brand} • {supplierName}
            </p>
          </div>
          
          <div className="flex gap-2">
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
              Editar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {viewMode === 'overview' ? (
          <ProductView product={product} supplierName={supplierName} />
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
    </div>
  );
};

export default ProductDetail;
