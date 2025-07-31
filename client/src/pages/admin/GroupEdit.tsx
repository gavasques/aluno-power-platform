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
  Settings
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminStandardLayout, { AdminCard, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface GroupForm {
  name: string;
  description: string;
  permissions: { featureId: number; hasAccess: boolean }[];
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

  // Fetch available features from the permission system
  const { data: featuresResponse, isLoading: featuresLoading } = useQuery({
    queryKey: ['/api/permissions/features'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/permissions/features', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch features');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch group data for editing
  const { data: groupResponse, isLoading: groupLoading } = useQuery({
    queryKey: ['/api/permissions/groups', groupId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/permissions/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch group');
      return response.json();
    },
    enabled: !isNewGroup && !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  const features = featuresResponse?.features || {};
  const group = groupResponse?.group;

  // Set form data when group is loaded
  useEffect(() => {
    if (group && !isNewGroup) {
      setForm(prev => ({
        ...prev,
        name: group.name || '',
        description: group.description || '',
        isActive: group.isActive !== false,
      }));
    }
  }, [group, isNewGroup]);

  // Set permissions when group and features are loaded
  useEffect(() => {
    if (group && features && Object.keys(features).length > 0) {
      // Create permissions array for all features
      const allPermissions: { featureId: number; hasAccess: boolean }[] = [];
      
      // Get all features from all categories
      Object.values(features).flat().forEach((feature: any) => {
        // Check if this feature is in the group's permissions array
        const hasAccess = group.permissions ? group.permissions.includes(feature.code) : false;
        
        allPermissions.push({
          featureId: feature.id,
          hasAccess
        });
      });

      setForm(prev => ({
        ...prev,
        permissions: allPermissions
      }));
    }
  }, [group, features]);

  const handleInputChange = (field: keyof GroupForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (featureId: number, hasAccess: boolean) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => 
        p.featureId === featureId ? { ...p, hasAccess } : p
      )
    }));
  };

  const handleSelectAllCategory = (category: string, checked: boolean) => {
    const categoryFeatures = features[category] || [];
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => {
        const feature = categoryFeatures.find((f: any) => f.id === p.featureId);
        return feature ? { ...p, hasAccess: checked } : p;
      })
    }));
  };

  const isCategorySelected = (category: string) => {
    const categoryFeatures = features[category] || [];
    if (categoryFeatures.length === 0) return false;
    
    return categoryFeatures.every((feature: any) => {
      const permission = form.permissions.find(p => p.featureId === feature.id);
      return permission?.hasAccess || false;
    });
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryFeatures = features[category] || [];
    if (categoryFeatures.length === 0) return false;
    
    const selectedCount = categoryFeatures.filter((feature: any) => {
      const permission = form.permissions.find(p => p.featureId === feature.id);
      return permission?.hasAccess || false;
    }).length;

    return selectedCount > 0 && selectedCount < categoryFeatures.length;
  };

  const saveGroup = useMutation({
    mutationFn: async (formData: GroupForm) => {
      const url = isNewGroup ? '/api/permissions/groups' : `/api/permissions/groups/${groupId}`;
      const method = isNewGroup ? 'POST' : 'PUT';
      
      // Save basic group info first
      const groupResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        })
      });

      if (!groupResponse.ok) {
        throw new Error('Failed to save group');
      }

      const savedGroup = await groupResponse.json();
      const targetGroupId = isNewGroup ? savedGroup.group.id : groupId;

      // Update permissions
      if (formData.permissions.length > 0) {
        const permissionsResponse = await fetch(`/api/permissions/groups/${targetGroupId}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permissions: formData.permissions
          })
        });

        if (!permissionsResponse.ok) {
          throw new Error('Failed to save permissions');
        }
      }

      return savedGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/groups'] });
      setLocation('/admin/usuarios?tab=groups');
    },
    onError: (error) => {
      setErrors({ general: error instanceof Error ? error.message : 'Erro ao salvar grupo' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveGroup.mutate(form);
  };

  if (featuresLoading || groupLoading) {
    return (
      <AdminStandardLayout title="Carregando...">
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title={isNewGroup ? 'Novo Grupo' : 'Editar Grupo'}
      description={isNewGroup ? 'Criar novo grupo de permissões' : 'Editar grupo de permissões'}
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
          <p className="text-sm text-gray-600 mb-4">
            Selecione as permissões que os membros deste grupo terão no sistema
          </p>

          {Object.entries(features).map(([category, categoryFeatures]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{category}</span>
                </h3>
                <Checkbox
                  checked={isCategorySelected(category)}
                  onCheckedChange={(checked) => handleSelectAllCategory(category, checked as boolean)}
                  className={isCategoryPartiallySelected(category) ? 'data-[state=checked]:bg-blue-600' : ''}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(categoryFeatures as any[]).map((feature: any) => {
                  const permission = form.permissions.find(p => p.featureId === feature.id);
                  return (
                    <div key={feature.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                      <Checkbox
                        id={`feature-${feature.id}`}
                        checked={permission?.hasAccess || false}
                        onCheckedChange={(checked) => handlePermissionChange(feature.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`feature-${feature.id}`} className="font-medium">
                          {feature.name}
                        </Label>
                        <p className="text-xs text-gray-500">Código: {feature.code}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </AdminCard>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/usuarios?tab=groups')}
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