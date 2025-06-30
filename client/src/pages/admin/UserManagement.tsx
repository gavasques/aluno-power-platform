
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Search, Shield, UserCheck, UserX, Mail, Phone } from "lucide-react";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "João Silva", email: "joao@email.com", role: "Admin", status: "active", lastLogin: "Hoje" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", role: "Student", status: "active", lastLogin: "2 dias atrás" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", role: "Support", status: "inactive", lastLogin: "1 semana atrás" },
  ];

  const groups = [
    { id: 1, name: "Administradores", members: 3, permissions: ["all"] },
    { id: 2, name: "Alunos Premium", members: 145, permissions: ["courses", "hub", "simulators"] },
    { id: 3, name: "Suporte", members: 8, permissions: ["support", "users_view"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600">Controle de usuários, grupos e permissões</p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-gray-100 border-gray-200">
          <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-700">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-700">
            <Shield className="h-4 w-4 mr-2" />
            Grupos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">Lista de Usuários</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar usuários..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </span>
                          <span>Último login: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={
                        user.role === 'Admin' ? 'bg-red-100 text-red-800 border-red-200' :
                        user.role === 'Support' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }>
                        {user.role}
                      </Badge>
                      <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button size="sm" variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-gray-900">{group.name}</CardTitle>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {group.members} membros
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permissões:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.permissions.map((permission, index) => (
                          <Badge key={index} className="bg-gray-100 text-gray-700 border-gray-200">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
