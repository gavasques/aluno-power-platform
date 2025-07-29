/**
 * Hook para gerenciamento de estado dos modais
 * Separado para responsabilidade única e reutilização
 */

import { useState, useCallback } from 'react';
import type { Contact, Contract, UseSupplierModalsReturn } from '../types/supplier.types';

export const useSupplierModals = (): UseSupplierModalsReturn => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const openContactModal = useCallback((contact?: Contact) => {
    setEditingContact(contact || null);
    setIsContactModalOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsContactModalOpen(false);
    setEditingContact(null);
  }, []);

  const openContractModal = useCallback((contract?: Contract) => {
    setEditingContract(contract || null);
    setIsContractModalOpen(true);
  }, []);

  const closeContractModal = useCallback(() => {
    setIsContractModalOpen(false);
    setEditingContract(null);
  }, []);

  const openDocumentModal = useCallback(() => {
    setIsDocumentModalOpen(true);
  }, []);

  const closeDocumentModal = useCallback(() => {
    setIsDocumentModalOpen(false);
  }, []);

  const openCommunicationModal = useCallback(() => {
    setIsCommunicationModalOpen(true);
  }, []);

  const closeCommunicationModal = useCallback(() => {
    setIsCommunicationModalOpen(false);
  }, []);

  return {
    isContactModalOpen,
    isContractModalOpen,
    isDocumentModalOpen,
    isCommunicationModalOpen,
    editingContact,
    editingContract,
    openContactModal,
    closeContactModal,
    openContractModal,
    closeContractModal,
    openDocumentModal,
    closeDocumentModal,
    openCommunicationModal,
    closeCommunicationModal
  };
};