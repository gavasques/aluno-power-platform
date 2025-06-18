import React from 'react';
import { MaterialCard } from './MaterialCard';
import type { MaterialGridProps } from './MaterialTypes';

export const MaterialGrid: React.FC<MaterialGridProps> = ({
  materials,
  materialTypes,
  onView,
  onDownload,
}) => {
  const getMaterialType = (typeId: number) => {
    return materialTypes.find(t => t.id === typeId);
  };

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Nenhum material encontrado</div>
        <div className="text-gray-400 text-sm">
          Tente ajustar os filtros ou termo de busca
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {materials.map((material) => {
        const materialType = getMaterialType(material.typeId);
        if (!materialType) return null;

        return (
          <MaterialCard
            key={material.id}
            material={material}
            materialType={materialType}
            onView={onView}
            onDownload={onDownload}
          />
        );
      })}
    </div>
  );
};