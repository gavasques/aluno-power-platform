
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useProducts } from "@/contexts/ProductContext";
import { usePagination } from "@/hooks/usePagination";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductList } from "@/components/product/ProductList";
import { ProductEmptyState } from "@/components/product/ProductEmptyState";

const MyProducts = () => {
  const { products, deleteProduct, toggleProductStatus } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;
    const matchesActive = showInactive || product.active;
    return matchesSearch && matchesCategory && matchesActive;
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    handlePageChange,
    getPaginationGroup
  } = usePagination({ items: filteredProducts, itemsPerPage: 25 });

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: "Produto removido",
      description: "O produto foi removido com sucesso."
    });
  };

  const handleToggleProductStatus = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const newStatus = !product?.active;
    toggleProductStatus(productId);
    toast({
      title: newStatus ? "Produto ativado" : "Produto desativado",
      description: newStatus ? "O produto foi ativado com sucesso." : "O produto foi desativado e ocultado do sistema."
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {getPaginationGroup().map((item, index) => (
            <PaginationItem key={`${item}-${index}`}>
              {typeof item === 'number' ? (
                <PaginationLink
                  href="#"
                  isActive={item === currentPage}
                  onClick={(e) => { e.preventDefault(); handlePageChange(item); }}
                >
                  {item}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="w-full py-4">
        {/* Header Section */}
        <div className="mb-6 px-2">
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Meus Produtos</h1>
                <p className="text-gray-600">
                  Gerencie seus produtos e analise a viabilidade financeira em diferentes canais
                </p>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => navigate("/minha-area/produtos/novo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 px-2">
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showInactive={showInactive}
              setShowInactive={setShowInactive}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>

          {/* Products Grid/List */}
          <div className="mb-4 px-2">
            {filteredProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <ProductList
                    products={paginatedProducts}
                    onToggleProductStatus={handleToggleProductStatus}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}
                <div className="mt-8">
                  {renderPagination()}
                </div>
              </>
            ) : (
              <ProductEmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
