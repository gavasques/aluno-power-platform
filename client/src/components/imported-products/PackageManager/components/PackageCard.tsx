import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package, Box } from 'lucide-react';
import type { ProductPackage } from '../types';

interface PackageCardProps {
  package: ProductPackage;
  onEdit: (pkg: ProductPackage) => void;
  onDelete: (pkg: ProductPackage) => void;
}

export const PackageCard = memo<PackageCardProps>(({
  package: pkg,
  onEdit,
  onDelete
}) => {
  const formatDimensions = () => {
    return `${pkg.dimensionsLength} × ${pkg.dimensionsWidth} × ${pkg.dimensionsHeight} cm`;
  };

  const formatWeight = () => {
    return `${pkg.weightGross}kg (${pkg.weightNet}kg líq.)`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Embalagem #{pkg.packageNumber}
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline">
              {pkg.packageType}
            </Badge>
            {pkg.specialHandling !== 'Normal' && (
              <Badge variant="secondary">
                {pkg.specialHandling}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dimensions and Volume */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Dimensões</p>
            <p className="font-medium">{formatDimensions()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-medium">{pkg.volumeCbm.toFixed(4)} m³</p>
          </div>
        </div>

        {/* Weight and Units */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Peso</p>
            <p className="font-medium">{formatWeight()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Unidades</p>
            <p className="font-medium">{pkg.unitsInPackage} un.</p>
          </div>
        </div>

        {/* Material and EAN */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Material</p>
            <p className="font-medium">{pkg.packagingMaterial || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">EAN</p>
            <p className="font-medium font-mono">{pkg.packageEan || 'Não informado'}</p>
          </div>
        </div>

        {/* Contents Description */}
        {pkg.contentsDescription && (
          <div className="text-sm">
            <p className="text-muted-foreground">Conteúdo</p>
            <p className="font-medium text-sm leading-relaxed">
              {pkg.contentsDescription}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(pkg)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(pkg)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});