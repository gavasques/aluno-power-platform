// Knowledge Base Manager Component - Placeholder for managing AI knowledge bases

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Plus, 
  FileText, 
  Upload,
  Search,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

export function KnowledgeBaseManager() {
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Base Geral",
      description: "Conhecimento geral da empresa",
      documentCount: 15,
      isDefault: true
    },
    {
      id: 2,
      name: "Produtos Amazon",
      description: "Informações específicas sobre produtos Amazon",
      documentCount: 8,
      isDefault: false
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: ""
  });

  const handleCreateCollection = () => {
    if (newCollection.name.trim()) {
      const collection = {
        id: Date.now(),
        name: newCollection.name,
        description: newCollection.description,
        documentCount: 0,
        isDefault: false
      };
      setCollections([...collections, collection]);
      setNewCollection({ name: "", description: "" });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gerenciamento de Base de Conhecimento
            </CardTitle>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Coleção
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Collection Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova Coleção de Conhecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Coleção</label>
              <Input
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                placeholder="Ex: Base de Produtos, Documentação Técnica..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                placeholder="Descreva o tipo de conhecimento que será armazenado nesta coleção..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCollection}>Criar Coleção</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {collection.name}
                </CardTitle>
                {collection.isDefault && (
                  <Badge className="bg-blue-100 text-blue-800">Padrão</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Documentos:
                  </span>
                  <Badge variant="outline">{collection.documentCount}</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Search className="w-3 h-3 mr-1" />
                    Buscar
                  </Button>
                  {!collection.isDefault && (
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Upload className="w-6 h-6 mb-2" />
            Upload em Lote
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Search className="w-6 h-6 mb-2" />
            Busca Global
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Database className="w-6 h-6 mb-2" />
            Estatísticas
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {collections.reduce((sum, c) => sum + c.documentCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Documentos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{collections.length}</div>
              <div className="text-sm text-muted-foreground">Coleções</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-muted-foreground">Consultas Hoje</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}