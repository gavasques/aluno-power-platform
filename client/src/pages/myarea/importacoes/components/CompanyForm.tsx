import React from 'react';
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
import { apiRequest } from '@/lib/queryClient';
import type { UserCompany } from '@shared/schema';

// Schema de validação do formulário
const companyFormSchema = z.object({
  corporateName: z.string().min(1, 'Razão social é obrigatória'),
  tradeName: z.string().min(1, 'Nome fantasia é obrigatório'),
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
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      corporateName: company?.corporateName || '',
      tradeName: company?.tradeName || '',
      address: company?.address || '',
      neighborhood: company?.neighborhood || '',
      postalCode: company?.postalCode || '',
      city: company?.city || '',
      state: company?.state || '',
      country: company?.country || 'Brasil',
      email: company?.email || '',
      website: company?.website || '',
      phone: company?.phone || '',
      fax: company?.fax || '',
      mobile: company?.mobile || '',
      stateRegistration: company?.stateRegistration || '',
      municipalRegistration: company?.municipalRegistration || '',
      notes: company?.notes || '',
      isActive: company?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const url = company ? `/api/user-companies/${company.id}` : '/api/user-companies';
      const method = company ? 'PUT' : 'POST';
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    // Limpar campos vazios para não enviar strings vazias
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as CompanyFormData);

    mutation.mutate(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input {...field} placeholder="Ex: João Silva ME" />
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
                    <Input {...field} placeholder="Ex: Silva Importações" />
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
                  <Input {...field} placeholder="Ex: Rua das Flores, 123" />
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
                    <Input {...field} placeholder="Ex: Centro" />
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
                    <Input {...field} placeholder="Ex: São Paulo" />
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
                    <Input {...field} />
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
                    <Input {...field} placeholder="Ex: 123.456.789.012" />
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
                    <Input {...field} placeholder="Ex: 123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
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