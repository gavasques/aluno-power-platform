import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Upload, 
  Trash2, 
  FileJson, 
  Eye, 
  ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { TestConnectionCardProps } from '../types';

/**
 * TEST CONNECTION CARD - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para teste de conexão
 * Responsabilidade única: Interface de teste com upload de imagens e resultados
 */
export function TestConnectionCard({
  formData,
  testState,
  imageState,
  onTestStateUpdate,
  onImageUpload,
  onRemoveImage,
  onClearImages,
  onRunTest,
  isLoading
}: TestConnectionCardProps) {

  const hasVisionSupport = formData.provider === 'openai' || 
                          formData.provider === 'anthropic' || 
                          formData.provider === 'gemini' ||
                          (formData.provider === 'xai' && formData.enableImageUnderstanding);

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRunTest = async () => {
    if (!testState.prompt.trim()) {
      return;
    }

    let imageData: string | undefined;
    let referenceImages: Array<{ data: string; filename: string }> = [];

    // Convert images to base64 if vision is supported
    if (hasVisionSupport && imageState.referenceImages.length > 0) {
      try {
        referenceImages = await Promise.all(
          imageState.referenceImages.map(async (img) => ({
            data: await convertImageToBase64(img.file),
            filename: img.file.name
          }))
        );
        
        // Use first image as main image for backward compatibility
        if (referenceImages.length > 0) {
          imageData = referenceImages[0].data;
        }
      } catch (error) {
        console.error('Error converting images:', error);
      }
    }

    onRunTest();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Teste de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Configuration */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Configuração Atual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Provedor:</span>
              <Badge className="ml-2">{formData.provider}</Badge>
            </div>
            <div>
              <span className="font-medium">Modelo:</span>
              <span className="ml-2 text-gray-600">{formData.model || 'Não selecionado'}</span>
            </div>
            <div>
              <span className="font-medium">Temperatura:</span>
              <span className="ml-2 text-gray-600">{formData.temperature}</span>
            </div>
            <div>
              <span className="font-medium">Max Tokens:</span>
              <span className="ml-2 text-gray-600">{formData.maxTokens}</span>
            </div>
          </div>
        </div>

        {/* Test Prompt */}
        <div className="space-y-2">
          <Label htmlFor="testPrompt">Prompt de Teste</Label>
          <Textarea
            id="testPrompt"
            placeholder="Digite sua mensagem de teste aqui..."
            value={testState.prompt}
            onChange={(e) => onTestStateUpdate('prompt', e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Image Upload for Vision Models */}
        {hasVisionSupport && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Imagens de Referência (Opcional)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = onImageUpload;
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                {imageState.referenceImages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearImages}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {imageState.referenceImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageState.referenceImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveImage(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {img.file.name.length > 15 
                        ? `${img.file.name.substring(0, 12)}...` 
                        : img.file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Alert>
              <ImageIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Suporte a Visão:</strong> Este modelo pode analisar imagens. 
                Faça upload de imagens para teste de análise visual.
                Formatos suportados: JPG, PNG, GIF, WebP (máx. 20MB cada).
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Test Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleRunTest}
            disabled={isLoading || !testState.prompt.trim() || !formData.model}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
        </div>

        {/* Test Results */}
        {(testState.response || testState.requestSent || testState.responseReceived) && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Resultados do Teste</h4>
            
            {/* Response */}
            {testState.response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Resposta</Label>
                  {testState.response.startsWith('Erro:') ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className={`p-4 border rounded-lg text-sm ${
                  testState.response.startsWith('Erro:') 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                  <pre className="whitespace-pre-wrap font-mono">
                    {testState.response}
                  </pre>
                </div>
              </div>
            )}

            {/* Request Sent */}
            {testState.requestSent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Requisição Enviada</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([testState.requestSent], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = globalThis.document.createElement('a');
                      a.href = url;
                      a.download = 'request.json';
                      globalThis.document.body.appendChild(a);
                      a.click();
                      globalThis.document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 text-slate-700 text-sm font-mono overflow-x-auto max-h-40">
                  <pre>{testState.requestSent}</pre>
                </div>
              </div>
            )}

            {/* Response Received */}
            {testState.responseReceived && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Resposta Recebida</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([testState.responseReceived], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = globalThis.document.createElement('a');
                      a.href = url;
                      a.download = 'response.json';
                      globalThis.document.body.appendChild(a);
                      a.click();
                      globalThis.document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-900 text-blue-400 text-sm font-mono overflow-x-auto max-h-60">
                  <pre>{testState.responseReceived}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help */}
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Dica:</strong> Use este teste para verificar se as configurações estão funcionando corretamente. 
            Os dados de requisição/resposta podem ser úteis para debug de problemas de integração.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}