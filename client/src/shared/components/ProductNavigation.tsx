import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { EDIT_ROUTES } from "@/shared/constants/product";

interface ProductNavigationProps {
  productId?: string;
  title: string;
  subtitle?: string;
}

/**
 * Reusable navigation component for product pages
 * Single Responsibility: Handle navigation back to products list
 */
export function ProductNavigation({ productId, title, subtitle }: ProductNavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation(EDIT_ROUTES.list())}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Produtos
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}