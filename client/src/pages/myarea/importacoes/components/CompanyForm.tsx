import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
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
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { UserCompany } from '@shared/schema';

import { Image, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Função para decodificar HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Schema de validação do formulário
const companyFormSchema = z.object({
  corporateName: z.string().min(1, 'Razão social é obrigatória'),
  tradeName: z.string().min(1, 'Nome fantasia é obrigatório'),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Brasil'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('Website inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  fax: z.string().optional(),
  mobile: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  notes: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  company?: UserCompany | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Estados brasileiros
const ESTADOS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export function CompanyForm({ company, onSuccess, onCancel }: CompanyFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logoUrl || null);
  const { toast } = useToast();
  
  // Função para converter para maiúsculo (exceto observações)
  const toUpperCase = (value: string) => value.toUpperCase();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      corporateName: company?.corporateName || '',
      tradeName: company?.tradeName || '',
      cnpj: company?.cnpj || '',
      address: company?.address || '',
      neighborhood: company?.neighborhood || '',
      postalCode: company?.postalCode || '',
      city: company?.city || '',
      state: company?.state || '',
      country: company?.country || 'BRASIL',
      email: company?.email || '',
      website: company?.website || '',
      phone: company?.phone || '',
      fax: company?.fax || '',
      mobile: company?.mobile || '',
      stateRegistration: company?.stateRegistration || '',
      municipalRegistration: company?.municipalRegistration || '',
      logoUrl: company?.logoUrl || '',
      notes: company?.notes || '',
      isActive: company?.isActive ?? true,
    },
  });

  // Sincronizar logoPreview quando company muda (importante para edição)
  useEffect(() => {
    if (company?.logoUrl) {
      const decodedUrl = decodeHtmlEntities(company.logoUrl);
      setLogoPreview(decodedUrl);
      form.setValue('logoUrl', decodedUrl);
    }
  }, [company?.logoUrl, form]);
  
  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/user-companies/upload-logo', {
        method: 'POST',
      }) as { uploadURL: string };
      return response.uploadURL;
    },
  });

  // Update logo mutation  
  const updateLogoMutation = useMutation({
    mutationFn: async ({ companyId, logoURL }: { companyId: number; logoURL: string }) => {
      console.log('🔍 [FRONTEND] Updating logo for company:', { companyId, logoURL });
      
      // Check if we have a token
      const token = localStorage.getItem('auth_token');
      console.log('🔍 [FRONTEND] Auth token present:', !!token);
      
      return apiRequest(`/api/user-companies/${companyId}/logo`, {
        method: 'PUT',
        body: { logoURL }, // Remove JSON.stringify, apiRequest faz isso automaticamente
      });
    },
    onSuccess: (data) => {
      console.log('🔍 [FRONTEND] Logo update successful:', data);
      // Não invalidar cache aqui - será invalidado apenas no submit final do formulário
      // queryClient.invalidateQueries({ queryKey: ['/api/user-companies'] });
    },
    onError: (error) => {
      console.error('🔍 [FRONTEND] Logo update failed:', error);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const url = company ? `/api/user-companies/${company.id}` : '/api/user-companies';
      const method = company ? 'PUT' : 'POST';
      
      // Debug logging for mutations
      if (import.meta.env.DEV) {
        console.log('🔍 [MUTATION] Submitting company data:', { url, method, data });
      }
      
      // Usar apiRequest sem duplicar headers - ele já gerencia JSON automaticamente
      return apiRequest(url, {
        method,
        body: data, // apiRequest vai fazer o JSON.stringify automaticamente
      });
    },
    onSuccess: (data) => {
      // Force cache invalidation to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/user-companies'] });
      queryClient.refetchQueries({ queryKey: ['/api/user-companies'] });
      
      if (import.meta.env.DEV) {
        console.log('🔍 [MUTATION] Success, cache invalidated:', data);
      }
      
      onSuccess();
    },
    onError: (error) => {
      console.error('🔍 [MUTATION] Failed:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar empresa',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    // Limpar campos vazios para não enviar strings vazias, MAS PRESERVAR logoUrl
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      // Sempre preservar logoUrl, mesmo se for string vazia
      if (key === 'logoUrl') {
        return { ...acc, [key]: value || '' };
      }
      
      // Para outros campos, remover se estiver vazio
      if (value === '' || value === null || value === undefined) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as CompanyFormData);

    // Se logoPreview existe mas logoUrl não está no cleanData, adicionar
    if (logoPreview && !cleanData.logoUrl) {
      cleanData.logoUrl = logoPreview;
    }

    // Debug log para verificar dados enviados
    if (import.meta.env.DEV) {
      console.log('🔍 [FORM] Dados sendo enviados:', cleanData);
      console.log('🔍 [FORM] Logo preview atual:', logoPreview);
    }

    mutation.mutate(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="corporateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: JOÃO SILVA ME" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: SILVA IMPORTAÇÕES" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="00.000.000/0001-00" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Empresa Ativa</FormLabel>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Empresa está ativa e pode ser utilizada
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Endereço
          </h3>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="EX: RUA DAS FLORES, 123" 
                    onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: CENTRO" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 12345-678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: SÃO PAULO" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contato */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contato
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Ex: contato@empresa.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: https://www.empresa.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: (11) 1234-5678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: (11) 99999-9999" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: (11) 1234-5678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Registros */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Registros
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stateRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição Estadual</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: 123.456.789.012" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="municipalRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição Municipal</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="EX: 123456789" 
                      onChange={(e) => field.onChange(toUpperCase(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Logo da Empresa
          </h3>
          
          <div className="flex items-start gap-4">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                  <img 
                    src={decodeHtmlEntities(logoPreview)}
                    alt="Logo da empresa" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Não remover automaticamente - mostrar placeholder svg no erro
                      console.warn('Logo failed to load:', logoPreview);
                      e.currentTarget.style.display = 'none';
                      
                      // Mostrar SVG placeholder em caso de erro
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.error-placeholder')) {
                        const svgPlaceholder = document.createElement('div');
                        svgPlaceholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gray-100';
                        svgPlaceholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                        parent.appendChild(svgPlaceholder);
                      }
                    }}
                    onLoad={(e) => {
                      // Remove placeholder se imagem carregar corretamente
                      const parent = e.currentTarget.parentElement;
                      const placeholder = parent?.querySelector('.error-placeholder');
                      if (placeholder) {
                        placeholder.remove();
                      }
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      form.setValue('logoUrl', '');
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-2">
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !company) return;

                    // Validate file size (2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      toast({
                        title: "Erro",
                        description: "Arquivo muito grande. Máximo: 2MB",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Validate file type
                    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                      toast({
                        title: "Erro",
                        description: "Formato não aceito. Use PNG, JPEG ou JPG",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      // Get upload URL
                      const uploadURL = await uploadLogoMutation.mutateAsync();
                      console.log('🔍 [UPLOAD] Got upload URL:', uploadURL);
                      
                      // Upload file directly to Google Cloud Storage
                      const uploadResponse = await fetch(uploadURL, {
                        method: 'PUT',
                        body: file,
                        headers: {
                          'Content-Type': file.type,
                        },
                      });

                      console.log('🔍 [UPLOAD] Upload response status:', uploadResponse.status);

                      if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        console.error('🔍 [UPLOAD] Upload failed:', errorText);
                        throw new Error(`Upload failed: ${uploadResponse.status}`);
                      }

                      console.log('🔍 [UPLOAD] Upload successful, updating company...');

                      // Update company with logo URL
                      const updateResult = await updateLogoMutation.mutateAsync({
                        companyId: company.id,
                        logoURL: uploadURL,
                      }) as any;

                      console.log('🔍 [UPLOAD] Company update result:', updateResult);

                      // Update preview and form with normalized URL
                      const normalizedLogoUrl = updateResult.data?.logoUrl || updateResult.logoUrl;
                      if (normalizedLogoUrl) {
                        setLogoPreview(normalizedLogoUrl);
                        form.setValue('logoUrl', normalizedLogoUrl);
                      }

                      toast({
                        title: "Sucesso",
                        description: "Logo atualizado com sucesso!",
                      });

                      // Clear the input
                      e.target.value = '';

                    } catch (error) {
                      console.error('Logo upload error:', error);
                      toast({
                        title: "Erro",
                        description: "Erro ao fazer upload do logo",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>{logoPreview ? 'Alterar Logo' : 'Upload Logo'}</span>
                </label>
              </div>
              
              <p className="text-xs text-gray-500">
                Formatos aceitos: PNG, JPEG, JPG. Tamanho máximo: 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Observações
          </h3>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Informações adicionais sobre a empresa..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t bg-white dark:bg-gray-800 sticky bottom-0 z-10 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="min-w-[140px]"
          >
            {mutation.isPending 
              ? 'Salvando...' 
              : company 
                ? 'Atualizar Empresa' 
                : 'Criar Empresa'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}