import { useState } from 'react';
import type { Material as DbMaterial } from '@shared/schema';

export const useMaterialViewer = () => {
  const [viewingMaterial, setViewingMaterial] = useState<DbMaterial | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openViewer = (material: DbMaterial) => {
    setViewingMaterial(material);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewingMaterial(null);
  };

  return {
    viewingMaterial,
    isViewerOpen,
    openViewer,
    closeViewer,
  };
};