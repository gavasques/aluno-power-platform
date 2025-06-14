
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2, List, Grid3X3, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  country: string;
  city: string;
  website: string;
  email: string;
  services: string[];
  commission: string;
  minVolume: string;
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "LogiTrans Express",
    category: "Logística e Transporte",
    description: "Soluções completas de logística internacional e transporte de cargas",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.8,
    reviewCount: 245,
    country: "BR",
    city: "Santos",
    website: "www.logitrans.com.br",
    email: "parceria@logitrans.com.br",
    services: ["Transporte Marítimo", "Desembaraço", "Armazenagem"],
    commission: "5-8%",
    minVolume: "R$ 10.000"
  },
  {
    id: "2",
    name: "PaymentFlow",
    category: "Pagamentos Internacionais",
    description: "Plataforma de pagamentos para importação com as melhores taxas",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.6,
    reviewCount: 189,
    country: "BR",
    city: "São Paulo",
    website: "www.paymentflow.com.br",
    email: "partners@paymentflow.com.br",
    services: ["Transferências", "Câmbio", "Cartões Corporativos"],
    commission: "2-4%",
    minVolume: "US$ 5.000"
  },
  {
    id: "3",
    name: "InsureCargo",
    category: "Seguros",
    description: "Seguros especializados para importação e exportação",
    logo: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.5,
    reviewCount: 156,
    country: "BR",
    city: "Rio de Janeiro",
    website: "www.insurecargo.com.br",
    email: "parceiros@insurecargo.com.br",
    services: ["Seguro Transporte", "Seguro Responsabilidade", "Seguro Crédito"],
    commission: "10-15%",
    minVolume: "R$ 20.000"
  },
  {
    id: "4",
    name: "TaxConsult Pro",
    category: "Consultoria Tributária",
    description: "Consultoria especializada em tributação de importação e comércio exterior",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.7,
    reviewCount: 98,
    country: "BR",
    city: "Brasília",
    website: "www.taxconsultpro.com.br",
    email: "contato@taxconsultpro.com.br",
    services: ["Classificação Fiscal", "Regime Tributário", "Auditoria"],
    commission: "Fixo R$ 500",
    minVolume: "R$ 50.000"
  },
  {
    id: "5",
    name: "DigitalMkt Solutions",
    category: "Marketing Digital",
    description: "Agência especializada em marketing digital para e-commerce",
    logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
    verified: false,
    rating: 4.3,
    reviewCount: 73,
    country: "BR",
    city: "Florianópolis",
    website: "www.digitalmkt.com.br",
    email: "parceria@digitalmkt.com.br",
    services: ["Google Ads", "Facebook Ads", "SEO"],
    commission: "15-20%",
    minVolume: "R$ 5.000"
  },
  {
    id: "6",
    name: "LegalTrade",
    category: "Jurídico",
    description: "Escritório especializado em direito do comércio internacional",
    logo: "https://images.unsplash.com/photo-1556157382-4e063bb26661?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.9,
    reviewCount: 167,
    country: "BR",
    city: "São Paulo",
    website: "www.legaltrade.adv.br",
    email: "parcerias@legaltrade.adv.br",
    services: ["Contratos Internacionais", "Defesa Administrativa", "Compliance"],
    commission: "Hora R$ 400",
    minVolume: "Projeto R$ 5.000"
  }
];

const Partners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["Todas", "Logística e Transporte", "Pagamentos Internacionais", "Seguros", "Consultoria Tributária", "Marketing Digital", "Jurídico"];

  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || partner.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredPartners.map(partner => (
        <Card key={partner.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <CardTitle className="text-sm font-semibold truncate">{partner.name}</CardTitle>
                  {partner.verified && (
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-muted-foreground">{partner.city}</span>
                </div>
                <Badge variant="outline" className="text-xs">{partner.category}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{partner.description}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <div className="flex">{renderStars(partner.rating)}</div>
                <span className="text-xs text-muted-foreground">({partner.reviewCount})</span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              <div>Comissão: {partner.commission}</div>
              <div>Mín: {partner.minVolume}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button size="sm" className="flex-1 text-xs h-7">
                Parceria
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredPartners.map(partner => (
        <Card key={partner.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{partner.name}</h3>
                  {partner.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="mb-2">{partner.category}</Badge>
                <p className="text-sm text-muted-foreground mb-2">{partner.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="flex">{renderStars(partner.rating)}</div>
                    <span>{partner.rating} ({partner.reviewCount})</span>
                  </div>
                  <div>Comissão: {partner.commission}</div>
                  <div>Mín: {partner.minVolume}</div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {partner.website}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Perfil
                </Button>
                <Button size="sm">
                  Solicitar Parceria
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Parceiros</h1>
        <p className="text-muted-foreground">
          Rede de parceiros especializados em comércio exterior e e-commerce
        </p>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiros..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
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

          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredPartners.length} parceiros encontrados
        </p>
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}
    </div>
  );
};

export default Partners;
