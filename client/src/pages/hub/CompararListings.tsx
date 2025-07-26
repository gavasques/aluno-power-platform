import { useState } from "react";
import { Package, Search, Download, Star, DollarSign, Globe, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { useAuth } from "@/hooks/useAuth";

interface AmazonProductResponse {
  status: string;
  data: {
    asin: string;
    country: string;
    product_title: string;
    product_photo: string;
    product_photos: string[];
    product_url: string;
    product_price: string;
    product_original_price: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_availability: string;
    product_num_offers: number;
    is_best_seller: boolean;
    is_amazon_choice: boolean;
    is_prime: boolean;
    climate_pledge_friendly: boolean;
    sales_volume: string;
    product_description: string;
    about_product: string[];
    product_information: Record<string, any>;
    delivery: string;
    primary_delivery_time: string;
    category: {
      name: string;
    };
    product_byline: string;
  };
}

function CompararListingsContent() {
  const [asins, setAsins] = useState<string[]>(["", ""]);
  const [country, setCountry] = useState("BR");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AmazonProductResponse[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { checkCredits } = useCreditSystem();
  const { token } = useAuth();

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

  const validateAsin = (asin: string): boolean => {
    return /^[A-Z0-9]{10}$/i.test(asin);
  };

  const handleSearch = async () => {
    const validAsins = asins.filter(asin => asin.trim() && validateAsin(asin.trim()));
    
    if (validAsins.length < 2) {
      setError("Insira pelo menos 2 ASINs válidos para comparar");
      return;
    }

    // Verificar créditos necessários
    const creditsNeeded = validAsins.length;
    const creditCheck = await checkCredits('tools.product_details', creditsNeeded);
    if (!creditCheck.canProcess) {
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${creditsNeeded} créditos para esta operação. Saldo atual: ${creditCheck.currentBalance}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const promises = validAsins.map(async (asin) => {
        const response = await fetch('/api/amazon-product-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ asin: asin.trim(), country })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao buscar produto ${asin}: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        
        // Verificar se a resposta contém dados válidos
        if (!data || data.status !== 'OK' || !data.data) {
          throw new Error(`Produto ${asin} não encontrado ou dados inválidos`);
        }

        return data;
      });

      const productsData = await Promise.all(promises);
      const validProducts = productsData.filter(product => product && product.data);
      
      setResults(validProducts);
      
      if (validProducts.length === 0) {
        setError("Nenhum produto válido foi encontrado. Verifique os ASINs e tente novamente.");
      } else {
        toast({
          title: "Produtos encontrados!",
          description: `${validProducts.length} produto(s) carregado(s) com sucesso`,
        });
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar produtos");
    } finally {
      setLoading(false);
    }
  };

  const exportToTxt = () => {
    if (results.length === 0) return;

    let content = "COMPARAÇÃO DE PRODUTOS AMAZON\n";
    content += "=".repeat(50) + "\n\n";

    results.forEach((product, index) => {
      const data = product.data;
      content += `PRODUTO ${index + 1}: ${data.product_title || 'N/A'}\n`;
      content += "-".repeat(30) + "\n";
      content += `ASIN: ${data.asin}\n`;
      content += `Marca: ${data.product_byline || 'N/A'}\n`;
      content += `Preço: ${data.product_price || 'N/A'}\n`;
      content += `Avaliação: ${data.product_star_rating || 'N/A'}/5 (${data.product_num_ratings || 0} avaliações)\n`;
      content += `Disponibilidade: ${data.product_availability || 'N/A'}\n`;
      content += `Prime: ${data.is_prime ? 'Sim' : 'Não'}\n`;
      content += `Categoria: ${data.category?.name || 'N/A'}\n`;
      content += `Best Seller: ${data.is_best_seller ? 'Sim' : 'Não'}\n`;
      content += `Amazon Choice: ${data.is_amazon_choice ? 'Sim' : 'Não'}\n\n`;

      if (data.about_product?.length > 0) {
        content += "CARACTERÍSTICAS:\n";
        data.about_product.forEach(point => {
          content += `• ${point}\n`;
        });
        content += "\n";
      }

      if (data.product_description) {
        content += "DESCRIÇÃO:\n";
        content += `${data.product_description}\n\n`;
      }

      if (data.product_information && Object.keys(data.product_information).length > 0) {
        content += "ESPECIFICAÇÕES:\n";
        Object.entries(data.product_information).forEach(([key, value]) => {
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Resultados da Comparação ({results.length} produtos)
            </h2>
            <Button onClick={exportToTxt} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar TXT
            </Button>
          </div>

          {/* Exibição lado a lado para comparação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((product, index) => {
              const data = product.data;
              return (
                <Card key={`product-${data.asin}-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Produto {index + 1}</Badge>
                          <Badge variant="outline">{country}</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {data.product_title || 'Título não disponível'}
                        </CardTitle>
                        <div className="text-sm text-gray-600 mb-3">
                          ASIN: {data.asin}
                        </div>
                        {data.product_photo && (
                          <img 
                            src={data.product_photo} 
                            alt={data.product_title || 'Produto'} 
                            className="w-full h-48 object-cover rounded-md mb-3"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                        <TabsTrigger value="specs">Especificações</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-3 mt-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-lg text-green-600">
                              {data.product_price || 'Preço não disponível'}
                            </span>
                            {data.product_original_price && data.product_original_price !== data.product_price && (
                              <span className="text-sm text-gray-500 line-through">
                                {data.product_original_price}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{data.product_star_rating || 'N/A'}</span>
                            <span className="text-sm text-gray-600">
                              ({(data.product_num_ratings || 0).toLocaleString()} avaliações)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="text-sm">{data.product_availability || 'N/A'}</span>
                            {data.is_prime && (
                              <Badge className="text-xs bg-blue-600">Prime</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {data.is_best_seller && (
                              <Badge className="text-xs bg-orange-600">Best Seller</Badge>
                            )}
                            {data.is_amazon_choice && (
                              <Badge className="text-xs bg-green-600">Amazon's Choice</Badge>
                            )}
                            {data.climate_pledge_friendly && (
                              <Badge className="text-xs bg-emerald-600">Climate Pledge Friendly</Badge>
                            )}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">Marca:</span> {data.product_byline || 'N/A'}
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">Categoria:</span> {data.category?.name || 'N/A'}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-3">
                        {data.about_product && data.about_product.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Características:</h4>
                            <ul className="space-y-1 text-sm">
                              {data.about_product.slice(0, 5).map((point, i) => (
                                <li key={`feature-${data.asin}-${i}`} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span className="line-clamp-2">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {data.product_description && (
                          <div>
                            <h4 className="font-medium mb-2">Descrição:</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {data.product_description}
                            </p>
                          </div>
                        )}

                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Entrega:</span> {data.delivery || 'N/A'}</div>
                          <div><span className="font-medium">Vendas:</span> {data.sales_volume || 'N/A'}</div>
                          <div><span className="font-medium">Ofertas:</span> {data.product_num_offers || 0}</div>
                        </div>
                      </TabsContent>

                      <TabsContent value="specs" className="space-y-3">
                        {data.product_information && Object.keys(data.product_information).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(data.product_information).slice(0, 8).map(([key, value]) => (
                              <div key={`spec-${data.asin}-${key}`} className="text-sm">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Especificações não disponíveis
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">URL do Produto:</span></div>
                            <a 
                              href={data.product_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs break-all"
                            >
                              Ver no Amazon
                            </a>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompararListings() {
  return (
    <PermissionGuard featureCode="tools.compare_listings">
      <CompararListingsContent />
    </PermissionGuard>
  );
}