import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building2, 
  FileText, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Plus,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Upload
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  country: string;
  city: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  website?: string;
  email?: string;
  phone?: string;
  rating: number;
  totalOrders: number;
  lastContact: string;
  establishedYear?: number;
  description?: string;
}

interface Contract {
  id: number;
  supplierId: number;
  contractNumber: string;
  title: string;
  description?: string;
  contractType: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate?: string;
  endDate?: string;
  value?: number;
  currency: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  incoterms?: string;
  documents: ContractDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  description?: string;
}

interface Contact {
  id: number;
  name: string;
  position: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  isMainContact: boolean;
}

interface Contract {
  id: number;
  type: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'draft';
  value?: number;
  currency?: string;
}

interface Communication {
  id: number;
  type: 'email' | 'whatsapp' | 'phone' | 'meeting';
  subject: string;
  date: string;
  status: 'sent' | 'received' | 'pending';
  summary: string;
}

// Mock data
const mockSupplier: Supplier = {
  id: 1,
  name: "Shenzhen Electronics Co.",
  country: "China",
  city: "Shenzhen",
  category: "Eletrônicos",
  status: "active",
  website: "www.shenzhen-electronics.com",
  email: "contact@shenzhen-electronics.com",
  phone: "+86 755 1234 5678",
  rating: 4.8,
  totalOrders: 45,
  lastContact: "2025-01-20",
  establishedYear: 2008,
  description: "Fabricante especializado em componentes eletrônicos de alta qualidade com certificações internacionais ISO 9001 e CE."
};

const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Li Wei",
    position: "Sales Manager",
    email: "li.wei@shenzhen-electronics.com",
    phone: "+86 755 1234 5679",
    whatsapp: "+86 138 0000 1234",
    isMainContact: true
  },
  {
    id: 2,
    name: "Zhang Min",
    position: "Export Coordinator",
    email: "zhang.min@shenzhen-electronics.com",
    phone: "+86 755 1234 5680",
    isMainContact: false
  }
];

const mockContracts: Contract[] = [
  {
    id: 1,
    type: "Acordo de Fornecimento",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    status: "active",
    value: 150000,
    currency: "USD"
  },
  {
    id: 2,
    type: "NDA",
    startDate: "2023-12-01",
    status: "active"
  }
];

const mockCommunications: Communication[] = [
  {
    id: 1,
    type: "email",
    subject: "Cotação para novos produtos",
    date: "2025-01-20",
    status: "received",
    summary: "Recebida cotação para linha de produtos eletrônicos Q1 2025"
  },
  {
    id: 2,
    type: "whatsapp",
    subject: "Status do pedido #PO-2025-001",
    date: "2025-01-18",
    status: "sent",
    summary: "Solicitado update sobre status de produção"
  }
];

export default function InternationalSupplierDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Using mock data directly to avoid loading issues
  const supplier = mockSupplier;
  const contacts = mockContacts;
  const contracts = mockContracts;
  const communications = mockCommunications;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200", 
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente"
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };



  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/minha-area/importacoes/fornecedores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Fornecedores
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              {getStatusBadge(supplier.status)}
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{supplier.city}, {supplier.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{supplier.category}</span>
              </div>
              {supplier.establishedYear && (
                <span>Fundada em {supplier.establishedYear}</span>
              )}
            </div>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Editar Fornecedor
        </Button>
      </div>



      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="banking">Bancário</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descrição:</label>
                    <p className="text-sm mt-1">{supplier.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">País:</label>
                    <p className="text-sm mt-1">{supplier.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cidade:</label>
                    <p className="text-sm mt-1">{supplier.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoria:</label>
                    <p className="text-sm mt-1">{supplier.category}</p>
                  </div>
                  {supplier.establishedYear && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fundação:</label>
                      <p className="text-sm mt-1">{supplier.establishedYear}</p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3 pt-4 border-t">
                  {supplier.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`https://${supplier.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${supplier.email}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.slice(0, 5).map((comm) => (
                    <div key={comm.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {comm.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {comm.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-500" />}
                        {comm.type === 'phone' && <Phone className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">{comm.summary}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comm.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {communications.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma comunicação registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contatos</h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription>{contact.position}</CardDescription>
                    </div>
                    {contact.isMainContact && (
                      <Badge className="bg-blue-100 text-blue-700">Principal</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {contact.email}
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{contact.whatsapp}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {contacts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contato cadastrado</h3>
                <p className="text-gray-600 mb-4">Adicione contatos para este fornecedor</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Contato
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="contracts">
          <ContractManagement supplierId={supplier.id} />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractManagement supplierId={supplierId} />
        </TabsContent>

        <TabsContent value="banking">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações Bancárias</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>



        <TabsContent value="documents">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos e Compliance</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico de Comunicação</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>




      </Tabs>
    </div>
  );
};

// Contract Management Component
const ContractManagement = ({ supplierId }: { supplierId: number }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Mock data for development
  const mockContracts: Contract[] = [
    {
      id: 1,
      supplierId: supplierId,
      contractNumber: "CNT-2024-001",
      title: "Contrato de Fornecimento de Eletrônicos",
      description: "Fornecimento mensal de componentes eletrônicos e dispositivos móveis",
      contractType: "purchase",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      value: 250000,
      currency: "USD",
      paymentTerms: "30 dias após entrega",
      deliveryTerms: "FOB Shanghai",
      incoterms: "FOB",
      documents: [
        {
          id: "doc1",
          name: "Contrato Principal.pdf",
          type: "application/pdf",
          size: 2048576,
          url: "/documents/contract1.pdf",
          uploadedAt: "2024-01-10"
        }
      ],
      notes: "Contrato principal para fornecimento de eletrônicos",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10"
    },
    {
      id: 2,
      supplierId: supplierId,
      contractNumber: "CNT-2024-002",
      title: "Contrato de Serviços de Desenvolvimento",
      description: "Desenvolvimento customizado de produtos eletrônicos",
      contractType: "service",
      status: "draft",
      startDate: "2024-03-01",
      value: 80000,
      currency: "USD",
      paymentTerms: "50% antecipado, 50% na entrega",
      deliveryTerms: "CIF Santos",
      incoterms: "CIF",
      documents: [],
      createdAt: "2024-02-15",
      updatedAt: "2024-02-15"
    }
  ];

  React.useEffect(() => {
    setContracts(mockContracts);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: Edit, label: "Rascunho" },
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Ativo" },
      expired: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Expirado" },
      terminated: { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Terminado" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number | undefined, currency: string) => {
    if (!value) return "-";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL'
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleDelete = (contractId: number) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      setContracts(contracts.filter(c => c.id !== contractId));
    }
  };

  const handleSave = (contractData: Partial<Contract>) => {
    if (editingContract) {
      // Update existing
      setContracts(contracts.map(c => 
        c.id === editingContract.id 
          ? { ...c, ...contractData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Create new
      const newContract: Contract = {
        id: Date.now(),
        supplierId,
        contractNumber: contractData.contractNumber || `CNT-${Date.now()}`,
        title: contractData.title || "",
        description: contractData.description,
        contractType: contractData.contractType || "purchase",
        status: contractData.status || "draft",
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        value: contractData.value,
        currency: contractData.currency || "USD",
        paymentTerms: contractData.paymentTerms,
        deliveryTerms: contractData.deliveryTerms,
        incoterms: contractData.incoterms,
        documents: [],
        notes: contractData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContracts([...contracts, newContract]);
    }
    setShowForm(false);
    setEditingContract(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Contratos</h3>
          <p className="text-sm text-gray-600">Gerencie os contratos com este fornecedor</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Contrato
        </Button>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{contract.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {contract.contractNumber} • {contract.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(contract.status)}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-sm">{contract.contractType === 'purchase' ? 'Compra' : 'Serviço'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor</p>
                  <p className="text-sm">{formatCurrency(contract.value, contract.currency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Início</p>
                  <p className="text-sm">{contract.startDate ? new Date(contract.startDate).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fim</p>
                  <p className="text-sm">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
              </div>

              {/* Documents */}
              {contract.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Documentos ({contract.documents.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {contract.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{doc.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(doc.size)})</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {contracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contrato</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro contrato com este fornecedor</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Contrato
            </Button>
          </div>
        )}
      </div>

      {/* Contract Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? 'Editar Contrato' : 'Novo Contrato'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do contrato abaixo
            </DialogDescription>
          </DialogHeader>
          <ContractForm
            contract={editingContract}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingContract(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Contract Form Component
const ContractForm = ({ 
  contract, 
  onSave, 
  onCancel 
}: { 
  contract: Contract | null;
  onSave: (data: Partial<Contract>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    contractNumber: contract?.contractNumber || '',
    title: contract?.title || '',
    description: contract?.description || '',
    contractType: contract?.contractType || 'purchase',
    status: contract?.status || 'draft',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    value: contract?.value?.toString() || '',
    currency: contract?.currency || 'USD',
    paymentTerms: contract?.paymentTerms || '',
    deliveryTerms: contract?.deliveryTerms || '',
    incoterms: contract?.incoterms || '',
    notes: contract?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: formData.value ? parseFloat(formData.value) : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contractNumber">Número do Contrato</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => setFormData({...formData, contractNumber: e.target.value})}
            placeholder="CNT-2024-001"
            required
          />
        </div>
        <div>
          <Label htmlFor="contractType">Tipo de Contrato</Label>
          <Select value={formData.contractType} onValueChange={(value) => setFormData({...formData, contractType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Compra</SelectItem>
              <SelectItem value="service">Serviço</SelectItem>
              <SelectItem value="supply">Fornecimento</SelectItem>
              <SelectItem value="partnership">Parceria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Título do Contrato</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Nome do contrato"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descrição detalhada do contrato"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Data de Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="currency">Moeda</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - Dólar</SelectItem>
              <SelectItem value="BRL">BRL - Real</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="CNY">CNY - Yuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
        <Input
          id="paymentTerms"
          value={formData.paymentTerms}
          onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
          placeholder="Ex: 30 dias após entrega"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryTerms">Condições de Entrega</Label>
          <Input
            id="deliveryTerms"
            value={formData.deliveryTerms}
            onChange={(e) => setFormData({...formData, deliveryTerms: e.target.value})}
            placeholder="Ex: FOB Shanghai"
          />
        </div>
        <div>
          <Label htmlFor="incoterms">Incoterms</Label>
          <Select value={formData.incoterms} onValueChange={(value) => setFormData({...formData, incoterms: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOB">FOB - Free On Board</SelectItem>
              <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
              <SelectItem value="EXW">EXW - Ex Works</SelectItem>
              <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
              <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="terminated">Terminado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Observações adicionais"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {contract ? 'Atualizar' : 'Criar'} Contrato
        </Button>
      </DialogFooter>
    </form>
  );
};

// Remove duplicate export