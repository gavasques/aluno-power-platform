
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2, List, Grid3X3, Eye, Heart } from "lucide-react";
import { useState } from "react";

interface Supplier {
  id: string;
  tradeName: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  country: string;
  city: string;
  email: string;
  phone: string;
  specialties: string[];
  minOrder: string;
  paymentTerms: string;
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
  { code: "DE", name: "Alemanha", flag: "🇩🇪" }
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    tradeName: "TechSupply Brasil",
    category: "Eletrônicos",
    description: "Importador especializado em eletrônicos e acessórios tech",
    logo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.5,
    reviewCount: 128,
    country: "BR",
    city: "São Paulo",
    email: "contato@techsupplybrasil.com.br",
    phone: "(11) 3456-7890",
    specialties: ["Smartphones", "Tablets", "Acessórios"],
    minOrder: "R$ 5.000",
    paymentTerms: "30 dias"
  },
  {
    id: "2",
    tradeName: "Fashion Import HK",
    category: "Roupas e Acessórios",
    description: "Fornecedor de roupas femininas e acessórios de moda",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.2,
    reviewCount: 89,
    country: "HK",
    city: "Hong Kong",
    email: "sales@fashionimport.hk",
    phone: "+852 2345-6789",
    specialties: ["Vestidos", "Bolsas", "Bijuterias"],
    minOrder: "US$ 2.000",
    paymentTerms: "T/T 30%"
  },
  {
    id: "3",
    tradeName: "Home & Garden China",
    category: "Casa e Jardim",
    description: "Produtos para casa, decoração e jardim",
    logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop",
    verified: false,
    rating: 3.8,
    reviewCount: 45,
    country: "CN",
    city: "Guangzhou",
    email: "info@homegarden.cn",
    phone: "+86 20 1234-5678",
    specialties: ["Decoração", "Utensílios", "Móveis"],
    minOrder: "US$ 1.500",
    paymentTerms: "L/C"
  },
  {
    id: "4",
    tradeName: "Sports Gear Turkey",
    category: "Esportes",
    description: "Equipamentos esportivos e roupas fitness",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.7,
    reviewCount: 156,
    country: "TR",
    city: "Istanbul",
    email: "export@sportsgear.tr",
    phone: "+90 212 345-6789",
    specialties: ["Roupas Fitness", "Equipamentos", "Calçados"],
    minOrder: "€ 3.000",
    paymentTerms: "T/T 50%"
  },
  {
    id: "5",
    tradeName: "Auto Parts Germany",
    category: "Automotivo",
    description: "Peças automotivas e acessórios para veículos",
    logo: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.6,
    reviewCount: 203,
    country: "DE",
    city: "Munich",
    email: "sales@autoparts.de",
    phone: "+49 89 1234-5678",
    specialties: ["Peças Motor", "Eletrônicos", "Acessórios"],
    minOrder: "€ 5.000",
    paymentTerms: "30 dias"
  },
  {
    id: "6",
    tradeName: "Beauty Cosmetics España",
    category: "Beleza e Cosméticos",
    description: "Cosméticos e produtos de beleza premium",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop",
    verified: true,
    rating: 4.4,
    reviewCount: 92,
    country: "ES",
    city: "Barcelona",
    email: "export@beautycosmetics.es",
    phone: "+34 93 456-7890",
    specialties: ["Maquiagem", "Skincare", "Perfumes"],
    minOrder: "€ 2.500",
    paymentTerms: "T/T 40%"
  }
];

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo", "Beleza e Cosméticos"];

  const filteredSuppliers = mockSuppliers.filter(supplier => {
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
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredSuppliers.map(supplier => {
        const country = countries.find(c => c.code === supplier.country);
        return (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <img
                  src={supplier.logo}
                  alt={supplier.tradeName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{supplier.tradeName}</CardTitle>
                    {supplier.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {country && <span className="text-xs">{country.flag}</span>}
                    <span className="text-xs text-muted-foreground">{supplier.city}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{supplier.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{supplier.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(supplier.rating)}</div>
                  <span className="text-xs text-muted-foreground">({supplier.reviewCount})</span>
                </div>
                <Button size="sm" variant="ghost">
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <div>Mín: {supplier.minOrder}</div>
                <div>Pgto: {supplier.paymentTerms}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" className="flex-1 text-xs h-7">
                  Contatar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredSuppliers.map(supplier => {
        const country = countries.find(c => c.code === supplier.country);
        return (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={supplier.logo}
                  alt={supplier.tradeName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{supplier.tradeName}</h3>
                    {supplier.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                    {country && (
                      <Badge variant="outline" className="text-xs">
                        {country.flag} {country.name}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-2">{supplier.category}</Badge>
                  <p className="text-sm text-muted-foreground mb-2">{supplier.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(supplier.rating)}</div>
                      <span>{supplier.rating} ({supplier.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {supplier.city}
                    </div>
                    <div>Mín: {supplier.minOrder}</div>
                    <div>Pgto: {supplier.paymentTerms}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Perfil
                  </Button>
                  <Button size="sm">
                    Contatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Fornecedores</h1>
        <p className="text-muted-foreground">
          Diretório de fabricantes, distribuidores, importadores e representantes
        </p>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 max-w-md">
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
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
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

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
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
          {filteredSuppliers.length} fornecedores encontrados
        </p>
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}
    </div>
  );
};

export default Suppliers;
