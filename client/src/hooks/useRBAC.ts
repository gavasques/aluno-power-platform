/**
 * Hook para Role-Based Access Control (RBAC)
 * Sistema avançado de controle de acesso baseado em papéis
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'admin';
  description?: string;
  conditions?: Record<string, any>; // Condições adicionais
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean; // Papéis do sistema não podem ser editados
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  directPermissions: Permission[]; // Permissões diretas do usuário
  effectivePermissions: Permission[]; // Todas as permissões efetivas
  lastUpdated: Date;
}

interface UseRBACProps {
  userId?: string; // Se não fornecido, usa o usuário atual
  autoRefresh?: boolean;
}

export function useRBAC({
  userId,
  autoRefresh = true
}: UseRBACProps = {}) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  const targetUserId = userId || user?.id;

  // Query para buscar permissões do usuário
  const { 
    data: userPermissions, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['user-permissions', targetUserId],
    queryFn: async (): Promise<UserPermissions> => {
      const response = await fetch(`/api/rbac/user/${targetUserId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar permissões');
      }

      return response.json();
    },
    enabled: !!token && !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: autoRefresh ? 10 * 60 * 1000 : false // 10 minutos
  });

  // Query para buscar todos os papéis disponíveis
  const { data: availableRoles = [] } = useQuery({
    queryKey: ['available-roles'],
    queryFn: async (): Promise<Role[]> => {
      const response = await fetch('/api/rbac/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar papéis');
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000
  });

  // Query para buscar todas as permissões disponíveis
  const { data: availablePermissions = [] } = useQuery({
    queryKey: ['available-permissions'],
    queryFn: async (): Promise<Permission[]> => {
      const response = await fetch('/api/rbac/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar permissões');
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000
  });

  // Mutation para atualizar papéis do usuário
  const updateUserRolesMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      const response = await fetch(`/api/rbac/user/${targetUserId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleIds })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar papéis');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    }
  });

  // Mutation para criar novo papel
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar papel');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-roles'] });
    }
  });

  // Verificar se usuário tem permissão específica
  const hasPermission = useCallback((
    resource: string, 
    action: Permission['action'],
    conditions?: Record<string, any>
  ): boolean => {
    if (!userPermissions?.effectivePermissions) return false;

    return userPermissions.effectivePermissions.some(permission => {
      // Verificar recurso e ação
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const actionMatch = permission.action === action || permission.action === 'admin';

      if (!resourceMatch || !actionMatch) return false;

      // Verificar condições adicionais se existirem
      if (conditions && permission.conditions) {
        return Object.entries(conditions).every(([key, value]) => {
          const permissionCondition = permission.conditions![key];
          
          if (Array.isArray(permissionCondition)) {
            return permissionCondition.includes(value);
          }
          
          return permissionCondition === value || permissionCondition === '*';
        });
      }

      return true;
    });
  }, [userPermissions?.effectivePermissions]);

  // Verificar se usuário tem papel específico
  const hasRole = useCallback((roleName: string): boolean => {
    if (!userPermissions?.roles) return false;
    return userPermissions.roles.some(role => role.name === roleName);
  }, [userPermissions?.roles]);

  // Verificar se usuário é admin
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin') || hasPermission('*', 'admin');
  }, [hasRole, hasPermission]);

  // Filtrar recursos baseado em permissões
  const filterByPermissions = useCallback(<T extends { id: string | number }>(
    items: T[],
    resource: string,
    action: Permission['action'] = 'read'
  ): T[] => {
    if (isAdmin()) return items;
    
    if (!hasPermission(resource, action)) return [];
    
    return items.filter(item => {
      // Verificar condições específicas do item se necessário
      return hasPermission(resource, action, { itemId: item.id });
    });
  }, [hasPermission, isAdmin]);

  // Obter ações permitidas para um recurso
  const getAllowedActions = useCallback((resource: string): Permission['action'][] => {
    if (!userPermissions?.effectivePermissions) return [];

    const actions = new Set<Permission['action']>();
    
    userPermissions.effectivePermissions.forEach(permission => {
      if (permission.resource === resource || permission.resource === '*') {
        if (permission.action === 'admin') {
          // Admin tem todas as ações
          actions.add('create');
          actions.add('read');
          actions.add('update');
          actions.add('delete');
          actions.add('export');
          actions.add('import');
          actions.add('admin');
        } else {
          actions.add(permission.action);
        }
      }
    });

    return Array.from(actions);
  }, [userPermissions?.effectivePermissions]);

  // Atualizar papéis do usuário
  const updateUserRoles = useCallback((roleIds: string[]) => {
    return updateUserRolesMutation.mutateAsync(roleIds);
  }, [updateUserRolesMutation]);

  // Criar novo papel
  const createRole = useCallback((roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createRoleMutation.mutateAsync(roleData);
  }, [createRoleMutation]);

  // Papéis agrupados por categoria
  const rolesByCategory = useMemo(() => {
    const categories: Record<string, Role[]> = {
      system: [],
      custom: []
    };

    availableRoles.forEach(role => {
      if (role.isSystem) {
        categories.system.push(role);
      } else {
        categories.custom.push(role);
      }
    });

    return categories;
  }, [availableRoles]);

  // Permissões agrupadas por recurso
  const permissionsByResource = useMemo(() => {
    const resources: Record<string, Permission[]> = {};

    availablePermissions.forEach(permission => {
      if (!resources[permission.resource]) {
        resources[permission.resource] = [];
      }
      resources[permission.resource].push(permission);
    });

    return resources;
  }, [availablePermissions]);

  // Debug de permissões (desenvolvimento)
  const debugPermissions = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;

    return {
      user: user?.name || 'Unknown',
      roles: userPermissions?.roles.map(r => r.name) || [],
      totalPermissions: userPermissions?.effectivePermissions.length || 0,
      resources: Object.keys(permissionsByResource),
      isAdmin: isAdmin()
    };
  }, [user, userPermissions, permissionsByResource, isAdmin]);

  return {
    // Dados das permissões
    userPermissions,
    availableRoles,
    availablePermissions,
    rolesByCategory,
    permissionsByResource,
    
    // Estados
    isLoading,
    error,
    
    // Verificações de permissão
    hasPermission,
    hasRole,
    isAdmin,
    getAllowedActions,
    filterByPermissions,
    
    // Ações
    updateUserRoles,
    createRole,
    refetch,
    
    // Estados de mutação
    isUpdatingRoles: updateUserRolesMutation.isPending,
    isCreatingRole: createRoleMutation.isPending,
    
    // Debug (desenvolvimento)
    debugPermissions
  };
}