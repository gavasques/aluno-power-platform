
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Image } from "lucide-react";
import { PromptImage } from "@/types/prompt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptImageUploadProps {
  images: PromptImage[];
  onImagesChange: (images: PromptImage[]) => void;
  maxImages?: number;
}

export function PromptImageUpload({ images, onImagesChange, maxImages = 10 }: PromptImageUploadProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [newImageType, setNewImageType] = useState<'before' | 'after' | 'general'>('general');

  const addImage = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      const newImage: PromptImage = {
        id: Date.now().toString(),
        url: newImageUrl.trim(),
        alt: newImageAlt.trim() || `Imagem ${newImageType === 'before' ? 'Antes' : newImageType === 'after' ? 'Depois' : 'Geral'}`,
        type: newImageType
      };
      
      onImagesChange([...images, newImage]);
      setNewImageUrl("");
      setNewImageAlt("");
      setNewImageType('general');
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'before': return 'Antes';
      case 'after': return 'Depois';
      case 'general': return 'Geral';
      default: return 'Geral';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-red-100 text-red-800 border-red-200';
      case 'after': return 'bg-green-100 text-green-800 border-green-200';
      case 'general': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Imagens do Prompt</Label>
      
      {images.length < maxImages && (
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Descrição da Imagem</Label>
              <Input
                id="imageAlt"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                placeholder="Descrição da imagem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageType">Tipo da Imagem</Label>
              <Select value={newImageType} onValueChange={(value: 'before' | 'after' | 'general') => setNewImageType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Imagem Antes</SelectItem>
                  <SelectItem value="after">Imagem Depois</SelectItem>
                  <SelectItem value="general">Imagem Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="button" onClick={addImage} size="sm" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Imagem
          </Button>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <Label>Imagens Adicionadas ({images.length})</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={getTypeBadgeColor(image.type)}>
                    {getTypeLabel(image.type)}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <p className="text-xs truncate">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  );
}
