/**
 * Container principal para InternationalSupplierDetail
 * Coordena estado e ações entre os componentes de apresentação
 */

import { useParams, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Hooks especializados
import { useSupplierData } from './hooks/useSupplierData';
import { useSupplierActions } from './hooks/useSupplierActions';
import { useSupplierModals } from './hooks/useSupplierModals';
import { useSupplierTabs } from './hooks/useSupplierTabs';
import { useSupplierFilters } from './hooks/useSupplierFilters';

// Componentes de apresentação
import { SupplierOverview } from './components/SupplierOverview/SupplierOverview';
import { SupplierContacts } from './components/SupplierContacts/SupplierContacts';
import { SupplierContracts } from './components/SupplierContracts/SupplierContracts';
import { SupplierDocuments } from './components/SupplierDocuments/SupplierDocuments';
import { SupplierCommunications } from './components/SupplierCommunications/SupplierCommunications';

// Componente de loading
const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando dados do fornecedor...</span>
  </div>
);

// Componente de error
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{error}</div>
    <Button onClick={onRetry} variant="outline">
      Tentar Novamente
    </Button>
  </div>
);

export const InternationalSupplierContainer = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID do fornecedor não encontrado</div>;
  }

  // Hooks de dados e ações
  const {
    supplier,
    contacts,
    contracts,
    communications,
    documents,
    loading,
    error,
    refetch
  } = useSupplierData(id);

  const supplierActions = useSupplierActions(id, refetch);
  const modalState = useSupplierModals();
  const { activeTab, setActiveTab } = useSupplierTabs();
  
  const {
    filteredContracts,
    filteredDocuments,
    filteredCommunications
  } = useSupplierFilters(contracts, documents, communications);

  // Estados de loading e error
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!supplier) return <ErrorState error="Fornecedor não encontrado" onRetry={refetch} />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header com navegação */}
      <div className="mb-6">
        <Link href="/myarea/fornecedores-internacionais">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Fornecedores
          </Button>
        </Link>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contacts">
            Contatos
            {contacts.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {contacts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contratos
            {contracts.length > 0 && (
              <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                {contracts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos
            {documents.length > 0 && (
              <span className="ml-1 bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                {documents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="communications">
            Comunicações
            {communications.length > 0 && (
              <span className="ml-1 bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded-full">
                {communications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das tabs */}
        <TabsContent value="overview" className="space-y-6">
          <SupplierOverview
            supplier={supplier}
            onUpdate={supplierActions.updateSupplier}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <SupplierContacts
            contacts={contacts}
            onAdd={supplierActions.addContact}
            onUpdate={supplierActions.updateContact}
            onDelete={supplierActions.deleteContact}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <SupplierContracts
            contracts={filteredContracts}
            onAdd={supplierActions.addContract}
            onUpdate={supplierActions.updateContract}
            onDelete={supplierActions.deleteContract}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <SupplierDocuments
            documents={filteredDocuments}
            onUpload={supplierActions.uploadDocument}
            onDelete={supplierActions.deleteDocument}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <SupplierCommunications
            communications={filteredCommunications}
            onAdd={supplierActions.addCommunication}
            isLoading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};