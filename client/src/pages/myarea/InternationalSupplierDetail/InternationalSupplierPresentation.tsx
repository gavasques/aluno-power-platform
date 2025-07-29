import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Users, FileText, Upload, MessageSquare } from 'lucide-react';

// Import specialized presentation components
import { SupplierOverview } from './components/SupplierOverview';
import { SupplierContacts } from './components/SupplierContacts';
import { SupplierContracts } from './components/SupplierContracts';
import { SupplierDocuments } from './components/SupplierDocuments';
import { SupplierCommunications } from './components/SupplierCommunications';

// Import hook return types
import type { 
  UseSupplierDataReturn, 
  UseSupplierActionsReturn,
  UseSupplierTabsReturn,
  UseSupplierModalsReturn,
  UseSupplierFiltersReturn
} from './types';

interface InternationalSupplierPresentationProps {
  supplierId: string;
  supplierData: UseSupplierDataReturn;
  supplierActions: UseSupplierActionsReturn;
  tabsState: UseSupplierTabsReturn;
  modalsState: UseSupplierModalsReturn;
  filtersState: UseSupplierFiltersReturn;
}

/**
 * INTERNATIONAL SUPPLIER PRESENTATION - FASE 4 REFATORAÇÃO
 * 
 * Presentation Component seguindo padrão Container/Presentational
 * Responsabilidade única: Renderizar UI pura sem lógica de negócio
 * 
 * Antes: UI misturada com lógica no componente de 1.853 linhas
 * Depois: Apresentação pura focada apenas em renderização
 */
export function InternationalSupplierPresentation({
  supplierId,
  supplierData,
  supplierActions,
  tabsState,
  modalsState,
  filtersState
}: InternationalSupplierPresentationProps) {
  
  const { supplier, isLoading: isLoadingSupplier } = supplierData;
  const { tabState, setActiveTab } = tabsState;

  // Loading state
  if (isLoadingSupplier) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (!supplier) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Fornecedor não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O fornecedor solicitado não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Link href="/minha-area/importacoes/fornecedores">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Fornecedores
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/minha-area/importacoes/fornecedores">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
            <p className="text-gray-600">{supplier.country} • {supplier.businessType}</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs 
        value={tabState.activeTab} 
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Contatos</span>
            {supplierActions.contacts.length > 0 && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {supplierActions.contacts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Contratos</span>
            {supplierActions.contracts.length > 0 && (
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {supplierActions.contracts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Documentos</span>
            {supplierActions.documents.length > 0 && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {supplierActions.documents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Comunicações</span>
            {supplierActions.communications.length > 0 && (
              <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                {supplierActions.communications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6">
            <SupplierOverview
              supplier={supplier}
              isLoading={isLoadingSupplier}
              onUpdate={supplierData.updateSupplier}
            />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <SupplierContacts
              contacts={supplierActions.contacts}
              isLoading={supplierActions.isLoadingContacts}
              filters={filtersState.filters.contacts}
              onFiltersChange={filtersState.updateContactsFilter}
              onAdd={supplierActions.addContact}
              onEdit={modalsState.openContactModal}
              onDelete={supplierActions.deleteContact}
            />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <SupplierContracts
              contracts={supplierActions.contracts}
              isLoading={supplierActions.isLoadingContracts}
              filters={filtersState.filters.contracts}
              onFiltersChange={filtersState.updateContractsFilter}
              onAdd={supplierActions.addContract}
              onEdit={modalsState.openContractModal}
              onDelete={supplierActions.deleteContract}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <SupplierDocuments
              documents={supplierActions.documents}
              isLoading={supplierActions.isLoadingDocuments}
              filters={filtersState.filters.documents}
              onFiltersChange={filtersState.updateDocumentsFilter}
              onUpload={supplierActions.uploadDocument}
              onDelete={supplierActions.deleteDocument}
            />
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <SupplierCommunications
              communications={supplierActions.communications}
              isLoading={supplierActions.isLoadingCommunications}
              filters={filtersState.filters.communications}
              onFiltersChange={filtersState.updateCommunicationsFilter}
              onAdd={supplierActions.addCommunication}
              onDelete={supplierActions.deleteCommunication}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Loading Overlay */}
      {tabState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando...</p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {tabState.hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-yellow-800">
            Você tem alterações não salvas. Lembre-se de salvá-las antes de sair.
          </p>
        </div>
      )}
    </div>
  );
}