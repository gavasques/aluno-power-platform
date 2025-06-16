
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, MaterialType, MaterialFilters } from '@/types/material';

interface MaterialsContextType {
  materials: Material[];
  materialTypes: MaterialType[];
  loading: boolean;
  filters: MaterialFilters;
  addMaterial: (material: Omit<Material, 'id' | 'uploadDate' | 'lastModified' | 'downloadCount' | 'viewCount'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  setFilters: (filters: Partial<MaterialFilters>) => void;
  getFilteredMaterials: () => Material[];
  incrementView: (id: string) => void;
  incrementDownload: (id: string) => void;
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

// Mock data - tipos de materiais (sincronizado com admin)
const defaultMaterialTypes: MaterialType[] = [
  { id: '1', name: 'PDF', icon: 'FileText', description: 'Visualizar PDF e download', allowsUpload: true, allowsUrl: true, viewerType: 'inline' },
  { id: '2', name: 'Vídeo Youtube', icon: 'Youtube', description: 'Vídeo do Youtube embutido', allowsUpload: false, allowsUrl: true, viewerType: 'inline' },
  { id: '3', name: 'Vídeo Panda', icon: 'Video', description: 'Vídeo hospedado no Panda', allowsUpload: false, allowsUrl: true, viewerType: 'inline' },
  { id: '4', name: 'Vídeos', icon: 'Video', description: 'Upload/download vídeos próprios', allowsUpload: true, allowsUrl: false, viewerType: 'inline' },
  { id: '5', name: 'Planilhas', icon: 'FileSpreadsheet', description: 'Planilhas para download', allowsUpload: true, allowsUrl: true, viewerType: 'download' },
  { id: '6', name: 'Embed', icon: 'Code2', description: 'Código embed na tela', allowsUpload: false, allowsUrl: false, viewerType: 'inline' },
  { id: '7', name: 'iframe', icon: 'Globe', description: 'Exibir código iFrame tela', allowsUpload: false, allowsUrl: true, viewerType: 'inline' },
  { id: '8', name: 'Documentos', icon: 'FileText', description: 'Arquivos Word, PPT, etc', allowsUpload: true, allowsUrl: false, viewerType: 'download' },
  { id: '9', name: 'Imagens', icon: 'Image', description: 'Exibir e baixar imagens', allowsUpload: true, allowsUrl: true, viewerType: 'inline' },
];

// Mock data - materiais de exemplo
const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Guia Completo de React',
    description: 'Manual completo para desenvolvimento com React, incluindo hooks, context e melhores práticas.',
    type: defaultMaterialTypes[0],
    accessLevel: 'public',
    fileUrl: '/documents/react-guide.pdf',
    fileSize: 2048000,
    fileType: 'application/pdf',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-15',
    tags: ['react', 'frontend', 'javascript'],
    downloadCount: 45,
    viewCount: 120,
    uploadedBy: { id: '1', name: 'Admin' },
    technicalInfo: { format: 'PDF', quality: 'Alta' }
  },
  {
    id: '2',
    title: 'Tutorial TypeScript Avançado',
    description: 'Vídeo completo sobre TypeScript avançado com exemplos práticos.',
    type: defaultMaterialTypes[1],
    accessLevel: 'public',
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    uploadDate: '2024-01-10',
    lastModified: '2024-01-10',
    tags: ['typescript', 'tutorial', 'programacao'],
    downloadCount: 0,
    viewCount: 89,
    uploadedBy: { id: '1', name: 'Admin' },
    technicalInfo: { duration: '45:30', quality: '1080p' }
  },
  {
    id: '3',
    title: 'Planilha de Controle Financeiro',
    description: 'Template de planilha para controle financeiro pessoal e empresarial.',
    type: defaultMaterialTypes[4],
    accessLevel: 'restricted',
    fileUrl: '/documents/controle-financeiro.xlsx',
    fileSize: 512000,
    fileType: 'application/xlsx',
    uploadDate: '2024-01-20',
    lastModified: '2024-01-20',
    tags: ['financeiro', 'planilha', 'controle'],
    downloadCount: 23,
    viewCount: 67,
    uploadedBy: { id: '1', name: 'Admin' },
    technicalInfo: { format: 'Excel', quality: 'Template' }
  }
];

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [materialTypes] = useState<MaterialType[]>(defaultMaterialTypes);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<MaterialFilters>({
    search: '',
    typeId: '',
    accessLevel: 'all',
    tags: []
  });

  const addMaterial = (materialData: Omit<Material, 'id' | 'uploadDate' | 'lastModified' | 'downloadCount' | 'viewCount'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      viewCount: 0
    };
    setMaterials(prev => [newMaterial, ...prev]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(material => 
      material.id === id 
        ? { ...material, ...updates, lastModified: new Date().toISOString().split('T')[0] }
        : material
    ));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const setFilters = (newFilters: Partial<MaterialFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredMaterials = () => {
    return materials.filter(material => {
      const matchesSearch = !filters.search || 
        material.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        material.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesType = !filters.typeId || material.type.id === filters.typeId;
      
      const matchesAccess = filters.accessLevel === 'all' || material.accessLevel === filters.accessLevel;
      
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => material.tags.includes(tag));

      return matchesSearch && matchesType && matchesAccess && matchesTags;
    });
  };

  const incrementView = (id: string) => {
    updateMaterial(id, { viewCount: materials.find(m => m.id === id)?.viewCount || 0 + 1 });
  };

  const incrementDownload = (id: string) => {
    updateMaterial(id, { downloadCount: materials.find(m => m.id === id)?.downloadCount || 0 + 1 });
  };

  return (
    <MaterialsContext.Provider value={{
      materials,
      materialTypes,
      loading,
      filters,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      setFilters,
      getFilteredMaterials,
      incrementView,
      incrementDownload
    }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
}
