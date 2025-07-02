import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILE_VALIDATION } from "@/config/upscale";
import type { UploadedImage } from "@/types/upscale";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  uploadedImage: UploadedImage | null;
  onRemoveImage: () => void;
  isUploading: boolean;
}

const UploadedImageDisplay = ({ 
  image, 
  onRemove, 
  onChange, 
  isUploading 
}: {
  image: UploadedImage;
  onRemove: () => void;
  onChange: () => void;
  isUploading: boolean;
}) => (
  <div className="space-y-4">
    <div className="relative rounded-lg overflow-hidden border-2 border-border">
      <img
        src={image.url}
        alt={image.name}
        className="w-full h-64 object-contain bg-muted"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onChange}
            disabled={isUploading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Trocar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{image.name}</p>
    </div>
  </div>
);

const FileUploadZone = ({
  isDragging,
  isUploading,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick
}: {
  isDragging: boolean;
  isUploading: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary",
      isUploading && "pointer-events-none opacity-50"
    )}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-4">
      {isUploading ? (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div>
            <p className="text-lg font-medium">Fazendo upload...</p>
            <p className="text-sm text-muted-foreground">Processando sua imagem</p>
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
);

const ValidationInfo = () => (
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
);

export function ImageUploader({ 
  onFileSelect, 
  uploadedImage, 
  onRemoveImage, 
  isUploading 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleRemoveWithCleanup = () => {
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedImage?.url) {
    return (
      <UploadedImageDisplay
        image={uploadedImage}
        onRemove={handleRemoveWithCleanup}
        onChange={handleClick}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_VALIDATION.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <FileUploadZone
        isDragging={isDragging}
        isUploading={isUploading}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      />

      <ValidationInfo />
    </div>
  );
}