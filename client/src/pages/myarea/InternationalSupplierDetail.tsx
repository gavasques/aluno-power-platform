import React, { useState, useEffect } from "react";
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
  Upload,
  Save,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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



interface Communication {
  id: number;
  type: 'email' | 'whatsapp' | 'phone' | 'meeting';
  subject: string;
  date: string;
  status: 'sent' | 'received' | 'pending';
  summary: string;
}

interface SupplierDocument {
  id: string;
  supplierId: number;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  category: 'certificate' | 'license' | 'contract' | 'quality' | 'other';
  uploadedAt: string;
  description?: string;
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
    supplierId: 1,
    contractNumber: "CONTR-2024-001",
    title: "Acordo de Fornecimento Principal",
    description: "Contrato principal para fornecimento de componentes eletrônicos",
    contractType: "Acordo de Fornecimento",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    value: 150000,
    currency: "USD",
    paymentTerms: "Net 30",
    deliveryTerms: "FOB Shenzhen",
    incoterms: "FOB",
    documents: [],
    notes: "Renovação automática por 12 meses",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15"
  },
  {
    id: 2,
    supplierId: 1,
    contractNumber: "NDA-2023-012",
    title: "Acordo de Confidencialidade",
    description: "NDA para proteção de informações comerciais",
    contractType: "NDA",
    status: "active",
    startDate: "2023-12-01",
    currency: "USD",
    documents: [],
    createdAt: "2023-11-28",
    updatedAt: "2023-12-01"
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

const mockDocuments: SupplierDocument[] = [
  {
    id: "doc-1",
    supplierId: 1,
    name: "Certificado ISO 9001",
    originalName: "ISO_9001_Certificate_2024.pdf",
    type: "application/pdf",
    size: 1024000, // 1MB
    url: "/api/documents/doc-1/download",
    category: "certificate",
    uploadedAt: "2024-01-15T10:30:00Z",
    description: "Certificado ISO 9001:2015 válido até dezembro 2024"
  },
  {
    id: "doc-2",
    supplierId: 1,
    name: "Licença de Exportação",
    originalName: "Export_License_CN_2024.pdf", 
    type: "application/pdf",
    size: 756000, // 756KB
    url: "/api/documents/doc-2/download",
    category: "license",
    uploadedAt: "2024-02-01T14:20:00Z",
    description: "Licença de exportação válida para produtos eletrônicos"
  },
  {
    id: "doc-3",
    supplierId: 1,
    name: "Relatório de Qualidade Q1 2024",
    originalName: "Quality_Report_Q1_2024.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 2048000, // 2MB
    url: "/api/documents/doc-3/download", 
    category: "quality",
    uploadedAt: "2024-04-15T09:15:00Z",
    description: "Relatório detalhado de controle de qualidade do primeiro trimestre"
  }
];

function InternationalSupplierDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Using mock data directly to avoid loading issues
  const supplier = mockSupplier;
  const contacts = mockContacts;
  const contracts = mockContracts;
  const communications = mockCommunications;
  const documents = mockDocuments;
  const documents = mockDocuments;

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

        <TabsContent value="banking">
          <BankingInformation supplierId={supplier.id} />
        </TabsContent>



        <TabsContent value="documents">
          <DocumentManagement supplierId={supplier.id} documents={documents} />
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

// Document Management Component
const DocumentManagement = ({ 
  supplierId, 
  documents: initialDocuments 
}: { 
  supplierId: number;
  documents: SupplierDocument[];
}) => {
  const [documents, setDocuments] = useState<SupplierDocument[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Formatos aceitos: PDF, Word, Excel, imagens (JPG, PNG, GIF) e arquivos de texto",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Create new document object
      const newDocument: SupplierDocument = {
        id: `doc-${Date.now()}`,
        supplierId: supplierId,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display name
        originalName: file.name,
        type: file.type,
        size: file.size,
        url: `/api/documents/doc-${Date.now()}/download`,
        category: 'other',
        uploadedAt: new Date().toISOString(),
        description: ""
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to documents list
      setDocuments(prev => [newDocument, ...prev]);

      toast({
        title: "Documento enviado com sucesso",
        description: `${file.name} foi adicionado aos documentos do fornecedor`,
      });

      // Reset form
      event.target.value = '';
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o documento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const variants = {
      certificate: "bg-green-100 text-green-700 border-green-200",
      license: "bg-blue-100 text-blue-700 border-blue-200",
      contract: "bg-purple-100 text-purple-700 border-purple-200",
      quality: "bg-orange-100 text-orange-700 border-orange-200",
      other: "bg-gray-100 text-gray-700 border-gray-200"
    };
    const labels = {
      certificate: "Certificado",
      license: "Licença",
      contract: "Contrato", 
      quality: "Qualidade",
      other: "Outros"
    };
    return (
      <Badge className={variants[category as keyof typeof variants]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('image')) return <Eye className="w-5 h-5 text-green-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileText className="w-5 h-5 text-green-600" />;
    if (type.includes('word')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enviar Novo Documento
          </CardTitle>
          <CardDescription>
            Adicione documentos importantes do fornecedor (máximo 10MB por arquivo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? "Enviando arquivo..." : "Clique para selecionar arquivo"}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                ou arraste e solte aqui
              </p>
              <p className="text-xs text-gray-500">
                Formatos aceitos: PDF, Word, Excel, imagens (JPG, PNG, GIF), texto
              </p>
              <p className="text-xs text-gray-500">
                Tamanho máximo: 10MB
              </p>
            </label>
            
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{uploadProgress}% enviado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos ({documents.length})
          </CardTitle>
          <CardDescription>
            Documentos e certificados do fornecedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento cadastrado</h3>
              <p className="text-gray-600">Faça o upload do primeiro documento deste fornecedor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </h4>
                        {getCategoryBadge(document.category)}
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {document.originalName}
                      </p>
                      {document.description && (
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        <span>Enviado em {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'draft' | 'active' | 'expired' | 'terminated'})}>
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

// Banking Information Component
const BankingInformation = ({ supplierId }: { supplierId: number }) => {
  const [bankingData, setBankingData] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch banking information on component mount
  useEffect(() => {
    fetchBankingData();
  }, [supplierId]);

  const fetchBankingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/international-suppliers/${supplierId}/banking`);
      if (response.ok) {
        const data = await response.json();
        setBankingData(data.bankingData || "");
      }
    } catch (error) {
      console.error("Error fetching banking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/international-suppliers/${supplierId}/banking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bankingData }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Informações bancárias salvas com sucesso.",
        });
        setIsEditing(false);
      } else {
        throw new Error("Failed to save banking data");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações bancárias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isEditing) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando...</h3>
        <p className="text-gray-600">Buscando informações bancárias</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Informações Bancárias</h3>
          <p className="text-gray-600">Dados bancários para transferências e pagamentos</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  fetchBankingData(); // Reset to original data
                }}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <Label htmlFor="banking-data">Dados Bancários</Label>
              <Textarea
                id="banking-data"
                placeholder="Digite as informações bancárias completas:&#10;&#10;Banco: &#10;Agência: &#10;Conta: &#10;Titular: &#10;SWIFT/IBAN: &#10;Endereço do banco: &#10;Observações:"
                value={bankingData}
                onChange={(e) => setBankingData(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isLoading}
              />
              <div className="text-sm text-gray-500">
                <p>Inclua todas as informações necessárias para transferências internacionais:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Nome completo do banco</li>
                  <li>Código SWIFT/BIC</li>
                  <li>IBAN (se aplicável)</li>
                  <li>Endereço completo do banco</li>
                  <li>Nome completo do titular da conta</li>
                  <li>Número da conta e agência</li>
                  <li>Instruções especiais para transferência</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              {bankingData ? (
                <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                  {bankingData}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma informação bancária</h3>
                  <p className="text-gray-600 mb-4">Adicione as informações bancárias deste fornecedor</p>
                  <Button onClick={() => setIsEditing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Informações
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InternationalSupplierDetail;