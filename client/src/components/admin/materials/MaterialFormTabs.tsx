import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import type { MaterialFormData } from './MaterialFormTypes';
import type { MaterialType } from '@shared/schema';
import { useMaterialCategories, type MaterialCategory } from '@/hooks/useMaterialCategories';

interface MaterialFormTabsProps {
  formData: MaterialFormData;
  setFormData: React.Dispatch<React.SetStateAction<MaterialFormData>>;
  materialTypes: MaterialType[];
  currentTag: string;
  setCurrentTag: (value: string) => void;
}

export const MaterialFormTabs: React.FC<MaterialFormTabsProps> = ({
  formData,
  setFormData,
  materialTypes,
  currentTag,
  setCurrentTag,
}) => {
  const { categories: materialCategories } = useMaterialCategories();
  const selectedType = materialTypes.find(t => t.id.toString() === formData.typeId);

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }));
    }
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="metadata">Metadados</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do material"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Material *</Label>
            <Select value={formData.typeId} onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria do Material</Label>
          <Select value={formData.categoryId || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma categoria</SelectItem>
              {materialCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição do material"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessLevel">Nível de Acesso</Label>
          <Select 
            value={formData.accessLevel} 
            onValueChange={(value: "public" | "restricted") => 
              setFormData(prev => ({ ...prev, accessLevel: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Público</SelectItem>
              <SelectItem value="restricted">Restrito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        {selectedType && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">{selectedType.name}</h4>
            <p className="text-sm text-blue-700">{selectedType.description}</p>
          </div>
        )}

        {/* File Upload Content */}
        {selectedType?.allowsUpload && (
          <div className="space-y-4">
            <h4 className="font-medium">Upload de Arquivo</h4>
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.fileName && (
                <p className="text-sm text-gray-600">Arquivo selecionado: {formData.fileName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileUrl">URL do Arquivo</Label>
              <Input
                id="fileUrl"
                value={formData.fileUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                placeholder="https://exemplo.com/arquivo.pdf"
              />
            </div>
          </div>
        )}

        {/* External URL Content */}
        {selectedType?.allowsUrl && (
          <div className="space-y-4">
            <h4 className="font-medium">Link Externo</h4>
            <div className="space-y-2">
              <Label htmlFor="externalUrl">URL Externa</Label>
              <Input
                id="externalUrl"
                value={formData.externalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                placeholder="https://exemplo.com"
              />
            </div>
          </div>
        )}

        {/* Embed Content */}
        {selectedType?.allowsEmbed && (
          <div className="space-y-4">
            <h4 className="font-medium">Conteúdo Incorporado</h4>
            <div className="space-y-2">
              <Label htmlFor="embedCode">Código de Incorporação</Label>
              <Textarea
                id="embedCode"
                value={formData.embedCode}
                onChange={(e) => setFormData(prev => ({ ...prev, embedCode: e.target.value }))}
                placeholder="<iframe src='...'></iframe>"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embedUrl">URL para Incorporação</Label>
              <Input
                id="embedUrl"
                value={formData.embedUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, embedUrl: e.target.value }))}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>
        )}

        {/* Video Content */}
        {selectedType?.contentType === 'video' && (
          <div className="space-y-4">
            <h4 className="font-medium">Conteúdo de Vídeo</h4>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://exemplo.com/video.mp4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duração (segundos)</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  value={formData.videoDuration || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    videoDuration: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoThumbnail">Thumbnail</Label>
                <Input
                  id="videoThumbnail"
                  value={formData.videoThumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoThumbnail: e.target.value }))}
                  placeholder="https://exemplo.com/thumbnail.jpg"
                />
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="metadata" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Digite uma tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => removeTag(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {formData.fileType && (
            <div className="space-y-2">
              <Label htmlFor="fileType">Tipo de Arquivo</Label>
              <Input
                id="fileType"
                value={formData.fileType}
                onChange={(e) => setFormData(prev => ({ ...prev, fileType: e.target.value }))}
                placeholder="application/pdf"
              />
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};