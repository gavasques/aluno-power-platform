import { Button } from "@/components/ui/button";
import { Edit, Calculator, TrendingUp, Eye, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { EDIT_ROUTES } from "@/shared/constants/product";

interface ProductActionButtonsProps {
  productId: string;
  productName: string;
  onDelete: (id: string, name: string) => void;
}

/**
 * Reusable action buttons component for product operations
 * Single Responsibility: Handle product action buttons
 */
export function ProductActionButtons({ productId, productName, onDelete }: ProductActionButtonsProps) {
  const [, setLocation] = useLocation();

  const handleEdit = (mode: 'basic' | 'costs' | 'channels') => (e: React.MouseEvent) => {
    e.stopPropagation();
    const route = mode === 'basic' ? EDIT_ROUTES.basic(productId) :
                  mode === 'costs' ? EDIT_ROUTES.costs(productId) :
                  EDIT_ROUTES.channels(productId);
    setLocation(route);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation(EDIT_ROUTES.view(productId));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(productId, productName);
  };

  return (
    <div className="flex gap-1 justify-center">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
        onClick={handleEdit('basic')}
        title="Editar dados do produto"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-all duration-200"
        onClick={handleEdit('costs')}
        title="Editar custos e impostos"
      >
        <Calculator className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200"
        onClick={handleEdit('channels')}
        title="Editar canais de venda"
      >
        <TrendingUp className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
        onClick={handleView}
        title="Visualizar página"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <div className="w-2" />
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
        onClick={handleDelete}
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}