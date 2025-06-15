
import React, { useState } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { Partner, PartnerMaterial } from '@/types/partner';

interface PartnerMaterialsManagerProps {
  partner: Partner;
  onClose: () => void;
}

const PartnerMaterialsManager: React.FC<PartnerMaterialsManagerProps> = ({ 
  partner, 
  onClose 
}) => {
  const { addMaterial, deleteMaterial } = usePartners();
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [materialData, setMaterialData] = useState({
    name: '',
    fileUrl: '',
    fileType: 'application/pdf',
    fileSize: 0,
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialData.name || !materialData.fileUrl) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      addMaterial(partner.id, materialData);
      
      toast({
        title: "Sucesso",
        description: "Material adicionado com sucesso!",
      });

      setMaterialData({
        name: '',
        fileUrl: '',
        fileType: 'application/pdf',
        fileSize: 0,
      });
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o material.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      try {
        deleteMaterial(partner.id, materialId);
        toast({
          title: "Sucesso",
          description: "Material removido com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o material.",
          variant: "destructive",
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            Materiais - {partner.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Material Button */}
          <div className="flex justify-between items-center">
            <p className="text-slate-400">
              Gerencie os materiais disponibilizados por este parceiro
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Material
            </Button>
          </div>

          {/* Add Material Form */}
          {showAddForm && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-slate-100">Novo Material</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Nome do Material *</Label>
                    <Input
                      value={materialData.name}
                      onChange={(e) => setMaterialData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Guia de Abertura de Empresa"
                      className="bg-slate-600 border-slate-500 text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">URL do Arquivo *</Label>
                    <Input
                      value={materialData.fileUrl}
                      onChange={(e) => setMaterialData(prev => ({ ...prev, fileUrl: e.target.value }))}
                      placeholder="Ex: /docs/guia.pdf ou https://exemplo.com/arquivo.pdf"
                      className="bg-slate-600 border-slate-500 text-slate-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Tipo de Arquivo</Label>
                      <Input
                        value={materialData.fileType}
                        onChange={(e) => setMaterialData(prev => ({ ...prev, fileType: e.target.value }))}
                        placeholder="Ex: application/pdf"
                        className="bg-slate-600 border-slate-500 text-slate-100"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Tamanho (bytes)</Label>
                      <Input
                        type="number"
                        value={materialData.fileSize}
                        onChange={(e) => setMaterialData(prev => ({ ...prev, fileSize: Number(e.target.value) }))}
                        placeholder="Ex: 2048000"
                        className="bg-slate-600 border-slate-500 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Material
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Materials List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Materiais Cadastrados ({partner.materials.length})
            </h3>
            
            {partner.materials.length > 0 ? (
              <div className="grid gap-4">
                {partner.materials.map((material) => (
                  <Card key={material.id} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-400" />
                          <div>
                            <h4 className="font-medium text-slate-100">{material.name}</h4>
                            <p className="text-sm text-slate-400">
                              {formatFileSize(material.fileSize)} • {material.fileType}
                            </p>
                            <p className="text-xs text-slate-500">
                              Adicionado em {new Date(material.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(material.fileUrl, '_blank')}
                            className="border-slate-600 text-slate-300"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum material cadastrado</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Adicione materiais para que os usuários possam acessá-los
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-600 text-slate-300"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerMaterialsManager;
