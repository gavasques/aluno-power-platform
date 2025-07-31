import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Shield, 
  Users
} from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface UserForm {
  name: string;
  email: string;
  isActive: boolean;
  password?: string;
  groupIds: number[];
}

const UserEdit = memo(() => {
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.id;
  const isNewUser = userId === 'novo';

  const [form, setForm] = useState<UserForm>({
    name: '',
    email: '',
    isActive: true,
    password: '',
    groupIds: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data for editing
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: !isNewUser && !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available permission groups
  const { data: groupsResponse } = useQuery({
    queryKey: ['/api/admin/permissions/groups'],
    staleTime: 5 * 60 * 1000,
  });

  const groups = (groupsResponse as any)?.groups || [];

  // User groups are now included in the user data, no separate call needed

  // Set form data when user is loaded
  useEffect(() => {
    if (user && typeof user === 'object') {
      const userData = user as any;
      setForm(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        isActive: userData.isActive !== false,
        groupIds: userData.groups || []
      }));
    }
  }, [user]);

  // Save user mutation
  const saveUser = useMutation({
    mutationFn: async (data: UserForm) => {
      const url = isNewUser ? '/api/admin/users' : `/api/admin/users/${userId}`;
      const method = isNewUser ? 'POST' : 'PATCH';
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar usuário');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setLocation('/admin/usuarios');
    },
    onError: (error: any) => {
      setErrors({ general: error.message });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }



    if (isNewUser && !form.password) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      saveUser.mutate(form);
    }
  };

  const handleInputChange = (field: keyof UserForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGroupToggle = (groupId: number, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      groupIds: checked
        ? [...prev.groupIds, groupId]
        : prev.groupIds.filter(id => id !== groupId)
    }));
  };

  if (isLoading && !isNewUser) {
    return (
      <AdminStandardLayout title="Carregando usuário...">
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title={isNewUser ? 'Novo Usuário' : 'Editar Usuário'}
      description={isNewUser ? 'Criar novo usuário no sistema' : 'Editar informações do usuário'}
      showBackButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <AdminCard title="Informações Básicas">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Digite o email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>



              {isNewUser && (
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Digite a senha"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              )}
            </div>
          </AdminCard>

          {/* Status */}
          <AdminCard title="Status do Usuário">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Usuário ativo</Label>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Usuários inativos não conseguem acessar o sistema
                </p>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Groups */}
        {groups && Array.isArray(groups) && (groups as any[]).length > 0 && (
          <AdminCard title="Grupos de Usuário">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Selecione os grupos aos quais este usuário pertence
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(groups as any[]).map((group: any) => (
                  <div key={group.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={form.groupIds.includes(group.id)}
                      onCheckedChange={(checked) => handleGroupToggle(group.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`group-${group.id}`} className="font-medium">
                        {group.name}
                      </Label>
                      {group.description && (
                        <p className="text-xs text-gray-500">{group.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        )}

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/usuarios')}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saveUser.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveUser.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </AdminStandardLayout>
  );
});

UserEdit.displayName = 'UserEdit';

export default UserEdit;