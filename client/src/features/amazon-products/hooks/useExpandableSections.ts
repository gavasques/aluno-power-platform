/**
 * HOOK: useExpandableSections
 * Gerencia estado de seções expansíveis do produto
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { useState } from 'react';
import { ExpandedSections, UseExpandableSectionsReturn, DEFAULT_EXPANDED_SECTIONS } from '../types';

export const useExpandableSections = (): UseExpandableSectionsReturn => {
  // ===== STATE MANAGEMENT =====
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(DEFAULT_EXPANDED_SECTIONS);

  // ===== SECTION ACTIONS =====
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      basicInfo: true,
      pricing: true,
      description: true,
      specifications: true,
      images: true,
      videos: true,
      ranking: true,
      variations: true,
      ratings: true,
      category: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      basicInfo: false,
      pricing: false,
      description: false,
      specifications: false,
      images: false,
      videos: false,
      ranking: false,
      variations: false,
      ratings: false,
      category: false
    });
  };

  // ===== RETURN INTERFACE =====
  return {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll
  };
};