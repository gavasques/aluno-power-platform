import { useState } from "react";
import { Package, Search, Download, Star, DollarSign, ExternalLink, Award, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    
    if (validAsins.length > 5) {
      setError("Máximo de 5 ASINs permitidos para comparação");
      return;
    }

    // Verificar créditos necessários - ferramenta de comparação custa 5 créditos fixos
    const creditsNeeded = 5;
    const creditCheck = await checkCredits('tools.compare_listings');
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
      const response = await fetch('/api/amazon-compare-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          asins: validAsins.map(asin => asin.trim()), 
          country 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro na comparação: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.results) {
        throw new Error('Erro na resposta da comparação');
      }

      const productsData = data.results;
      console.log('Dados recebidos da API:', productsData);
      
      setResults(productsData);
      
      if (productsData.length === 0) {
        setError("Nenhum produto válido foi encontrado. Verifique os ASINs e tente novamente.");
      } else {
        toast({
          title: "Busca concluída!",
          description: `${productsData.length} produto(s) processado(s)`,
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
      const data = product.data || {};
      const asin = data.asin || asins[index] || `produto-${index}`;
      content += `PRODUTO ${index + 1}: ${data.product_title || 'Título não disponível'}\n`;
      content += "-".repeat(30) + "\n";
      content += `ASIN: ${asin}\n`;
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
    <div className="w-screen min-h-screen bg-gray-50 px-1 py-3">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Comparar Listings Amazon
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Compare informações detalhadas entre múltiplos produtos Amazon lado a lado
        </p>
      </div>

      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
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
            <label className="block text-sm font-medium">
              ASINs dos Produtos ({asins.length}/5)
            </label>
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
              💡 <strong>Dica:</strong> Alguns ASINs podem retornar dados vazios da API externa. 
              Os ASINs padrão (B0D6TXJG28, B0CYD2QH4F) foram testados e funcionam corretamente.
            </div>
            {asins.map((asin, index) => (
              <div key={`asin-input-${index}`} className="flex gap-2">
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

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAsin}
                disabled={asins.length >= 5}
                className="w-full"
              >
                {asins.length >= 5 ? "Limite máximo atingido (5 produtos)" : "Adicionar mais um produto"}
              </Button>
              {asins.length >= 5 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md text-center">
                  Limite máximo de 5 ASINs para comparação
                </div>
              )}
            </div>
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
              Comparação lado a lado ({results.length} produtos)
            </h2>
            <Button onClick={exportToTxt} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar TXT
            </Button>
          </div>

          {/* COMPARAÇÃO LADO A LADO - TABELA COMPLETA */}
          <div className="bg-white rounded-lg border shadow-sm w-full overflow-hidden">
            <div className="overflow-x-auto" style={{maxWidth: '100vw'}}>
              <table className="w-full border-collapse table-auto" style={{minWidth: '100vw'}}>
                {/* HEADER - IMAGENS E TÍTULOS */}
                <thead className="bg-gray-50">
                  <tr>
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-900 w-32 bg-gray-50 sticky left-0 z-20">
                      Campo
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `header-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center w-1/4 min-w-[280px]">
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-600">Produto {index + 1}</div>
                            {data.product_photo ? (
                              <img 
                                src={data.product_photo} 
                                alt={data.product_title || 'Produto'} 
                                className="w-24 h-24 object-cover rounded-md mx-auto"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 rounded-md mx-auto flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="text-sm font-semibold line-clamp-2">
                              {data.product_title || 'Título não disponível'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ASIN: {asin}
                            </div>
                            {!data.product_title && (
                              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                                Dados não carregados
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </thead>
                
                <tbody>
                  {/* PREÇO */}
                  <tr className="border-b border-gray-100">
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 w-32">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Preço
                      </div>
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `price-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-green-600">
                              {data.product_price || 'N/A'}
                            </div>
                            {data.product_original_price && data.product_original_price !== data.product_price && (
                              <div className="text-sm text-gray-500 line-through">
                                {data.product_original_price}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* AVALIAÇÃO */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Avaliação
                      </div>
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `rating-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{data.product_star_rating || 'N/A'}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {(data.product_num_ratings || 0).toLocaleString()} avaliações
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* DISPONIBILIDADE */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Disponibilidade
                      </div>
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `availability-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          <div className="space-y-2">
                            <div className="text-sm">{data.product_availability || 'N/A'}</div>
                            <div className="flex flex-wrap justify-center gap-1">
                              {data.is_prime && <Badge className="text-xs bg-blue-600">Prime</Badge>}
                              {data.is_best_seller && <Badge className="text-xs bg-orange-600">Best Seller</Badge>}
                              {data.is_amazon_choice && <Badge className="text-xs bg-green-600">Amazon's Choice</Badge>}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* MARCA E CATEGORIA */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Marca / Categoria
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `brand-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          <div className="space-y-1 text-sm">
                            <div><strong>Marca:</strong> {data.product_byline || 'N/A'}</div>
                            <div><strong>Categoria:</strong> {data.category?.name || 'N/A'}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* CARACTERÍSTICAS PRINCIPAIS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 w-32">
                      Características
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `features-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 w-1/4 min-w-[300px] align-top">
                          {data.about_product && data.about_product.length > 0 ? (
                            <ul className="text-sm space-y-2 text-left">
                              {data.about_product.map((feature, i) => (
                                <li key={`feature-${asin}-${i}`} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1 text-xs flex-shrink-0">•</span>
                                  <span className="leading-relaxed">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">N/A</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* DESCRIÇÃO */}
                  <tr className="border-b border-gray-100">
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 w-32">
                      Descrição
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `description-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 w-1/4 min-w-[300px] align-top">
                          <div className="text-sm text-left leading-relaxed whitespace-pre-wrap">
                            {data.product_description || 'Descrição não disponível'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ESPECIFICAÇÕES TÉCNICAS COMPLETAS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 w-32">
                      Especificações Técnicas
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `specs-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 w-1/4 min-w-[300px] align-top">
                          {data.product_information && Object.keys(data.product_information).length > 0 ? (
                            <div className="space-y-2 text-xs">
                              {Object.entries(data.product_information).map(([key, value]) => (
                                <div key={`spec-${asin}-${key}-${index}`} className="border-b border-gray-100 pb-1">
                                  <span className="font-medium text-gray-700">{key}:</span> 
                                  <span className="text-gray-600 ml-1">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">N/A</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* DETALHES DO PRODUTO */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Detalhes do Produto
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `details-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          {(data as any).product_details && Object.keys((data as any).product_details).length > 0 ? (
                            <div className="space-y-1 text-xs">
                              {Object.entries((data as any).product_details).map(([key, value]) => (
                                <div key={`detail-${asin}-${key}-${index}`}>
                                  <span className="font-medium text-blue-700">{key}:</span> 
                                  <span className="text-gray-600 ml-1">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">N/A</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* TODAS AS IMAGENS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Galeria de Imagens
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `images-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          {data.product_photos && data.product_photos.length > 0 ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-1">
                                {data.product_photos.map((photo, photoIdx) => (
                                  <img 
                                    key={`photo-${asin}-${photoIdx}-${index}`}
                                    src={photo} 
                                    alt={`Imagem ${photoIdx + 1}`}
                                    className="w-12 h-12 object-cover rounded border cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() => window.open(photo, '_blank')}
                                  />
                                ))}
                              </div>
                              <div className="text-xs text-gray-600">
                                Total: {data.product_photos.length} imagens
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">Sem imagens</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* VÍDEOS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Vídeos do Produto
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `videos-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          <div className="space-y-2">
                            {(data as any).has_video ? (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-green-600">✅ Tem vídeo</div>
                                {(data as any).product_videos && (data as any).product_videos.length > 0 && (
                                  <div className="space-y-1">
                                    {(data as any).product_videos.map((video: any, videoIdx: number) => (
                                      <div key={`video-${asin}-${videoIdx}-${index}`} className="text-xs border border-gray-200 p-2 rounded">
                                        <div className="font-medium">{video.title}</div>
                                        <div className="text-gray-600">
                                          Resolução: {video.video_width}x{video.video_height}
                                        </div>
                                        {video.thumbnail_url && (
                                          <img 
                                            src={video.thumbnail_url} 
                                            alt="Thumbnail" 
                                            className="w-16 h-12 object-cover rounded mt-1"
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {(data as any).video_thumbnail && (
                                  <img 
                                    src={(data as any).video_thumbnail} 
                                    alt="Video thumbnail" 
                                    className="w-20 h-16 object-cover rounded border"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 text-center">Sem vídeos</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* VARIAÇÕES DO PRODUTO */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Variações Disponíveis
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `variations-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          {(data as any).product_variations && Object.keys((data as any).product_variations).length > 0 ? (
                            <div className="space-y-2">
                              {Object.entries((data as any).product_variations).map(([variationType, variations]) => (
                                <div key={`vartype-${asin}-${variationType}-${index}`} className="border border-gray-200 p-2 rounded">
                                  <div className="text-xs font-medium text-purple-700 mb-1">
                                    {variationType.toUpperCase()}:
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {Array.isArray(variations) && variations.map((variation: any, varIdx: number) => (
                                      <div key={`var-${asin}-${varIdx}-${index}`} className="text-xs border border-gray-100 p-1 rounded">
                                        <div className="font-medium">{variation.value}</div>
                                        <div className="text-gray-600">ASIN: {variation.asin}</div>
                                        {variation.photo && (
                                          <img 
                                            src={variation.photo} 
                                            alt={variation.value}
                                            className="w-8 h-8 object-cover rounded mt-1"
                                          />
                                        )}
                                        <div className={`text-xs ${variation.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                          {variation.is_available ? '✅ Disponível' : '❌ Indisponível'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">Sem variações</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* BADGES E CERTIFICAÇÕES */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Badges e Certificações
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `badges-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {(data as any).is_best_seller && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                                  🏆 Best Seller
                                </span>
                              )}
                              {(data as any).is_amazon_choice && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  ⭐ Amazon's Choice
                                </span>
                              )}
                              {(data as any).is_prime && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  📦 Prime
                                </span>
                              )}
                              {(data as any).climate_pledge_friendly && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  🌱 Climate Pledge
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-xs">
                              {(data as any).has_aplus && (
                                <div className="text-green-600">✅ Tem conteúdo A+</div>
                              )}
                              {(data as any).has_brandstory && (
                                <div className="text-green-600">✅ Tem Brand Story</div>
                              )}
                              {(data as any).sales_volume && (
                                <div className="text-gray-600">Volume de vendas: {(data as any).sales_volume}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* EAN E CÓDIGOS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Códigos e Identificação
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `codes-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">ASIN:</span> {data.asin || 'N/A'}</div>
                            {data.product_information?.EAN && (
                              <div><span className="font-medium">EAN:</span> {data.product_information.EAN}</div>
                            )}
                            {data.product_information?.["Número do modelo"] && (
                              <div><span className="font-medium">Modelo:</span> {data.product_information["Número do modelo"]}</div>
                            )}
                            {data.product_information?.["Disponível para compra desde"] && (
                              <div><span className="font-medium">Disponível desde:</span> {data.product_information["Disponível para compra desde"]}</div>
                            )}
                            {(data as any).all_product_variations && Object.keys((data as any).all_product_variations).length > 0 && (
                              <div className="border-t border-gray-200 pt-2">
                                <span className="font-medium">ASINs das Variações:</span>
                                <div className="mt-1 space-y-1">
                                  {Object.entries((data as any).all_product_variations).map(([varAsin, varDetails]) => (
                                    <div key={`codes-var-${asin}-${varAsin}-${index}`} className="text-gray-600">
                                      {varAsin}: {Object.values(varDetails || {}).join(', ')}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* DISTRIBUIÇÃO DE AVALIAÇÕES */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Distribuição de Avaliações
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `rating-dist-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          {(data as any).rating_distribution && Object.keys((data as any).rating_distribution).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries((data as any).rating_distribution).map(([stars, count]) => (
                                <div key={`rating-${asin}-${stars}-${index}`} className="flex items-center justify-between text-xs">
                                  <span>{stars} ⭐</span>
                                  <span className="font-medium">{String(count)} avaliações</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center">N/A</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* RANKING E CATEGORIA */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      Ranking e Categoria
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `ranking-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200">
                          <div className="space-y-2 text-xs">
                            {data.category && (
                              <div>
                                <span className="font-medium">Categoria:</span> {data.category.name}
                              </div>
                            )}
                            {(data as any).category_path && (data as any).category_path.length > 0 && (
                              <div>
                                <span className="font-medium">Caminho:</span>
                                <div className="mt-1 space-y-1">
                                  {(data as any).category_path.map((cat: any, catIdx: number) => (
                                    <div key={`cat-${asin}-${catIdx}-${index}`} className="text-gray-600 pl-2">
                                      {catIdx + 1}. {cat.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {data.product_information?.["Ranking dos mais vendidos"] && (
                              <div className="border-t border-gray-200 pt-2">
                                <span className="font-medium text-purple-700">Ranking:</span>
                                <div className="text-gray-600 mt-1">
                                  {data.product_information["Ranking dos mais vendidos"]}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ENTREGA E VENDAS */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Entrega / Vendas
                      </div>
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `delivery-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          <div className="space-y-1 text-sm">
                            <div><strong>Entrega:</strong> {data.delivery || 'N/A'}</div>
                            <div><strong>Vendas:</strong> {data.sales_volume || 'N/A'}</div>
                            <div><strong>Ofertas:</strong> {data.product_num_offers || 0}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* LINK PARA AMAZON */}
                  <tr>
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver Produto
                      </div>
                    </td>
                    {results.map((product, index) => {
                      const data = product.data || {};
                      const asin = data.asin || asins[index] || `produto-${index}`;
                      const uniqueKey = `link-${asin}-${index}-${Date.now()}`;
                      return (
                        <td key={uniqueKey} className="p-4 border-r border-gray-200 text-center">
                          {data.product_url ? (
                            <a 
                              href={data.product_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver no Amazon
                            </a>
                          ) : (
                            <div className="text-sm text-gray-500">N/A</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
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