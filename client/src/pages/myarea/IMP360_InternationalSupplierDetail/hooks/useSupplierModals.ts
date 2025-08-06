import { useState } from 'react';
import type { ModalState, Contact, Contract, Communication, UseSupplierModalsReturn } from '../types';

/**
 * HOOK DE GERENCIAMENTO DE MODAIS - FASE 4 REFATORAÇÃO
 * 
 * Responsabilidade única: Gerenciar estado de abertura/fechamento de modais
 * Antes: Estados de modal espalhados no componente de 1.853 linhas
 * Depois: Hook centralizado para todos os modais
 */
export function useSupplierModals(): UseSupplierModalsReturn {
  const [modalState, setModalState] = useState<ModalState>({
    isContactModalOpen: false,
    isContractModalOpen: false,
    isDocumentModalOpen: false,
    isCommunicationModalOpen: false,
    editingContact: null,
    editingContract: null,
    editingCommunication: null
  });

  // Contact modal functions
  const openContactModal = (contact?: Contact) => {
    setModalState(prev => ({
      ...prev,
      isContactModalOpen: true,
      editingContact: contact || null
    }));
  };

  const closeContactModal = () => {
    setModalState(prev => ({
      ...prev,
      isContactModalOpen: false,
      editingContact: null
    }));
  };

  // Contract modal functions
  const openContractModal = (contract?: Contract) => {
    setModalState(prev => ({
      ...prev,
      isContractModalOpen: true,
      editingContract: contract || null
    }));
  };

  const closeContractModal = () => {
    setModalState(prev => ({
      ...prev,
      isContractModalOpen: false,
      editingContract: null
    }));
  };

  // Document modal functions
  const openDocumentModal = () => {
    setModalState(prev => ({
      ...prev,
      isDocumentModalOpen: true
    }));
  };

  const closeDocumentModal = () => {
    setModalState(prev => ({
      ...prev,
      isDocumentModalOpen: false
    }));
  };

  // Communication modal functions
  const openCommunicationModal = (communication?: Communication) => {
    setModalState(prev => ({
      ...prev,
      isCommunicationModalOpen: true,
      editingCommunication: communication || null
    }));
  };

  const closeCommunicationModal = () => {
    setModalState(prev => ({
      ...prev,
      isCommunicationModalOpen: false,
      editingCommunication: null
    }));
  };

  return {
    modalState,
    openContactModal,
    closeContactModal,
    openContractModal,
    closeContractModal,
    openDocumentModal,
    closeDocumentModal,
    openCommunicationModal,
    closeCommunicationModal
  };
}