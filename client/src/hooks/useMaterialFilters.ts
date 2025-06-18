import { useState, useMemo } from 'react';
import type { Material as DbMaterial } from '@shared/schema';

export const useMaterialFilters = (materials: DbMaterial[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || material.typeId.toString() === selectedType;
      const matchesAccess = selectedAccess === "all" || material.accessLevel === selectedAccess;
      return matchesSearch && matchesType && matchesAccess;
    });
  }, [materials, searchTerm, selectedType, selectedAccess]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedAccess("all");
  };

  return {
    searchTerm,
    selectedType,
    selectedAccess,
    filteredMaterials,
    setSearchTerm,
    setSelectedType,
    setSelectedAccess,
    resetFilters,
  };
};