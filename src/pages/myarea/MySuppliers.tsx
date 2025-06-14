
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2, Plus, Edit } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes: string;
}

interface Branch {
  id: string;
  name: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  phone: string;
  email: string;
}

interface Conversation {
  id: string;
  date: string;
  category: 'email' | 'whatsapp' | 'telefone' | 'pessoalmente' | 'outro';
  description: string;
  files?: File[];
}

interface SupplierFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  file: File;
}

interface Supplier {
  id: string;
  tradeName: string;
  corporateName: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  notes: string;
  email: string;
  mainContact: string;
  phone: string;
  whatsapp: string;
  country: string;
  contacts: Contact[];
  branches: Branch[];
  conversations: Conversation[];
  files: SupplierFile[];
}

const countries = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "PY", name: "Paraguai", flag: "🇵🇾" },
  { code: "UY", name: "Uruguai", flag: "🇺🇾" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TR", name: "Turquia", flag: "🇹🇷" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "OTHER", name: "Outros Países", flag: "🌍" }
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    tradeName: "TechSupply Brasil",
    corporateName: "TechSupply Brasil Importação e Exportação Ltda",
    category: "Eletrônicos",
    description: "Importador especializado em eletrônicos e acessórios tech",
    logo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.5,
    reviewCount: 128,
    notes: "Empresa confiável com histórico de 15 anos no mercado. Especializada em produtos Apple e Samsung.",
    email: "contato@techsupplybrasil.com.br",
    mainContact: "João Silva",
    phone: "(11) 3456-7890",
    whatsapp: "(11) 99876-5432",
    country: "BR",
    contacts: [
      {
        id: "1",
        name: "João Silva",
        role: "Gerente Comercial",
        phone: "(11) 3456-7890",
        whatsapp: "(11) 99876-5432",
        email: "joao@techsupplybrasil.com.br",
        notes: "Responsável por novos parceiros"
      }
    ],
    branches: [
      {
        id: "1",
        name: "Matriz São Paulo",
        corporateName: "TechSupply Brasil Importação e Exportação Ltda",
        cnpj: "12.345.678/0001-90",
        stateRegistration: "123.456.789.123",
        address: "Rua das Flores, 123 - São Paulo/SP",
        phone: "(11) 3456-7890",
        email: "sp@techsupplybrasil.com.br"
      }
    ],
    conversations: [
      {
        id: "1",
        date: "2024-01-15",
        category: "email",
        description: "Discussão sobre novos produtos para 2024"
      }
    ],
    files: []
  }
];

const MySuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo"];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || supplier.category === selectedCategory;
    const matchesCountry = selectedCountry === "ALL" || supplier.country === selectedCountry;
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleViewSupplier = (supplierId: string) => {
    navigate(`/minha-area/fornecedores/${supplierId}`);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    toast({
      title: "Fornecedor removido",
      description: "O fornecedor foi removido com sucesso."
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Fornecedores</h1>
        <p className="text-muted-foreground">
          Gerencie seus fornecedores pessoais e mantenha todas as informações organizadas
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar fornecedores..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">País</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os países</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full mt-4" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fornecedor
          </Button>
        </div>

        {/* Lista de Fornecedores */}
        <div className="lg:w-3/4">
          <div className="grid gap-6">
            {filteredSuppliers.map(supplier => {
              const country = countries.find(c => c.code === supplier.country);
              return (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={supplier.logo}
                        alt={supplier.tradeName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{supplier.tradeName}</CardTitle>
                          {supplier.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {country && (
                            <Badge variant="outline">
                              {country.flag} {country.name}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="mb-2">
                          {supplier.category}
                        </Badge>
                        <p className="text-muted-foreground">{supplier.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Avaliação:</span>
                          <div className="flex">{renderStars(supplier.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {supplier.rating} ({supplier.reviewCount} avaliações)
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {supplier.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          Remover
                        </Button>
                        <Button onClick={() => handleViewSupplier(supplier.id)}>
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySuppliers;
