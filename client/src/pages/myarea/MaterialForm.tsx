
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMaterials } from '@/contexts/MaterialsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Material, MaterialType } from '@/types/material';

const materialSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  typeId: z.string().min(1, 'Selecione um tipo de material'),
  accessLevel: z.enum(['public', 'restricted']),
  fileUrl: z.string().optional(),
  externalUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  embedCode: z.string().optional(),
  tags: z.string(),
  technicalInfo: z.object({
    duration: z.string().optional(),
    dimensions: z.string().optional(),
    format: z.string().optional(),
    quality: z.string().optional(),
  }).optional()
});

type MaterialFormData = z.infer<typeof materialSchema>;

const MaterialForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { materials, materialTypes, addMaterial, updateMaterial } = useMaterials();
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  
  const isEditing = id && id !== 'novo';
  const material = isEditing ? materials.find(m => m.id === id) : null;

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: '',
      description: '',
      typeId: '',
      accessLevel: 'public',
      fileUrl: '',
      externalUrl: '',
      embedCode: '',
      tags: '',
      technicalInfo: {
        duration: '',
        dimensions: '',
        format: '',
        quality: ''
      }
    }
  });

  useEffect(() => {
    if (material) {
      form.reset({
        title: material.title,
        description: material.description,
        typeId: material.type.id,
        accessLevel: material.accessLevel,
        fileUrl: material.fileUrl || '',
        externalUrl: material.externalUrl || '',
        embedCode: material.embedCode || '',
        tags: material.tags.join(', '),
        technicalInfo: material.technicalInfo || {}
      });
      setSelectedType(material.type);
    }
  }, [material, form]);

  const handleTypeChange = (typeId: string) => {
    const type = materialTypes.find(t => t.id === typeId);
    setSelectedType(type || null);
    form.setValue('typeId', typeId);
  };

  const onSubmit = (data: MaterialFormData) => {
    const type = materialTypes.find(t => t.id === data.typeId);
    if (!type) return;

    const materialData: Omit<Material, 'id' | 'uploadDate' | 'lastModified' | 'downloadCount' | 'viewCount'> = {
      title: data.title,
      description: data.description,
      type,
      accessLevel: data.accessLevel,
      fileUrl: data.fileUrl || undefined,
      externalUrl: data.externalUrl || undefined,
      embedCode: data.embedCode || undefined,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      uploadedBy: { id: '1', name: 'Usuario' },
      technicalInfo: data.technicalInfo
    };

    if (isEditing && material) {
      updateMaterial(material.id, materialData);
    } else {
      addMaterial(materialData);
    }

    navigate('/minha-area/materiais');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/minha-area/materiais">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Material' : 'Novo Material'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do material' : 'Adicione um novo material ao seu repositório'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border border-border">
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título do material" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o conteúdo do material"
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Material</FormLabel>
                        <Select onValueChange={handleTypeChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name} - {type.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Acesso</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Público</SelectItem>
                            <SelectItem value="restricted">Restrito</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite as tags separadas por vírgula"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Separe as tags com vírgula (ex: react, tutorial, programação)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Campos específicos do tipo */}
              {selectedType && (
                <Card className="bg-white border border-border">
                  <CardHeader>
                    <CardTitle>Configurações do {selectedType.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedType.allowsUpload && (
                      <FormField
                        control={form.control}
                        name="fileUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Arquivo</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Faça upload do arquivo e cole a URL aqui
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedType.allowsUrl && (
                      <FormField
                        control={form.control}
                        name="externalUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Externa</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              URL externa para o conteúdo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedType.name === 'Embed' && (
                      <FormField
                        control={form.control}
                        name="embedCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código Embed</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Cole o código HTML embed aqui"
                                className="min-h-24 font-mono text-sm"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-white border border-border">
                <CardHeader>
                  <CardTitle>Informações Técnicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="technicalInfo.format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: PDF, MP4, PNG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technicalInfo.quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualidade</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: HD, 1080p, Alta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technicalInfo.duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 10:30, 1h 20min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technicalInfo.dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensões</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 1920x1080, A4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white border border-border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar Material' : 'Salvar Material'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/minha-area/materiais')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MaterialForm;
