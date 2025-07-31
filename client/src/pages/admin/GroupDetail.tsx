import React, { memo, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Edit, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Settings,
  User,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AdminStandardLayout, { AdminCard, AdminGrid, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface GroupDetailProps {
  params?: { id?: string };
}

interface GroupData {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  memberCount?: number;
}

interface PermissionFeature {
  code: string;
  name: string;
  category: string;
  description?: string;
}

interface PermissionCategory {
  [key: string]: PermissionFeature[];
}

const GroupDetail = memo(({ params }: GroupDetailProps = {}) => {
  const [, setLocation] = useLocation();
  const groupId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete group dialog state
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<{
    isOpen: boolean;
    members: any[];
    transferToGroupId: string;
  }>({
    isOpen: false,
    members: [],
    transferToGroupId: ''
  });

  // Fetch group data
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
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all available features for comparison
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

  // Fetch available groups for transfer options
  const { data: groupsResponse } = useQuery({
    queryKey: ['/api/permissions/groups'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/permissions/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch groups');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  // Delete group mutation
  const deleteGroup = useMutation({
    mutationFn: async ({ groupId, transferToGroupId }: { groupId: number; transferToGroupId?: number }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/permissions/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transferToGroupId })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Grupo excluído",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/groups'] });
      setLocation('/admin/usuarios');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir grupo",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get group members mutation
  const getGroupMembers = useMutation({
    mutationFn: async (groupId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/permissions/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to get group members');
      return response.json();
    },
    onSuccess: (data) => {
      setDeleteGroupDialog(prev => ({
        ...prev,
        members: data.members || []
      }));
    }
  });

  // Handle delete group click
  const handleDeleteGroup = useCallback(async () => {
    const currentGroup = groupResponse?.group;
    
    if (!currentGroup || currentGroup.isSystem) {
      toast({
        title: "Erro",
        description: "Grupos do sistema não podem ser excluídos",
        variant: "destructive",
      });
      return;
    }

    setDeleteGroupDialog({
      isOpen: true,
      members: [],
      transferToGroupId: ''
    });

    // Get group members
    getGroupMembers.mutate(parseInt(groupId!));
  }, [groupResponse, groupId, getGroupMembers, toast]);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (!groupId) return;

    const transferToGroupId = deleteGroupDialog.transferToGroupId 
      ? parseInt(deleteGroupDialog.transferToGroupId) 
      : undefined;

    deleteGroup.mutate({
      groupId: parseInt(groupId),
      transferToGroupId
    });
  }, [groupId, deleteGroupDialog, deleteGroup]);

  // Fetch group members count
  const { data: membersResponse } = useQuery({
    queryKey: ['/api/admin/users/by-group', groupId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users?groupId=${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch group members');
      return response.json();
    },
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = groupLoading || featuresLoading;
  const group: GroupData | undefined = groupResponse?.group;
  const features: PermissionCategory = featuresResponse?.features || {};  
  const groups = groupsResponse?.groups || [];
  const memberCount = membersResponse?.users?.length || 0;

  // Get all permissions that the group has
  const groupPermissions = Array.isArray(group?.permissions) ? group.permissions : [];
  
  // Create a map of categories and their permissions - MUST be called before any returns
  const permissionsByCategory = useMemo(() => {
    const categories: { [category: string]: { granted: PermissionFeature[], denied: PermissionFeature[] } } = {};
    
    Object.entries(features).forEach(([category, categoryFeatures]) => {
      if (!categories[category]) {
        categories[category] = { granted: [], denied: [] };
      }
      
      categoryFeatures.forEach(feature => {
        const hasPermission = groupPermissions.some(permission => 
          permission === feature.code || 
          permission === `${category.toLowerCase()}.*` ||
          permission === 'admin.*'
        );
        
        if (hasPermission) {
          categories[category].granted.push(feature);
        } else {
          categories[category].denied.push(feature);
        }
      });
    });
    
    return categories;
  }, [features, groupPermissions]);

  // Handle loading state
  if (isLoading) {
    return (
      <AdminStandardLayout title="Carregando..." showBackButton>
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  // Handle not found state
  if (!group) {
    return (
      <AdminStandardLayout title="Grupo não encontrado" showBackButton>
        <AdminCard>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Grupo não encontrado</h3>
            <p className="text-gray-600 mb-4">O grupo solicitado não existe ou foi removido.</p>
            <Button onClick={() => setLocation('/admin/usuarios')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Gestão de Usuários
            </Button>
          </div>
        </AdminCard>
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title={`Grupo: ${group.name}`}
      description="Detalhes do grupo e permissões granulares"
      showBackButton
      primaryAction={{
        label: 'Editar Grupo',
        onClick: () => setLocation(`/admin/usuarios/grupos/${groupId}/edit`),
        icon: Edit
      }}
      secondaryActions={group && !group.isSystem ? [
        {
          label: 'Excluir Grupo',
          onClick: handleDeleteGroup,
          icon: Trash2,
          variant: 'destructive' as const
        }
      ] : undefined}
    >
      <div className="space-y-6">
        {/* Group Basic Info */}
        <AdminGrid columns={3}>
          <AdminCard title="Informações Básicas">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Nome</span>
                <p className="text-lg font-medium text-gray-900">{group.name}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Descrição</span>
                <p className="text-gray-700">{group.description || 'Sem descrição'}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <div className="mt-1">
                  <Badge variant={group.isActive ? 'default' : 'secondary'}>
                    {group.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Estatísticas">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{memberCount}</span>
                </div>
                <p className="text-sm text-gray-500">Membros ativos</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{groupPermissions.length}</span>
                </div>
                <p className="text-sm text-gray-500">Permissões concedidas</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Criação">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-500">Data de criação</span>
              <p className="text-gray-700">
                {new Date(group.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </AdminCard>
        </AdminGrid>

        {/* Permissions Details */}
        <AdminCard title="Permissões Granulares">
          <div className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, categoryData]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>{category}</span>
                  </h3>
                  
                  <div className="flex space-x-2">
                    {categoryData.granted.length > 0 && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {categoryData.granted.length} concedida(s)
                      </Badge>
                    )}
                    {categoryData.denied.length > 0 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {categoryData.denied.length} negada(s)
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Granted Permissions */}
                  {categoryData.granted.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Permissões Concedidas
                      </h4>
                      <div className="space-y-2">
                        {categoryData.granted.map(permission => (
                          <div key={permission.code} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <span className="text-sm font-medium text-green-900">{permission.name}</span>
                              <p className="text-xs text-green-700">{permission.code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Denied Permissions */}
                  {categoryData.denied.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Permissões Negadas
                      </h4>
                      <div className="space-y-2">
                        {categoryData.denied.map(permission => (
                          <div key={permission.code} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <XCircle className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                              <p className="text-xs text-gray-500">{permission.code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Raw Permissions (for debugging) */}
        <AdminCard title="Permissões Brutas (Debug)">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(groupPermissions, null, 2)}
            </pre>
          </div>
        </AdminCard>
      </div>

      {/* Delete Group Dialog */}
      <Dialog open={deleteGroupDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteGroupDialog({ isOpen: false, members: [], transferToGroupId: '' });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Excluir Grupo</span>
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o grupo "{group?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {deleteGroupDialog.members.length > 0 && (
              <>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Atenção: Este grupo possui {deleteGroupDialog.members.length} usuário(s)
                    </span>
                  </div>
                  <ul className="text-xs text-orange-700 space-y-1">
                    {deleteGroupDialog.members.slice(0, 3).map((member: any, index: number) => (
                      <li key={index}>• {member.userName} ({member.userEmail})</li>
                    ))}
                    {deleteGroupDialog.members.length > 3 && (
                      <li>• ... e mais {deleteGroupDialog.members.length - 3} usuário(s)</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Para qual grupo transferir os usuários?
                  </label>
                  <Select 
                    value={deleteGroupDialog.transferToGroupId} 
                    onValueChange={(value) => 
                      setDeleteGroupDialog(prev => ({ ...prev, transferToGroupId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo ou deixe vazio para remover" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Remover usuários do grupo</SelectItem>
                      {groups
                        .filter((g: any) => g.id !== group?.id)
                        .map((availableGroup: any) => (
                          <SelectItem key={availableGroup.id} value={availableGroup.id.toString()}>
                            {availableGroup.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Se não selecionar um grupo, os usuários serão removidos de todos os grupos.
                  </p>
                </div>
              </>
            )}

            {deleteGroupDialog.members.length === 0 && (
              <p className="text-sm text-gray-600">
                Este grupo não possui usuários associados. A exclusão será imediata.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteGroupDialog({ isOpen: false, members: [], transferToGroupId: '' })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? 'Excluindo...' : 'Excluir Grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminStandardLayout>
  );
});

GroupDetail.displayName = 'GroupDetail';

export default GroupDetail;