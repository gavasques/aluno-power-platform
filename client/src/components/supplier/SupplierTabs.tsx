import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsTab } from './tabs/ContactsTab';
import { ContractsTab } from './tabs/ContractsTab';
import { CommunicationsTab } from './tabs/CommunicationsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import type { 
  Contact, 
  Contract, 
  Communication, 
  SupplierDocument 
} from '@/types/supplier';

interface SupplierTabsProps {
  contacts: Contact[];
  contracts: Contract[];
  communications: Communication[];
  documents: SupplierDocument[];
  supplierId: number;
  onDataUpdate: () => void;
}

export const SupplierTabs: React.FC<SupplierTabsProps> = ({
  contacts,
  contracts,
  communications,
  documents,
  supplierId,
  onDataUpdate
}) => {
  return (
    <Tabs defaultValue="contacts" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="contacts">
          Contatos ({contacts.length})
        </TabsTrigger>
        <TabsTrigger value="contracts">
          Contratos ({contracts.length})
        </TabsTrigger>
        <TabsTrigger value="communications">
          Comunicações ({communications.length})
        </TabsTrigger>
        <TabsTrigger value="documents">
          Documentos ({documents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contacts" className="mt-6">
        <ContactsTab 
          contacts={contacts}
          supplierId={supplierId}
          onUpdate={onDataUpdate}
        />
      </TabsContent>

      <TabsContent value="contracts" className="mt-6">
        <ContractsTab 
          contracts={contracts}
          supplierId={supplierId}
          onUpdate={onDataUpdate}
        />
      </TabsContent>

      <TabsContent value="communications" className="mt-6">
        <CommunicationsTab 
          communications={communications}
          supplierId={supplierId}
          onUpdate={onDataUpdate}
        />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DocumentsTab 
          documents={documents}
          supplierId={supplierId}
          onUpdate={onDataUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};