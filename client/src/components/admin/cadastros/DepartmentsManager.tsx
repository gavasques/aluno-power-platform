
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
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-foreground">Gerenciar Departamentos</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
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
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="mr-2">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-3">
            {filteredDepartments.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum departamento encontrado.
              </div>
            )}
            {filteredDepartments.map((department) => (
              <div
                key={department}
                className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-foreground">{department}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
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
