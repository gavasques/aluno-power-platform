import { useState, useRef } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ProcessingResult {
  originalImage: string;
  processedImage: string;
  processingTime: number;
  cost: number;
}

export default function AmazonProductPhotography() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG, WebP)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB
      setError('O arquivo deve ter no máximo 25MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simular seleção de arquivo
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/agents/amazon-product-photography/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao processar imagem');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Imagem processada com sucesso!",
        description: `Processamento concluído em ${data.processingTime}s. Custo: $${data.cost.toFixed(4)}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!result?.processedImage) return;

    const link = document.createElement('a');
    link.href = result.processedImage;
    link.download = `amazon-product-professional-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/agents">
            <Button variant="ghost" className="mb-6 hover:bg-white/80 dark:hover:bg-slate-800/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Agentes
            </Button>
          </Link>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Amazon Product Photography
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Transforme suas imagens em fotografias profissionais para Amazon
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Sparkles className="h-3 w-3 mr-1" />
                GPT-Image-1
              </Badge>
              <Badge variant="outline">
                Processamento de Imagens
              </Badge>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload da Imagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Selecione uma imagem de produto</p>
                      <p className="text-sm text-slate-500">
                        Arraste e solte aqui ou clique para selecionar
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, JPEG, WebP (máx. 25MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview!}
                        alt="Preview"
                        className="w-full h-64 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={resetForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p><strong>Arquivo:</strong> {selectedFile.name}</p>
                      <p><strong>Tamanho:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Fotografia Profissional
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Faça o upload da imagem</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Selecione uma foto do seu produto em qualquer formato
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Processamento IA</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Nossa IA transforma a imagem em fotografia profissional
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Download do resultado</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Baixe sua imagem otimizada para Amazon
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Garantias do Processamento
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Produto mantido 100% idêntico</li>
                    <li>• Fundo branco profissional</li>
                    <li>• Iluminação de estúdio</li>
                    <li>• Resolução alta para Amazon</li>
                    <li>• Sombra natural realista</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Imagem Processada com Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div>
                    <Label className="text-base font-medium mb-2 block">Imagem Original</Label>
                    <img
                      src={result.originalImage}
                      alt="Original"
                      className="w-full h-64 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg border"
                    />
                  </div>

                  {/* Processed */}
                  <div>
                    <Label className="text-base font-medium mb-2 block">Fotografia Profissional</Label>
                    <img
                      src={result.processedImage}
                      alt="Processada"
                      className="w-full h-64 object-contain bg-white rounded-lg border"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold">{result.processingTime}s</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Tempo</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold">${result.cost.toFixed(4)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Custo</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold">1:1</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Proporção</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-lg font-semibold">2000px</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Resolução</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={downloadImage} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Imagem
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(result.processedImage, '_blank')}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    <Camera className="h-4 w-4 mr-2" />
                    Nova Imagem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}