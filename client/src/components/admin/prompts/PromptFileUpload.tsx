
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  FileText, 
  X,
  Download
} from 'lucide-react';
import { PromptFile } from '@/types/prompt';
import { useToast } from '@/hooks/use-toast';

interface PromptFileUploadProps {
  files: PromptFile[];
  onFilesChange: (files: PromptFile[]) => void;
}

export const PromptFileUpload = ({ files, onFilesChange }: PromptFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      // Simular upload do arquivo
      const newFile: PromptFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file), // Em produção, seria o URL do servidor
        type: file.type,
        size: file.size,
      };

      onFilesChange([...files, newFile]);
    });

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Arquivo(s) adicionado(s)",
      description: `${selectedFiles.length} arquivo(s) foram adicionados ao prompt.`,
    });
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(file => file.id !== fileId));
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido do prompt.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Arquivos do Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Adicionar Arquivos</Label>
          <div className="mt-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Selecionar Arquivos
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione arquivos que o usuário pode precisar usar junto com o prompt
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos Adicionados</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
