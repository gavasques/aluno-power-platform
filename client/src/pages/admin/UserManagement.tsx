import React, { memo, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserX,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  groupNames?: string[];
}

interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const UserManagement = memo(() => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'groups'>('users');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Fixed page size
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Delete group dialog state
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<{
    isOpen: boolean;
    group: any | null;
    members: any[];
    transferToGroupId: string;
  }>({
    isOpen: false,
    group: null,
    members: [],
    transferToGroupId: ''
  });

  // Debounced search to avoid too many API calls
  const debouncedSearchTerm = useMemo(() => {
    const timer = setTimeout(() => searchTerm, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Users query with pagination and search
  const { data: usersResponse, isLoading } = useQuery<PaginatedUsersResponse>({
    queryKey: ['/api/admin/users', currentPage, pageSize, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    placeholderData: (previousData) => previousData, // Updated from keepPreviousData
  });

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  // Permission groups query
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

  const groups = groupsResponse?.groups || [];

  // Mutations for user actions
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Usuário deletado",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Bulk delete test users
  const deleteTestUsers = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/test-users', { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete test users');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Usuários de teste deletados",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar usuários de teste",
        description: error.message,
        variant: "destructive",
      });
    }
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
      setDeleteGroupDialog({ isOpen: false, group: null, members: [], transferToGroupId: '' });
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
  const handleDeleteGroup = useCallback(async (group: any) => {
    if (group.isSystem) {
      toast({
        title: "Erro",
        description: "Grupos do sistema não podem ser excluídos",
        variant: "destructive",
      });
      return;
    }

    setDeleteGroupDialog({
      isOpen: true,
      group,
      members: [],
      transferToGroupId: ''
    });

    // Get group members
    getGroupMembers.mutate(group.id);
  }, [getGroupMembers, toast]);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (!deleteGroupDialog.group) return;

    const transferToGroupId = deleteGroupDialog.transferToGroupId 
      ? parseInt(deleteGroupDialog.transferToGroupId) 
      : undefined;

    deleteGroup.mutate({
      groupId: deleteGroupDialog.group.id,
      transferToGroupId
    });
  }, [deleteGroupDialog, deleteGroup]);

  // Reset to first page when search term changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleLastPage = useCallback(() => {
    if (pagination?.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [pagination?.totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => {
      if (pagination?.totalPages) {
        return Math.min(pagination.totalPages, prev + 1);
      }
      return prev;
    });
  }, [pagination?.totalPages]);

  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    if (window.confirm(`${currentStatus ? 'Desativar' : 'Ativar'} este usuário?`)) {
      toggleUserStatus.mutate({ userId, isActive: !currentStatus });
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`Confirma a exclusão do usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      deleteUser.mutate(userId);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: <Badge className="bg-red-100 text-red-700 border-red-200">Admin</Badge>,
      user: <Badge className="bg-gray-100 text-gray-700 border-gray-200">Usuário</Badge>
    };
    return variants[role as keyof typeof variants] || variants.user;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-700 border-green-200">Ativo</Badge>
      : <Badge className="bg-red-100 text-red-700 border-red-200">Inativo</Badge>;
  };

  if (isLoading) {
    return (
      <AdminStandardLayout title="Gestão de Usuários">
        <AdminLoader />
      </AdminStandardLayout>
    );
  }

  return (
    <AdminStandardLayout 
      title="Gestão de Usuários"
      description="Controle de usuários, grupos e permissões"
      showBackButton
      primaryAction={{
        label: 'Novo Usuário',
        onClick: () => setLocation('/admin/usuarios/novo'),
        icon: Plus
      }}
      secondaryActions={[
        {
          label: deleteTestUsers.isPending ? 'Deletando...' : 'Limpar Usuários Teste',
          onClick: () => {
            if (window.confirm('Confirma a exclusão de todos os usuários de teste? Esta ação não pode ser desfeita.')) {
              deleteTestUsers.mutate();
            }
          },
          icon: Trash2,
          variant: 'destructive' as const,
          disabled: deleteTestUsers.isPending
        }
      ]}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </button>
          <button
            onClick={() => setSelectedTab('groups')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'groups'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Grupos</span>
          </button>
        </div>

        {selectedTab === 'users' && (
          <>
            {/* Search and Controls */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                {pagination ? (
                  <>
                    {pagination.totalUsers} usuário{pagination.totalUsers !== 1 ? 's' : ''} 
                    {searchTerm && ` (página ${pagination.currentPage} de ${pagination.totalPages})`}
                  </>
                ) : (
                  '0 usuários'
                )}
              </div>
            </div>

            {/* Users List */}
            <AdminCard title="Lista de Usuários">
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            Último login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.isActive)}
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/usuarios/${user.id}/editar`)}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Mostrando {Math.min((currentPage - 1) * pageSize + 1, pagination.totalUsers)} - {Math.min(currentPage * pageSize, pagination.totalUsers)} de {pagination.totalUsers} usuários
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFirstPage}
                      disabled={!pagination.hasPrevPage}
                      title="Primeira página"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={!pagination.hasPrevPage}
                      title="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {/* Show page numbers around current page */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        if (page > pagination.totalPages) return null;
                        
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="min-w-[32px]"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage}
                      title="Próxima página"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLastPage}
                      disabled={!pagination.hasNextPage}
                      title="Última página"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </AdminCard>
          </>
        )}

        {selectedTab === 'groups' && (
          <AdminCard 
            title="Grupos de Usuários"
            actions={
              <Button size="sm" onClick={() => setLocation('/admin/usuarios/grupos/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            }
          >
            <div className="space-y-4">
              {groups && Array.isArray(groups) && groups.length > 0 ? (
                (groups as any[]).map((group: any) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.description}</p>
                        {group.isSystem && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sistema
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/admin/usuarios/grupos/${group.id}`)}
                        title="Configurar grupo"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!group.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group)}
                          title="Excluir grupo"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum grupo cadastrado</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setLocation('/admin/usuarios/grupos/novo')}
                  >
                    Criar Primeiro Grupo
                  </Button>
                </div>
              )}
            </div>
          </AdminCard>
        )}
      </div>

      {/* Delete Group Dialog */}
      <Dialog open={deleteGroupDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteGroupDialog({ isOpen: false, group: null, members: [], transferToGroupId: '' });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Excluir Grupo</span>
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o grupo "{deleteGroupDialog.group?.name}"?
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
                        .filter((g: any) => g.id !== deleteGroupDialog.group?.id)
                        .map((group: any) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
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
              onClick={() => setDeleteGroupDialog({ isOpen: false, group: null, members: [], transferToGroupId: '' })}
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

UserManagement.displayName = 'UserManagement';

export default UserManagement;