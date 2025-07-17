import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductNavigation } from "@/shared/components/ProductNavigation";

interface ProductFormWrapperProps {
  productId: string;
  title: string;
  subtitle: string;
  description?: string;
  children: ReactNode;
}

/**
 * Reusable wrapper for product form pages
 * Single Responsibility: Provide consistent layout for product forms
 */
export function ProductFormWrapper({ 
  productId, 
  title, 
  subtitle, 
  description,
  children 
}: ProductFormWrapperProps) {
  return (
    <div className="container mx-auto p-6">
      <ProductNavigation 
        productId={productId}
        title={title}
        subtitle={subtitle}
      />
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}