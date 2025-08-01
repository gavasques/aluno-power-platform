import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Edit2, 
  Trash2, 
  Calendar,
  Package,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import type { PackingListDocument } from "@shared/schema";

export default function DocumentosSalvos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<PackingListDocument | null>(null);
  
  const { hasAccess } = useUser();

  // Buscar documentos
  const { data: documentsResponse, isLoading, error } = useQuery<{data: PackingListDocument[]}>({
    queryKey: ["/api/packing-list-documents"],
    retry: 2,
  });

  // Buscar documentos com filtro
  const { data: searchResponse } = useQuery<{data: PackingListDocument[]}>({
    queryKey: ["/api/packing-list-documents/search", searchQuery],
    enabled: searchQuery.length > 0,
    retry: 2,
  });

  // Mutation para deletar documento
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/packing-list-documents/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar documento");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Documento deletado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["/api/packing-list-documents"] });
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar documento: ${error.message}`);
    },
  });

  const documents = searchQuery.length > 0 
    ? searchResponse?.data || [] 
    : documentsResponse?.data || [];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar documentos. Tente novamente mais tarde.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = (document: PackingListDocument) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  // Função para baixar o PDF do documento
  const handleDownload = (document: PackingListDocument) => {
    // Por enquanto, redireciona para o gerador com os dados do documento
    // No futuro, pode-se implementar download direto do PDF salvo
    window.location.href = `/minha-area/importacoes/packing-list-generator?documentId=${document.id}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/minha-area/importacoes">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Gestão de Packing Lists</h1>
          </div>
          <p className="text-muted-foreground">
            Crie, visualize, edite e gerencie seus Packing Lists e Commercial Invoices
          </p>
        </div>
        
        <Link href="/minha-area/importacoes/packing-list-generator">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Packing List
          </Button>
        </Link>
      </div>
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
          <CardDescription>
            Busque por número de importação, PO, PL ou CI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Gerados</CardTitle>
          <CardDescription>
            {documents.length} documento{documents.length !== 1 ? "s" : ""} encontrado{documents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Nenhum documento encontrado com essa busca." : "Você ainda não tem documentos salvos."}
              </p>
              {!searchQuery && (
                <Link href="/minha-area/importacoes/packing-list-generator">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Packing List
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Importação</TableHead>
                    <TableHead>PO</TableHead>
                    <TableHead>PL</TableHead>
                    <TableHead>CI</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.importNumber}/{doc.importYear}
                      </TableCell>
                      <TableCell>{doc.poNumber}</TableCell>
                      <TableCell>{doc.plNumber}</TableCell>
                      <TableCell>{doc.ciNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(doc.issueDate), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                          {doc.status === "completed" ? "Completo" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc)}
                            title="Baixar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Link href={`/minha-area/importacoes/packing-list-generator?documentId=${doc.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc)}
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className="space-y-2 py-4">
              <p><strong>Importação:</strong> {documentToDelete.importNumber}/{documentToDelete.importYear}</p>
              <p><strong>PO:</strong> {documentToDelete.poNumber}</p>
              <p><strong>PL:</strong> {documentToDelete.plNumber}</p>
              <p><strong>CI:</strong> {documentToDelete.ciNumber}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}