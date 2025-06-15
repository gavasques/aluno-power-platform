
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

const CategoriesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Eletrônicos",
    "Roupas",
    "Casa e Jardim"
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([newCategory.trim(), ...categories]);
    }
    setNewCategory("");
    setIsDialogOpen(false);
  }

  function handleDeleteCategory(category: string) {
    setCategories(categories.filter(c => c !== category));
  }

  return (
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-slate-100">Gerenciar Categorias</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>Informe o nome da nova categoria.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome da Categoria"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="mr-2">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="space-y-3">
            {filteredCategories.length === 0 && (
              <div className="text-slate-400 px-4 py-8 text-center">
                Nenhuma categoria encontrada.
              </div>
            )}
            {filteredCategories.map((category, idx) => (
              <div
                key={category}
                className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg"
              >
                <span className="font-medium text-slate-100">{category}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesManager;
