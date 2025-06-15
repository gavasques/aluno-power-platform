
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Database } from "lucide-react";

const CategoriesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for categories
  const categories = [
    { id: 1, name: "Eletrônicos", description: "Produtos eletrônicos e gadgets", items: 245, status: "active" },
    { id: 2, name: "Roupas", description: "Vestuário e acessórios", items: 156, status: "active" },
    { id: 3, name: "Casa e Jardim", description: "Itens para casa e decoração", items: 89, status: "inactive" }
  ];

  return (
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Gerenciar Categorias</CardTitle>
          </div>
          <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar categorias..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-100">{category.name}</h3>
                  <p className="text-sm text-slate-400">{category.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-slate-500">{category.items} itens</span>
                    <Badge className={category.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {category.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300 hover:bg-slate-500/50">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesManager;
