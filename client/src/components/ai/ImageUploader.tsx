import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUploaded: (imageData: { id: string; url: string; name: string }) => void;
  uploadedImage: { id: string; url: string; name: string } | null;
}

export function ImageUploader({ onImageUploaded, uploadedImage }: ImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use PNG, JPG, JPEG ou WEBP.';
    }

    // Check file size (25MB max)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Máximo 25MB permitido.';
    }

    // Check minimum dimensions (64x64)
    return new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 64 || img.height < 64) {
          resolve('Imagem muito pequena. Mínimo 64x64 pixels.');
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve('Erro ao processar a imagem.');
      img.src = URL.createObjectURL(file);
    }) as any;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Show immediate local preview while uploading
      const localUrl = URL.createObjectURL(file);
      onImageUploaded({
        id: 'local-preview',
        url: localUrl,
        name: file.name
      });

      // Validate file
      const validationError = await validateFile(file);
      if (validationError) {
        toast({
          title: "Erro de validação",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch('/api/image-upscale/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              imageData,
              fileName: file.name,
              fileSize: file.size,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro no upload');
          }

          const data = await response.json();
          
          // Update with real server ID, keeping the same preview
          onImageUploaded({
            id: data.imageId,
            url: localUrl, // Keep local URL for instant display
            name: file.name,
          });

          toast({
            title: "Upload realizado!",
            description: `${file.name} carregado com sucesso`,
          });

        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Erro no upload",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    onImageUploaded({ id: '', url: '', name: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  if (uploadedImage && uploadedImage.url) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden border-2 border-border">
          <img
            src={uploadedImage.url}
            alt={uploadedImage.name}
            className="w-full h-64 object-contain bg-muted"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleChangeImage}
                disabled={isUploading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Trocar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {uploadedImage.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div>
                <p className="text-lg font-medium">Fazendo upload...</p>
                <p className="text-sm text-muted-foreground">
                  Processando sua imagem
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, JPEG, WEBP até 25MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-green-500 rounded-full" />
          <span>Formatos: PNG, JPG, JPEG, WEBP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-green-500 rounded-full" />
          <span>Tamanho máximo: 25MB</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-green-500 rounded-full" />
          <span>Resolução mínima: 64x64 pixels</span>
        </div>
      </div>
    </div>
  );
}