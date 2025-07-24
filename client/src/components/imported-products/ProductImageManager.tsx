import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, X, ChevronUp, ChevronDown, Image as ImageIcon, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ProductImage {
  id: string;
  productId: string;
  filename: string;
  originalName: string;
  url: string;
  position: number;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ProductImageManagerProps {
  productId: string;
  className?: string;
}

export const ProductImageManager = ({ productId, className = "" }: ProductImageManagerProps) => {
  const { user } = useAuth();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar imagens do produto
  const loadImages = async () => {
    if (!productId) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/product-images/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  useEffect(() => {
    loadImages();
  }, [productId]);

  // Upload de nova imagem
  const handleUpload = async (file: File) => {
    console.log('🚀 Iniciando upload para produto:', productId);
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ Token não encontrado');
      return;
    }

    // Validações no frontend
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Use apenas arquivos JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    if (images.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 10 imagens por produto",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(file.name);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', productId);
      formData.append('position', (images.length + 1).toString());

      console.log('📡 Enviando requisição para /api/product-images');
      const response = await fetch('/api/product-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📨 Resposta recebida:', response.status);
      const data = await response.json();
      console.log('📄 Dados da resposta:', data);

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Imagem enviada com sucesso! Compressão: ${data.compressionRatio || 'N/A'}`,
        });
        await loadImages();
      } else {
        console.error('❌ Erro no upload:', data);
        throw new Error(data.message || 'Erro no upload');
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  // Mover imagem (reordenar)
  const handleMove = async (imageId: string, direction: 'up' | 'down') => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/product-images/${imageId}/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (response.ok) {
        await loadImages();
        toast({
          title: "Sucesso",
          description: "Ordem das imagens atualizada",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao mover imagem');
      }
    } catch (error: any) {
      console.error('Erro ao mover imagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao reordenar imagem",
        variant: "destructive",
      });
    }
  };

  // Excluir imagem
  const handleDelete = async (imageId: string, imageName: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (!confirm(`Tem certeza que deseja excluir a imagem "${imageName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/product-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadImages();
        toast({
          title: "Sucesso",
          description: "Imagem removida com sucesso",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir imagem');
      }
    } catch (error: any) {
      console.error('Erro ao excluir imagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir imagem",
        variant: "destructive",
      });
    }
  };

  // Download de imagem
  const handleDownload = async (imageId: string, imageName: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/product-images/${imageId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Criar blob e fazer download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sucesso",
          description: "Download iniciado",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro no download');
      }
    } catch (error: any) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer download",
        variant: "destructive",
      });
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    console.log('🖱️ Triggerando input de arquivo...');
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('📁 Arquivos selecionados:', files?.length || 0);
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        console.log('📤 Iniciando upload de:', file.name, 'Tamanho:', file.size);
        handleUpload(file);
      });
    }
    // Clear input for next selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fotos do Produto</h3>
          <p className="text-sm text-gray-600">
            Gerencie as imagens do produto ({images.length}/10)
          </p>
        </div>
        <Button
          type="button"
          onClick={triggerFileInput}
          disabled={images.length >= 10 || isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Foto
        </Button>
      </div>

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Requisitos das imagens:</p>
            <ul className="mt-1 text-blue-700 space-y-1">
              <li>• Máximo 10 fotos por produto</li>
              <li>• Tamanho máximo: 2MB por arquivo</li>
              <li>• Dimensões máximas: 2000x3000 pixels</li>
              <li>• Formatos: JPG, JPEG, PNG, WebP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compression Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Upload className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">⚠️ Informações sobre compressão:</p>
            <ul className="mt-1 text-amber-700 space-y-1">
              <li>• As imagens são automaticamente comprimidas para economizar armazenamento</li>
              <li>• A qualidade pode ser reduzida em até 80% do original</li>
              <li>• Não salvamos as fotos originais, apenas as versões comprimidas</li>
              <li>• Essas fotos são destinadas apenas para visualização simples</li>
              <li>• Use o botão de download para obter a versão comprimida</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadingImage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-yellow-600 animate-pulse" />
            <p className="text-sm text-yellow-800">
              Enviando "{uploadingImage}"...
            </p>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={image.url}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  #{image.position}
                </div>
              </div>

              {/* Image Info */}
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={image.originalName}>
                  {image.originalName}
                </p>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>{image.width}x{image.height}px</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleMove(image.id, 'up')}
                      disabled={index === 0}
                      className="p-1 h-7 w-7"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleMove(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 h-7 w-7"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>

                    {/* Download */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(image.id, image.originalName)}
                      className="p-1 h-7 w-7"
                      title="Fazer download"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Delete */}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id, image.originalName)}
                    className="p-1 h-7 w-7"
                    title="Excluir imagem"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-500 mb-4">
            Clique em "Adicionar Foto" para começar
          </p>
          <Button
            type="button"
            onClick={triggerFileInput}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Escolher Arquivo
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;