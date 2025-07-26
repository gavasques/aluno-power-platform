import { useState } from "react";
import { Package, Search, Download, Copy, ExternalLink, Star, DollarSign, Eye, Heart, MessageSquare, Globe, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/common/CopyButton";
import { useToast } from "@/hooks/use-toast";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface ProductData {
  asin: string;
  title: string;
  brand: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviewCount: number;
  availability: string;
  prime: boolean;
  images: string[];
  bulletPoints: string[];
  description: string;
  specifications: Record<string, string>;
  variations?: Array<{
    name: string;
    values: string[];
    images?: string[];
  }>;
  videos?: string[];
  category: string;
  seller: string;
  shippingInfo: string;
  warranty: string;
  keywords: string[];
}

function CompararListingsContent() {
  const [asins, setAsins] = useState<string[]>(["", ""]);
  const [country, setCountry] = useState("BR");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductData[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { checkAndDeductCredits } = useCreditSystem();

  const handleAddAsin = () => {
    if (asins.length < 5) {
      setAsins([...asins, ""]);
    }
  };

  const handleRemoveAsin = (index: number) => {
    if (asins.length > 2) {
      const newAsins = asins.filter((_, i) => i !== index);
      setAsins(newAsins);
    }
  };

  const handleAsinChange = (index: number, value: string) => {
    const newAsins = [...asins];
    newAsins[index] = value;
    setAsins(newAsins);
  };

  const handleSearch = async () => {
    const validAsins = asins.filter(asin => asin.trim());

    if (validAsins.length < 2) {
      setError("Insira pelo menos 2 ASINs para comparar");
      return;
    }

    const canProceed = await checkAndDeductCredits("tools.compare_listings", validAsins.length);
    if (!canProceed) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const promises = validAsins.map(async (asin) => {
        const response = await fetch('/api/tools/amazon-product-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ asin: asin.trim(), country })
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar produto ${asin}`);
        }

        return response.json();
      });

      const responses = await Promise.all(promises);
      setResults(responses);

      toast({
        title: "Sucesso!",
        description: `${validAsins.length} produtos comparados com sucesso`,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar produtos");
      toast({
        title: "Erro",
        description: "Erro ao buscar informações dos produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToTxt = () => {
    if (results.length === 0) return;

    let content = "COMPARAÇÃO DE PRODUTOS AMAZON\n";
    content += "=" .repeat(50) + "\n\n";

    results.forEach((product, index) => {
      content += `PRODUTO ${index + 1}: ${product.title}\n`;
      content += "-".repeat(30) + "\n";
      content += `ASIN: ${product.asin}\n`;
      content += `Marca: ${product.brand}\n`;
      content += `Preço: ${product.price}\n`;
      content += `Avaliação: ${product.rating}/5 (${product.reviewCount} avaliações)\n`;
      content += `Disponibilidade: ${product.availability}\n`;
      content += `Prime: ${product.prime ? 'Sim' : 'Não'}\n`;
      content += `Categoria: ${product.category}\n`;
      content += `Vendedor: ${product.seller}\n\n`;

      if (product.bulletPoints?.length > 0) {
        content += "CARACTERÍSTICAS:\n";
        product.bulletPoints.forEach(point => {
          content += `• ${point}\n`;
        });
        content += "\n";
      }

      if (product.variations?.length > 0) {
        content += "VARIAÇÕES:\n";
        product.variations.forEach(variation => {
          content += `${variation.name}: ${variation.values.join(', ')}\n`;
        });
        content += "\n";
      }

      if (product.specifications && Object.keys(product.specifications).length > 0) {
        content += "ESPECIFICAÇÕES:\n";
        Object.entries(product.specifications).forEach(([key, value]) => {
          content += `${key}: ${value}\n`;
        });
        content += "\n";
      }

      content += "\n" + "=".repeat(50) + "\n\n";
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparacao-produtos-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado!",
      description: "Comparação exportada com sucesso",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Comparar Listings Amazon
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Compare informações detalhadas entre múltiplos produtos Amazon usando ASINs
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">País</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                  <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                  <SelectItem value="UK">🇬🇧 Reino Unido</SelectItem>
                  <SelectItem value="DE">🇩🇪 Alemanha</SelectItem>
                  <SelectItem value="FR">🇫🇷 França</SelectItem>
                  <SelectItem value="ES">🇪🇸 Espanha</SelectItem>
                  <SelectItem value="IT">🇮🇹 Itália</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canadá</SelectItem>
                  <SelectItem value="AU">🇦🇺 Austrália</SelectItem>
                  <SelectItem value="JP">🇯🇵 Japão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">ASINs dos Produtos</label>
            {asins.map((asin, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`ASIN do produto ${index + 1} (ex: B07ZPK1BL8)`}
                  value={asin}
                  onChange={(e) => handleAsinChange(index, e.target.value)}
                  className="flex-1"
                />
                {asins.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveAsin(index)}
                    className="px-3"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}

            {asins.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAsin}
                className="w-full"
              >
                Adicionar mais um produto
              </Button>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Buscando..." : "Comparar Produtos"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Comparação de Produtos</h2>
            <Button onClick={exportToTxt} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar TXT
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((product, index) => (
              <Card key={product.asin} className="h-fit">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">Produto {index + 1}</Badge>
                    <CopyButton text={product.asin} />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>ASIN: {product.asin}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {product.images && product.images.length > 0 && (
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Básico</TabsTrigger>
                      <TabsTrigger value="details">Detalhes</TabsTrigger>
                      <TabsTrigger value="specs">Specs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                        {product.discount && (
                          <Badge variant="destructive" className="text-xs">
                            -{product.discount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{product.rating}/5</span>
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount} avaliações)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm">{product.availability}</span>
                        {product.prime && (
                          <Badge className="text-xs">Prime</Badge>
                        )}
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Marca:</span> {product.brand}
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Categoria:</span> {product.category}
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-3">
                      {product.bulletPoints && product.bulletPoints.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Características:</h4>
                          <ul className="space-y-1 text-sm">
                            {product.bulletPoints.slice(0, 5).map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span className="line-clamp-2">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {product.variations && product.variations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Variações:</h4>
                          <div className="space-y-2">
                            {product.variations.map((variation, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium">{variation.name}:</span>{" "}
                                {variation.values.slice(0, 3).join(", ")}
                                {variation.values.length > 3 && "..."}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="font-medium">Vendedor:</span> {product.seller}
                      </div>
                    </TabsContent>

                    <TabsContent value="specs" className="space-y-3">
                      {product.specifications && Object.keys(product.specifications).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(product.specifications).slice(0, 8).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Especificações não disponíveis
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <span className="font-medium">Garantia:</span> {product.warranty || "Não informado"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Envio:</span> {product.shippingInfo || "Não informado"}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompararListings() {
  return (
    <PermissionGuard requiredPermission="tools.compare_listings">
      <CompararListingsContent />
    </PermissionGuard>
  );
}