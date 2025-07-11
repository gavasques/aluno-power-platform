// Provider Testing Component - Comprehensive testing with image upload and real-time results

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  TestTube, 
  Upload, 
  Image, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  Eye,
  FileText
} from "lucide-react";
import { ProviderTestingProps, TestConfiguration, PromptPlaceholder } from '../types';
import { VISION_MODELS, IMAGE_GENERATION_MODELS } from '../constants';

export function ProviderTesting({ 
  configuration, 
  onTest, 
  isLoading, 
  lastResult 
}: ProviderTestingProps) {
  const [testPrompt, setTestPrompt] = useState('Olá! Como você está hoje?');
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, any>>({});
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportsVision = VISION_MODELS.includes(configuration.model);
  const isImageGeneration = IMAGE_GENERATION_MODELS.includes(configuration.model);

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    setReferenceImages(prev => [...prev, ...imageFiles]);
  };

  // Remove image
  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update placeholder value
  const updatePlaceholderValue = (key: string, value: any) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  // Generate final prompt with placeholders
  const generateFinalPrompt = () => {
    let finalPrompt = configuration.promptTemplate || testPrompt;
    
    configuration.placeholders?.forEach(placeholder => {
      const value = placeholderValues[placeholder.key] || placeholder.defaultValue || '';
      finalPrompt = finalPrompt.replace(
        new RegExp(`{{${placeholder.key}}}`, 'g'), 
        value
      );
    });
    
    return finalPrompt;
  };

  // Run test
  const runTest = async () => {
    const testConfig: TestConfiguration = {
      prompt: generateFinalPrompt(),
      referenceImages,
      placeholderValues,
    };
    
    await onTest(testConfig);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Test Configuration Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="w-5 h-5" />
            Teste de Configuração
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Badge variant="outline">{configuration.provider}</Badge>
              <span>•</span>
              <Badge variant="outline">{configuration.model}</Badge>
            </div>
            {supportsVision && (
              <Badge className="bg-blue-100 text-blue-800">
                <Eye className="w-3 h-3 mr-1" />
                Suporte a Visão
              </Badge>
            )}
            {isImageGeneration && (
              <Badge className="bg-purple-100 text-purple-800">
                <Image className="w-3 h-3 mr-1" />
                Geração de Imagem
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Placeholder Values */}
      {configuration.placeholders && configuration.placeholders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Valores dos Placeholders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configuration.placeholders.map((placeholder: PromptPlaceholder) => (
              <div key={placeholder.key} className="space-y-2">
                <Label className="text-sm font-medium">
                  {placeholder.label}
                  {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {placeholder.description && (
                  <p className="text-xs text-muted-foreground">{placeholder.description}</p>
                )}
                
                {placeholder.type === 'textarea' ? (
                  <Textarea
                    placeholder={placeholder.defaultValue || `Digite ${placeholder.label.toLowerCase()}`}
                    value={placeholderValues[placeholder.key] || ''}
                    onChange={(e) => updatePlaceholderValue(placeholder.key, e.target.value)}
                    className="min-h-[80px]"
                  />
                ) : placeholder.type === 'number' ? (
                  <Input
                    type="number"
                    placeholder={placeholder.defaultValue || '0'}
                    value={placeholderValues[placeholder.key] || ''}
                    onChange={(e) => updatePlaceholderValue(placeholder.key, e.target.value)}
                  />
                ) : placeholder.type === 'select' && placeholder.options ? (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={placeholderValues[placeholder.key] || ''}
                    onChange={(e) => updatePlaceholderValue(placeholder.key, e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {placeholder.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder={placeholder.defaultValue || `Digite ${placeholder.label.toLowerCase()}`}
                    value={placeholderValues[placeholder.key] || ''}
                    onChange={(e) => updatePlaceholderValue(placeholder.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Test Prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {configuration.promptTemplate ? 'Prompt Final (com Placeholders)' : 'Prompt de Teste'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configuration.promptTemplate ? (
            <div className="space-y-2">
              <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap font-mono">
                {generateFinalPrompt()}
              </div>
              <p className="text-xs text-muted-foreground">
                Este é o prompt final que será enviado para o modelo, com todos os placeholders substituídos.
              </p>
            </div>
          ) : (
            <Textarea
              placeholder="Digite seu prompt de teste aqui..."
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Image Upload (for vision models) */}
      {supportsVision && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagens de Referência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm">
                  <p>Arraste imagens aqui ou</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Selecionar Imagens
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG até 10MB cada
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {/* Uploaded Images */}
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {referenceImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Button */}
      <div className="flex justify-center">
        <Button
          onClick={runTest}
          disabled={isLoading || (!testPrompt && !configuration.promptTemplate)}
          size="lg"
          className="px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Executar Teste
            </>
          )}
        </Button>
      </div>

      {/* Test Results */}
      {lastResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {lastResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              Resultado do Teste
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {lastResult.executionTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastResult.executionTime}ms
                </div>
              )}
              {lastResult.cost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${lastResult.cost.toFixed(6)}
                </div>
              )}
              {lastResult.usage && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {lastResult.usage.totalTokens} tokens
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lastResult.success ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Resposta:</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {lastResult.response}
                  </div>
                </div>
                
                {lastResult.usage && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tokens de Entrada</p>
                      <p className="text-lg font-semibold">{lastResult.usage.promptTokens}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tokens de Saída</p>
                      <p className="text-lg font-semibold">{lastResult.usage.completionTokens}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold">{lastResult.usage.totalTokens}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600">Erro:</Label>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {lastResult.error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}