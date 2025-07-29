/**
 * COMPONENTE: FileUploadModal
 * Modal para upload de arquivo Excel com produtos
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: () => void;
  onFileUpload: (file: File) => Promise<void>;
}

export const FileUploadModal = ({
  open,
  onOpenChange,
  onFileUpload
}: FileUploadModalProps) => {
  // ===== STATE =====
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== HANDLERS =====
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel')) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel')) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsUploading(false);
    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Produtos do Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <FileSpreadsheet className="h-8 w-8 text-gray-600" />
              </div>
              
              {selectedFile ? (
                <div>
                  <p className="font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-700">
                    Arraste um arquivo Excel aqui
                  </p>
                  <p className="text-sm text-gray-600">
                    ou clique para selecionar
                  </p>
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Format Guidelines */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Formato do Arquivo:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Código SKU (obrigatório)</li>
              <li>• Nome do Produto (obrigatório)</li>
              <li>• Custo (obrigatório)</li>
              <li>• Lead Time, Qtd Mínima, Master Box (opcionais)</li>
              <li>• Estoque, Categoria, Marca (opcionais)</li>
              <li>• Descrição, Dimensões, Peso (opcionais)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Importando...' : 'Importar Produtos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};