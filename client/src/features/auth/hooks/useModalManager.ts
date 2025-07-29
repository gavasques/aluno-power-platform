/**
 * HOOK: useModalManager
 * Gerencia estados de todos os modais do sistema de auth
 * Extraído de LoginNew.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { ModalStates, UseModalManagerReturn } from '../types';

export const useModalManager = (): UseModalManagerReturn => {
  // ===== STATE =====
  const [modalStates, setModalStates] = useState<ModalStates>({
    isRegisterModalOpen: false,
    isForgotPasswordModalOpen: false,
    isForgotPasswordCodeModalOpen: false,
    isResetPasswordModalOpen: false
  });

  // ===== MODAL ACTIONS =====
  const openModal = useCallback((modal: keyof ModalStates) => {
    setModalStates(prev => ({
      ...prev,
      [modal]: true
    }));
  }, []);

  const closeModal = useCallback((modal: keyof ModalStates) => {
    setModalStates(prev => ({
      ...prev,
      [modal]: false
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStates({
      isRegisterModalOpen: false,
      isForgotPasswordModalOpen: false,
      isForgotPasswordCodeModalOpen: false,
      isResetPasswordModalOpen: false
    });
  }, []);

  return {
    modalStates,
    openModal,
    closeModal,
    closeAllModals
  };
};