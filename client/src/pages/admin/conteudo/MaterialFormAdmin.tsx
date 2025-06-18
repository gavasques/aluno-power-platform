import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMaterials } from '@/contexts/MaterialsContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Material, MaterialType } from '@/types/material';

const fileTypesWithUpload = [
  "PDF",
  "Vídeos",
  "Planilhas",
  "Documentos",
  "Imagens",
];

const fileAcceptMapping: Record<string, string> = {
  PDF: ".pdf",
  Vídeos: "video/*",
  Planilhas: ".xls,.xlsx,.ods,.csv",
  Documentos: ".doc,.docx,.pdf,.odt,.txt",
  Imagens: "image/*",
};

const materialSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
  typeId: z.string({ required_error: "Selecione o tipo de material." }),
  categoryId: z.string().optional(),
  accessLevel: z.enum(['public', 'restricted'], { required_error: "Selecione o nível de acesso." }),
  tags: z.string().optional(),
  externalUrl: z.string().url({ message: "URL externa inválida." }).optional().or(z.literal('')),
  embedCode: z.string().optional(),
  fileUrl: z.string().url({ message: "URL do arquivo inválida." }).optional().or(z.literal('')),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const MaterialFormAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { materials, addMaterial, updateMaterial, materialTypes } = useMaterials();
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [tempFileUrl, setTempFileUrl] = useState<string | null>(null);

  const isEditing = Boolean(id && id !== 'novo');
  const materialToEdit = isEditing ? materials.find(m => m.id === id) : undefined;

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: '',
      description: '',
      typeId: '',
      accessLevel: 'public',
      tags: '',
      externalUrl: '',
      embedCode: '',
      fileUrl: '',
    },
  });

  useEffect(() => {
    if (isEditing && materialToEdit) {
      form.reset({
        title: materialToEdit.title,
        description: materialToEdit.description,
        typeId: materialToEdit.type.id,
        accessLevel: materialToEdit.accessLevel,
        tags: materialToEdit.tags.join(', '),
        externalUrl: materialToEdit.externalUrl || '',
        embedCode: materialToEdit.embedCode || '',
        fileUrl: materialToEdit.fileUrl || '',
      });
      setSelectedType(materialToEdit.type);
    }
  }, [isEditing, materialToEdit, form]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'typeId') {
        setSelectedType(materialTypes.find(t => t.id === value.typeId) || null);
        form.setValue("fileUrl", "");
        setTempFileUrl(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, materialTypes]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (tempFileUrl) {
        URL.revokeObjectURL(tempFileUrl);
      }
      const url = URL.createObjectURL(file);
      setTempFileUrl(url);
      form.setValue("fileUrl", url, { shouldValidate: true });
    }
  }

  const onSubmit = (data: MaterialFormValues) => {
    const materialData = {
      title: data.title,
      description: data.description,
      type: materialTypes.find(t => t.id === data.typeId)!,
      accessLevel: data.accessLevel,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      externalUrl: data.externalUrl,
      embedCode: data.embedCode,
      fileUrl: data.fileUrl,
      uploadedBy: { id: '1', name: 'Admin' }, // Mock user
    };

    try {
      if (isEditing && materialToEdit) {
        updateMaterial(materialToEdit.id, materialData as Partial<Material>);
        toast({ title: "Material atualizado com sucesso!" });
      } else {
        addMaterial(materialData as Omit<Material, 'id' | 'uploadDate' | 'lastModified' | 'downloadCount' | 'viewCount'>);
        toast({ title: "Material criado com sucesso!" });
      }
      navigate('/admin/conteudo/materiais');
    } catch (error) {
      toast({ title: "Erro ao salvar material", description: "Tente novamente.", variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/conteudo/materiais">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <CardTitle>{isEditing ? 'Editar Material' : 'Novo Material'}</CardTitle>
            <CardDescription>Preencha os detalhes do material.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Guia de Instalação" {...field} />
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
                    <Textarea placeholder="Descreva o material..." {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* UPLOAD DE ARQUIVO LOCAL */}
            {selectedType && fileTypesWithUpload.includes(selectedType.name) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Upload do arquivo {selectedType.name.toLowerCase()}
                </label>
                <input
                  type="file"
                  accept={fileAcceptMapping[selectedType.name] || "*"}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer"
                />
                {form.getValues("fileUrl") && (
                  <p className="text-xs text-muted-foreground mt-2 break-all">
                    Arquivo selecionado: {form.getValues("fileUrl")}
                  </p>
                )}
              </div>
            )}
            
            {selectedType?.allowsUrl && (
              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Externa</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {selectedType?.name === 'Embed' && (
              <FormField
                control={form.control}
                name="embedCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Embed</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<div...>..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Nível de Acesso</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal">Público</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="restricted" />
                        </FormControl>
                        <FormLabel className="font-normal">Restrito</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
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
                    <Input placeholder="Ex: react, guia, pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Material'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MaterialFormAdmin;
