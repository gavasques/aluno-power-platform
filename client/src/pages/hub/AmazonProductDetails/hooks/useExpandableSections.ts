import { useState } from 'react';
import type { UseExpandableSectionsReturn, SectionId } from '../types';

/**
 * USE EXPANDABLE SECTIONS HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para controle de seções expansíveis
 * Responsabilidade única: Gerenciar estado de expansão/colapso de seções
 */
export function useExpandableSections(): UseExpandableSectionsReturn {
  // Set of expanded section IDs
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'basic-info', // Basic info expanded by default
    'pricing'     // Pricing expanded by default
  ]));

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Check if section is expanded
  const isExpanded = (sectionId: string): boolean => {
    return expandedSections.has(sectionId);
  };

  // Expand all sections
  const expandAll = () => {
    setExpandedSections(new Set([
      'basic-info',
      'pricing',
      'ratings',
      'photos',
      'specifications',
      'variations',
      'description',
      'category'
    ]));
  };

  // Collapse all sections
  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Reset to default (only basic info and pricing expanded)
  const resetToDefault = () => {
    setExpandedSections(new Set(['basic-info', 'pricing']));
  };

  return {
    expandedSections,
    toggleSection,
    isExpanded
  };
}