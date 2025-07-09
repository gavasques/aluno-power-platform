import { useState, useCallback } from 'react';
import { UIState, DEFAULT_UI_STATE } from '../types';

/**
 * Custom hook for UI state management
 * Follows Single Responsibility Principle - only handles UI state
 * Provides clean API for UI state operations
 */
export const useUIState = () => {
  const [uiState, setUIState] = useState<UIState>(DEFAULT_UI_STATE);

  // Dialog management
  const openSaveDialog = useCallback(() => {
    setUIState(prev => ({ ...prev, showSaveDialog: true }));
  }, []);

  const closeSaveDialog = useCallback(() => {
    setUIState(prev => ({ ...prev, showSaveDialog: false }));
  }, []);

  const openLoadDialog = useCallback(() => {
    setUIState(prev => ({ ...prev, showLoadDialog: true }));
  }, []);

  const closeLoadDialog = useCallback(() => {
    setUIState(prev => ({ ...prev, showLoadDialog: false }));
  }, []);

  const openDeleteConfirm = useCallback(() => {
    setUIState(prev => ({ ...prev, showDeleteConfirm: true }));
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setUIState(prev => ({ ...prev, showDeleteConfirm: false }));
  }, []);

  // Loading state management
  const setLoading = useCallback((isLoading: boolean) => {
    setUIState(prev => ({ ...prev, isLoading }));
  }, []);

  // Selected simulation management
  const setSelectedSimulationId = useCallback((id: number | null) => {
    setUIState(prev => ({ ...prev, selectedSimulationId: id }));
  }, []);

  // Reset all UI state
  const resetUIState = useCallback(() => {
    setUIState(DEFAULT_UI_STATE);
  }, []);

  return {
    uiState,
    setUIState,
    actions: {
      openSaveDialog,
      closeSaveDialog,
      openLoadDialog,
      closeLoadDialog,
      openDeleteConfirm,
      closeDeleteConfirm,
      setLoading,
      setSelectedSimulationId,
      resetUIState,
    }
  };
};