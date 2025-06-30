import React, { memo, useState, useMemo } from 'react';
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
  Settings
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const UserManagement = memo(() => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'groups'>('users');
  const queryClient = useQueryClient();

  // Users query
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 2 * 60 * 1000,
  });

  // Groups query
  const { data: groups } = useQuery({
    queryKey: ['/api/user-groups'],
    staleTime: 2 * 60 * 1000,
  });

  // Mutations for user actions
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

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
      support: <Badge className="bg-blue-100 text-blue-700 border-blue-200">Suporte</Badge>,
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Users List */}
            <AdminCard title="Lista de Usuários">
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
              {groups && groups.length > 0 ? (
                groups.map((group: any) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/admin/usuarios/grupos/${group.id}`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
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
    </AdminStandardLayout>
  );
});

UserManagement.displayName = 'UserManagement';

export default UserManagement;