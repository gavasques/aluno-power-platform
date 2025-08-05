import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Download, Upload, Zap, Star, ArrowUp, Image as ImageIcon, Clock, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { UltraEnhancePresentationProps } from './types';

export const UltraEnhancePresentation = ({
  selectedFile,
  previewUrl,
  isProcessing,
  progress,
  result,
  parameters,
  error,
  fileInputRef,
  handleFileSelect,
  handleDragOver,
  handleDrop,
  handleProcessImage,
  handleDownloadImage,
  handleParameterChange,
  resetTool
}: UltraEnhancePresentationProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Ultra Melhorador PRO</h1>
        </div>
        <p className="text-muted-foreground">
          Melhore e amplie suas imagens com IA de última geração
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <CreditCard className="w-3 h-3 mr-1" />
            8 créditos por uso
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para o melhoramento da imagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label>Selecionar Imagem</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Clique ou arraste uma imagem aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP até 10MB
                  </p>
                </div>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTool}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upscale_factor">Fator de Ampliação</Label>
                <Select
                  value={parameters.upscale_factor.toString()}
                  onValueChange={(value) => handleParameterChange('upscale_factor', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2x - Dobro do tamanho</SelectItem>
                    <SelectItem value="3">3x - Triplo do tamanho</SelectItem>
                    <SelectItem value="4">4x - Quatro vezes maior</SelectItem>
                    <SelectItem value="6">6x - Seis vezes maior</SelectItem>
                    <SelectItem value="8">8x - Oito vezes maior</SelectItem>
                    <SelectItem value="10">10x - Dez vezes maior</SelectItem>
                    <SelectItem value="12">12x - Doze vezes maior</SelectItem>
                    <SelectItem value="16">16x - Dezesseis vezes maior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato da Saída</Label>
                <Select
                  value={parameters.format}
                  onValueChange={(value) => handleParameterChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPG">JPG - Menor tamanho</SelectItem>
                    <SelectItem value="PNG">PNG - Melhor qualidade</SelectItem>
                    <SelectItem value="WEBP">WEBP - Balanceado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Process Button */}
            <Button
              onClick={handleProcessImage}
              disabled={!selectedFile || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <ButtonLoader />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Melhorar Imagem
                </>
              )}
            </Button>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Melhorando imagem... {progress}%
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Preview/Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Visualização
            </CardTitle>
            <CardDescription>
              Prévia da imagem original e resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewUrl && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagem Original</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-60 object-contain"
                    />
                  </div>
                </div>

                {result && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Imagem Melhorada
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={`data:image/${parameters.format.toLowerCase()};base64,${result.processedImageData}`}
                        alt="Enhanced"
                        className="w-full h-auto max-h-60 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Melhoramento concluído
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        {(result.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadImage}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Imagem Melhorada
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!previewUrl && (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma imagem para ver a visualização</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 