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
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface UserForm {
  name: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  password?: string;
  groupIds: number[];
}

interface UserEditProps {
  params?: { id?: string };
}

const UserEdit = memo(({ params }: UserEditProps = {}) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const userId = params?.id;
  const isNewUser = userId === 'novo';

  const [form, setForm] = useState<UserForm>({
    name: '',
    email: '',
    username: '',
    role: 'user',
    isActive: true,
    password: '',
    groupIds: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data for editing
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !isNewUser,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available groups
  const { data: groups } = useQuery({
    queryKey: ['/api/user-groups'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user groups for editing
  const { data: userGroups } = useQuery({
    queryKey: ['/api/users', userId, 'groups'],
    enabled: !isNewUser,
    staleTime: 2 * 60 * 1000,
  });

  // Set form data when user is loaded
  useEffect(() => {
    if (user && typeof user === 'object') {
      setForm({
        name: (user as any).name || '',
        email: (user as any).email || '',
        username: (user as any).username || '',
        role: (user as any).role || 'user',
        isActive: (user as any).isActive !== false,
        groupIds: Array.isArray(userGroups) ? userGroups.map((ug: any) => ug.groupId) : []
      });
    }
  }, [user, userGroups]);

  // Save user mutation
  const saveUser = useMutation({
    mutationFn: async (data: UserForm) => {
      const url = isNewUser ? '/api/users' : `/api/users/${userId}`;
      const method = isNewUser ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar usuário');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

    if (!form.username.trim()) {
      newErrors.username = 'Username é obrigatório';
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

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Digite o username"
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
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

          {/* Role and Status */}
          <AdminCard title="Permissões e Status">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select value={form.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
        {groups && Array.isArray(groups) && groups.length > 0 ? (
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
        ) : null}

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