/**
 * Componente para gerenciar permissões de usuários
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Settings, 
  Save, 
  Plus,
  Search,
  Users,
  Key,
  AlertTriangle
} from 'lucide-react';
import { useRBAC, Role, Permission } from '@/hooks/useRBAC';

interface PermissionsManagerProps {
  userId: string;
  userName: string;
  onClose?: () => void;
  className?: string;
}

export function PermissionsManager({
  userId,
  userName,
  onClose,
  className = ''
}: PermissionsManagerProps) {
  const {
    userPermissions,
    availableRoles,
    rolesByCategory,
    permissionsByResource,
    updateUserRoles,
    createRole,
    isUpdatingRoles,
    isCreatingRole,
    hasPermission
  } = useRBAC({ userId });

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userPermissions?.roles.map(r => r.id) || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Atualizar roles selecionadas quando dados carregarem
  React.useEffect(() => {
    if (userPermissions?.roles) {
      setSelectedRoles(userPermissions.roles.map(r => r.id));
    }
  }, [userPermissions?.roles]);

  // Verificar se pode gerenciar permissões
  const canManagePermissions = hasPermission('users', 'admin') || hasPermission('rbac', 'update');

  if (!canManagePermissions) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar permissões de usuários.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filtrar roles por busca
  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Salvar alterações
  const handleSave = async () => {
    try {
      await updateUserRoles(selectedRoles);
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    }
  };

  // Criar novo papel
  const handleCreateRole = async () => {
    try {
      await createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: availablePermissions.filter(p => 
          newRole.permissions.includes(p.id)
        )
      });
      setShowCreateRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (error) {
      console.error('Erro ao criar papel:', error);
    }
  };

  // Toggle role selection
  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <div>
            <h2 className="text-xl font-semibold">Gerenciar Permissões</h2>
            <p className="text-gray-600">Usuário: {userName}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isUpdatingRoles}
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdatingRoles ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Papéis
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Papel
          </TabsTrigger>
        </TabsList>

        {/* Tab de Papéis */}
        <TabsContent value="roles" className="space-y-4">
          {/* Busca */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar papéis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Papéis do Sistema */}
          {rolesByCategory.system.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Papéis do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rolesByCategory.system
                  .filter(role => 
                    !searchTerm || 
                    role.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(role => (
                    <div key={role.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`role-${role.id}`}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{role.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Sistema
                            </Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {role.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 3).map(permission => (
                              <Badge key={permission.id} variant="secondary" className="text-xs">
                                {permission.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Papéis Customizados */}
          {rolesByCategory.custom.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Papéis Personalizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rolesByCategory.custom
                  .filter(role => 
                    !searchTerm || 
                    role.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(role => (
                    <div key={role.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`role-${role.id}`}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{role.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Personalizado
                            </Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {role.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 3).map(permission => (
                              <Badge key={permission.id} variant="secondary" className="text-xs">
                                {permission.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Permissões Efetivas */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Permissões Efetivas</CardTitle>
              <p className="text-xs text-gray-600">
                Todas as permissões que o usuário terá com os papéis selecionados
              </p>
            </CardHeader>
            <CardContent>
              {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                <div key={resource} className="mb-4">
                  <h4 className="font-medium mb-2 capitalize">{resource}</h4>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map(permission => {
                      const isGranted = selectedRoles.some(roleId => {
                        const role = availableRoles.find(r => r.id === roleId);
                        return role?.permissions.some(p => p.id === permission.id);
                      });

                      return (
                        <Badge 
                          key={permission.id}
                          variant={isGranted ? "default" : "outline"}
                          className="text-xs"
                        >
                          {permission.action}
                        </Badge>
                      );
                    })}
                  </div>
                  <Separator className="mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab para Criar Papel */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Criar Novo Papel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role-name">Nome do Papel</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Editor de Conteúdo"
                />
              </div>

              <div>
                <Label htmlFor="role-description">Descrição</Label>
                <Input
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades deste papel"
                />
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                  {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                    <div key={resource}>
                      <h4 className="font-medium text-sm mb-2 capitalize">{resource}</h4>
                      <div className="space-y-2 ml-4">
                        {permissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={newRole.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                setNewRole(prev => ({
                                  ...prev,
                                  permissions: checked
                                    ? [...prev.permissions, permission.id]
                                    : prev.permissions.filter(id => id !== permission.id)
                                }));
                              }}
                            />
                            <label 
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.name} ({permission.action})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateRole}
                disabled={!newRole.name || isCreatingRole}
                className="w-full"
              >
                {isCreatingRole ? 'Criando...' : 'Criar Papel'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}