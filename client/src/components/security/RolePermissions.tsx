import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Lock, 
  Unlock, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  userCount: number;
}

export const RolePermissions = () => {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as string[] });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available permissions by category
  const availablePermissions: Permission[] = [
    // Content Management
    { id: "news.create", name: "Criar Notícias", description: "Criar novas notícias", category: "Conteúdo" },
    { id: "news.edit", name: "Editar Notícias", description: "Editar notícias existentes", category: "Conteúdo" },
    { id: "news.delete", name: "Deletar Notícias", description: "Remover notícias", category: "Conteúdo" },
    { id: "news.publish", name: "Publicar Notícias", description: "Publicar/despublicar notícias", category: "Conteúdo" },
    
    // Updates Management
    { id: "updates.create", name: "Criar Atualizações", description: "Criar novas atualizações", category: "Atualizações" },
    { id: "updates.edit", name: "Editar Atualizações", description: "Editar atualizações existentes", category: "Atualizações" },
    { id: "updates.delete", name: "Deletar Atualizações", description: "Remover atualizações", category: "Atualizações" },
    { id: "updates.publish", name: "Publicar Atualizações", description: "Publicar/despublicar atualizações", category: "Atualizações" },
    
    // User Management
    { id: "users.view", name: "Ver Usuários", description: "Visualizar lista de usuários", category: "Usuários" },
    { id: "users.create", name: "Criar Usuários", description: "Criar novos usuários", category: "Usuários" },
    { id: "users.edit", name: "Editar Usuários", description: "Editar perfis de usuários", category: "Usuários" },
    { id: "users.delete", name: "Deletar Usuários", description: "Remover usuários", category: "Usuários" },
    
    // System Administration
    { id: "admin.audit", name: "Ver Logs de Auditoria", description: "Acessar logs de auditoria", category: "Sistema" },
    { id: "admin.settings", name: "Configurações", description: "Alterar configurações do sistema", category: "Sistema" },
    { id: "admin.webhooks", name: "Gerenciar Webhooks", description: "Configurar webhooks", category: "Sistema" },
    { id: "admin.analytics", name: "Analytics Avançado", description: "Acessar analytics completo", category: "Sistema" },
    
    // Hub Management
    { id: "hub.materials", name: "Gerenciar Materiais", description: "CRUD de materiais", category: "Hub" },
    { id: "hub.suppliers", name: "Gerenciar Fornecedores", description: "CRUD de fornecedores", category: "Hub" },
    { id: "hub.partners", name: "Gerenciar Parceiros", description: "CRUD de parceiros", category: "Hub" },
    { id: "hub.products", name: "Gerenciar Produtos", description: "CRUD de produtos", category: "Hub" },
    { id: "hub.tools", name: "Gerenciar Ferramentas", description: "CRUD de ferramentas", category: "Hub" },
  ];

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: { name: string; description: string; permissions: string[] }) =>
      apiRequest('/api/roles', { method: 'POST', body: roleData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setShowCreateForm(false);
      setNewRole({ name: "", description: "", permissions: [] });
      toast({ title: "Função criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar função", variant: "destructive" });
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Role>) =>
      apiRequest(`/api/roles/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setEditingRole(null);
      toast({ title: "Função atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar função", variant: "destructive" });
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({ title: "Função removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover função", variant: "destructive" });
    }
  });

  const handlePermissionToggle = (roleId: number, permissionId: string, checked: boolean) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const updatedPermissions = checked
      ? [...role.permissions, permissionId]
      : role.permissions.filter(p => p !== permissionId);

    updateRoleMutation.mutate({
      id: roleId,
      permissions: updatedPermissions
    });
  };

  const handleNewRolePermissionToggle = (permissionId: string, checked: boolean) => {
    setNewRole(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const groupedPermissions = groupPermissionsByCategory(availablePermissions);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Funções e Permissões</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Função
        </Button>
      </div>

      {/* Create New Role Form */}
      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-900">Criar Nova Função</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                className="text-blue-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-name">Nome da Função</Label>
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
                  placeholder="Breve descrição da função"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Permissões</Label>
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-1">{category}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          id={`new-${permission.id}`}
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => handleNewRolePermissionToggle(permission.id, checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`new-${permission.id}`} className="text-sm cursor-pointer">
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

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => createRoleMutation.mutate(newRole)}
                disabled={!newRole.name || createRoleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {createRoleMutation.isPending ? "Salvando..." : "Criar Função"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Roles */}
      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className={role.isSystemRole ? "border-yellow-200 bg-yellow-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {role.isSystemRole ? (
                      <Lock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Unlock className="h-5 w-5 text-gray-600" />
                    )}
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <Badge variant={role.isSystemRole ? "secondary" : "outline"} className="text-xs">
                    {role.userCount} usuário{role.userCount !== 1 ? 's' : ''}
                  </Badge>
                  {role.isSystemRole && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Sistema</Badge>
                  )}
                </div>
                {!role.isSystemRole && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingRole(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRoleMutation.mutate(role.id)}
                      disabled={deleteRoleMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Switch
                            id={`${role.id}-${permission.id}`}
                            checked={role.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionToggle(role.id, permission.id, checked)}
                            disabled={role.isSystemRole || updateRoleMutation.isPending}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`${role.id}-${permission.id}`} className="text-sm cursor-pointer">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma função encontrada</h3>
          <p className="text-gray-500 mb-4">Crie a primeira função para gerenciar permissões de usuários</p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Função
          </Button>
        </div>
      )}
    </div>
  );
};