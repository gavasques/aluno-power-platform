import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Save, 
  X, 
  Shield, 
  Settings,
  Users,
  FileText,
  Bot,
  Youtube,
  Package,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GroupForm {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

interface GroupEditProps {
  params?: { id?: string };
}

const GroupEdit = memo(({ params }: GroupEditProps = {}) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const groupId = params?.id;
  const isNewGroup = groupId === 'novo';

  const [form, setForm] = useState<GroupForm>({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available permissions by category
  const availablePermissions: Permission[] = [
    // Dashboard
    { id: 'dashboard.view', name: 'Visualizar Dashboard', description: 'Acesso ao dashboard principal', category: 'Dashboard', icon: BarChart3 },
    
    // Usuários
    { id: 'users.view', name: 'Visualizar Usuários', description: 'Ver lista de usuários', category: 'Usuários', icon: Users },
    { id: 'users.create', name: 'Criar Usuários', description: 'Criar novos usuários', category: 'Usuários', icon: Users },
    { id: 'users.edit', name: 'Editar Usuários', description: 'Editar informações de usuários', category: 'Usuários', icon: Users },
    { id: 'users.delete', name: 'Excluir Usuários', description: 'Excluir usuários do sistema', category: 'Usuários', icon: Users },
    { id: 'users.activate', name: 'Ativar/Desativar Usuários', description: 'Alterar status dos usuários', category: 'Usuários', icon: Users },
    
    // Conteúdo
    { id: 'content.view', name: 'Visualizar Conteúdo', description: 'Ver materiais, ferramentas, etc.', category: 'Conteúdo', icon: FileText },
    { id: 'content.create', name: 'Criar Conteúdo', description: 'Criar novos conteúdos', category: 'Conteúdo', icon: FileText },
    { id: 'content.edit', name: 'Editar Conteúdo', description: 'Editar conteúdos existentes', category: 'Conteúdo', icon: FileText },
    { id: 'content.delete', name: 'Excluir Conteúdo', description: 'Excluir conteúdos', category: 'Conteúdo', icon: FileText },
    { id: 'content.publish', name: 'Publicar Conteúdo', description: 'Publicar/despublicar conteúdo', category: 'Conteúdo', icon: FileText },
    
    // Agentes IA
    { id: 'agents.view', name: 'Visualizar Agentes IA', description: 'Ver agentes e configurações', category: 'Agentes IA', icon: Bot },
    { id: 'agents.use', name: 'Usar Agentes IA', description: 'Utilizar agentes para gerar conteúdo', category: 'Agentes IA', icon: Bot },
    { id: 'agents.configure', name: 'Configurar Agentes IA', description: 'Configurar modelos e prompts', category: 'Agentes IA', icon: Bot },
    
    // Parceiros e Fornecedores
    { id: 'partners.view', name: 'Visualizar Parceiros', description: 'Ver parceiros do sistema', category: 'Parceiros', icon: Package },
    { id: 'partners.manage', name: 'Gerenciar Parceiros', description: 'Criar e editar parceiros', category: 'Parceiros', icon: Package },
    { id: 'suppliers.view', name: 'Visualizar Fornecedores', description: 'Ver fornecedores', category: 'Fornecedores', icon: Package },
    { id: 'suppliers.manage', name: 'Gerenciar Fornecedores', description: 'Criar e editar fornecedores', category: 'Fornecedores', icon: Package },
    
    // Vídeos
    { id: 'videos.view', name: 'Visualizar Vídeos', description: 'Ver vídeos do YouTube', category: 'Vídeos', icon: Youtube },
    { id: 'videos.sync', name: 'Sincronizar YouTube', description: 'Executar sync de vídeos', category: 'Vídeos', icon: Youtube },
    
    // Sistema
    { id: 'system.settings', name: 'Configurações do Sistema', description: 'Alterar configurações gerais', category: 'Sistema', icon: Settings },
    { id: 'system.logs', name: 'Visualizar Logs', description: 'Ver logs do sistema', category: 'Sistema', icon: Settings },
    
    // Suporte
    { id: 'support.view', name: 'Visualizar Suporte', description: 'Ver tickets de suporte', category: 'Suporte', icon: MessageSquare },
    { id: 'support.respond', name: 'Responder Suporte', description: 'Responder tickets', category: 'Suporte', icon: MessageSquare }
  ];

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Fetch group data for editing
  const { data: group, isLoading } = useQuery({
    queryKey: ['/api/user-groups', groupId],
    enabled: !isNewGroup,
    staleTime: 2 * 60 * 1000,
  });

  // Set form data when group is loaded
  useEffect(() => {
    if (group && typeof group === 'object') {
      setForm({
        name: (group as any).name || '',
        description: (group as any).description || '',
        permissions: Array.isArray((group as any).permissions) ? (group as any).permissions : [],
        isActive: (group as any).isActive !== false
      });
    }
  }, [group]);

  // Save group mutation
  const saveGroup = useMutation({
    mutationFn: async (data: GroupForm) => {
      const url = isNewGroup ? '/api/user-groups' : `/api/user-groups/${groupId}`;
      const method = isNewGroup ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar grupo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-groups'] });
      setLocation('/admin/usuarios');
    },
    onError: (error: any) => {
      setErrors({ general: error.message });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome do grupo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      saveGroup.mutate(form);
    }
  };

  const handleInputChange = (field: keyof GroupForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const handleSelectAllCategory = (category: string, checked: boolean) => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.id);
    
    setForm(prev => ({
      ...prev,
      permissions: checked
        ? Array.from(new Set([...prev.permissions, ...categoryPermissions]))
        : prev.permissions.filter(id => !categoryPermissions.includes(id))
    }));
  };

  const isCategorySelected = (category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.id);
    return categoryPermissions.every(id => form.permissions.includes(id));
  };

  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.id);
    return categoryPermissions.some(id => form.permissions.includes(id)) && !isCategorySelected(category);
  };

  if (isLoading && !isNewGroup) {
    return (
      <AdminStandardLayout title="Carregando grupo...">
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title={isNewGroup ? 'Novo Grupo' : 'Editar Grupo'}
      description={isNewGroup ? 'Criar novo grupo de usuários' : 'Editar grupo de usuários'}
      showBackButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <AdminCard title="Informações do Grupo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome do grupo"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Grupo ativo</Label>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito deste grupo"
              rows={3}
            />
          </div>
        </AdminCard>

        {/* Permissions */}
        <AdminCard title="Permissões do Grupo">
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Selecione as permissões que os membros deste grupo terão no sistema
            </p>

            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                    {categoryPermissions[0] && React.createElement(categoryPermissions[0].icon, { className: "h-5 w-5" })}
                    <span>{category}</span>
                  </h3>
                  <Checkbox
                    checked={isCategorySelected(category)}
                    onCheckedChange={(checked) => handleSelectAllCategory(category, checked as boolean)}
                    className={isCategoryPartiallySelected(category) ? 'data-[state=checked]:bg-blue-500' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={form.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

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
            disabled={saveGroup.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveGroup.isPending ? 'Salvando...' : 'Salvar Grupo'}
          </Button>
        </div>
      </form>
    </AdminStandardLayout>
  );
});

GroupEdit.displayName = 'GroupEdit';

export default GroupEdit;