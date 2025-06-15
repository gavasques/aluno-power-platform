
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

const DepartmentsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<string[]>([
    "Eletrônicos",
    "Roupas",
    "Casa e Jardim"
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");

  const filteredDepartments = departments.filter((dept) =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([newDepartment.trim(), ...departments]);
    }
    setNewDepartment("");
    setIsDialogOpen(false);
  }

  function handleDeleteDepartment(department: string) {
    setDepartments(departments.filter(d => d !== department));
  }

  return (
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-slate-100">Gerenciar Departamentos</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Departamento</DialogTitle>
                <DialogDescription>Informe o nome do novo departamento.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome do Departamento"
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
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
              placeholder="Buscar departamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="space-y-3">
            {filteredDepartments.length === 0 && (
              <div className="text-slate-400 px-4 py-8 text-center">
                Nenhum departamento encontrado.
              </div>
            )}
            {filteredDepartments.map((department) => (
              <div
                key={department}
                className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg"
              >
                <span className="font-medium text-slate-100">{department}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  onClick={() => handleDeleteDepartment(department)}
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
export default DepartmentsManager;

