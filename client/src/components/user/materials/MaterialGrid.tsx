import React from 'react';
import { MaterialCard } from './MaterialCard';
import type { MaterialGridProps } from './MaterialTypes';

export const MaterialGrid: React.FC<MaterialGridProps> = ({
  materials,
  onView,
  onDownload,
}) => {

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
        // Create a basic materialType object from the material data
        const materialType = {
          id: material.typeId,
          name: material.type?.name || 'Unknown',
          icon: material.type?.icon || 'File',
          description: material.type?.description || '',
          viewerType: material.type?.viewerType || 'download'
        };

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