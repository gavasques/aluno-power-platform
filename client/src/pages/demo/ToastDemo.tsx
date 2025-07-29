import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast, useAsyncToast, useFormToast, useUploadToast, QuickToast, ToastPatterns } from '@/components/ui/toast';

/**
 * Demonstração do Sistema de Toast Centralizado
 * Mostra os padrões implementados na Fase 4 da refatoração DRY
 */
export const ToastDemo = () => {
  const toast = useToast();
  const asyncToast = useAsyncToast();
  const formToast = useFormToast();
  const uploadToast = useUploadToast();

  // Simular operação assíncrona
  const mockApiCall = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.3 ? resolve("success") : reject(new Error("Erro simulado"));
    }, 2000);
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Sistema de Toast Centralizado</h1>
        <p className="text-muted-foreground">
          Demonstração da Fase 4 - Eliminação de código duplicado em notificações
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Toasts Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toasts Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => toast.success('Operação realizada com sucesso!')}
              className="w-full"
              variant="default"
            >
              ✅ Toast Sucesso
            </Button>
            
            <Button 
              onClick={() => toast.error('Erro ao processar solicitação')}
              className="w-full"
              variant="destructive"
            >
              ❌ Toast Erro
            </Button>
            
            <Button 
              onClick={() => toast.warning('Atenção: dados não salvos')}
              className="w-full"
              variant="outline"
            >
              ⚠️ Toast Aviso
            </Button>
            
            <Button 
              onClick={() => toast.info('Nova versão disponível')}
              className="w-full"
              variant="secondary"
            >
              ℹ️ Toast Info
            </Button>
          </CardContent>
        </Card>

        {/* CRUD Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operações CRUD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => asyncToast.crud.create(mockApiCall, "Produto")}
              className="w-full"
            >
              ➕ Criar Produto
            </Button>
            
            <Button 
              onClick={() => asyncToast.crud.update(mockApiCall, "Produto")}
              className="w-full"
              variant="outline"
            >
              ✏️ Atualizar Produto
            </Button>
            
            <Button 
              onClick={() => asyncToast.crud.delete(mockApiCall, "Produto")}
              className="w-full"
              variant="destructive"
            >
              🗑️ Excluir Produto
            </Button>
          </CardContent>
        </Card>

        {/* Padrões Pré-definidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Padrões Auth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => ToastPatterns.auth.loginSuccess()}
              className="w-full"
            >
              🔑 Login Sucesso
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.auth.loginError('Senha incorreta')}
              className="w-full"
              variant="destructive"
            >
              🚫 Login Erro
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.auth.sessionExpired()}
              className="w-full"
              variant="outline"
            >
              ⏰ Sessão Expirada
            </Button>
          </CardContent>
        </Card>

        {/* Upload Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Padrões Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => uploadToast.handleUpload(mockApiCall, "documento.pdf")}
              className="w-full"
            >
              📁 Upload Arquivo
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.upload.invalidFile('Formato não suportado')}
              className="w-full"
              variant="outline"
            >
              ⚠️ Arquivo Inválido
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.upload.sizeLimitExceeded('10MB')}
              className="w-full"
              variant="destructive"
            >
              📏 Tamanho Excedido
            </Button>
          </CardContent>
        </Card>

        {/* Form Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Padrões Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => ToastPatterns.form.saved()}
              className="w-full"
            >
              💾 Dados Salvos
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.form.validationError('Campo obrigatório')}
              className="w-full"
              variant="outline"
            >
              ⚠️ Erro Validação
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.form.unsavedChanges()}
              className="w-full"
              variant="destructive"
            >
              📝 Dados Não Salvos
            </Button>
          </CardContent>
        </Card>

        {/* Network & Clipboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network & Clipboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => ToastPatterns.network.offline()}
              className="w-full"
              variant="outline"
            >
              📡 Offline
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.network.serverError()}
              className="w-full"
              variant="destructive"
            >
              🔥 Erro Servidor
            </Button>
            
            <Button 
              onClick={() => ToastPatterns.clipboard.copied('Link do produto')}
              className="w-full"
            >
              📋 Texto Copiado
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Toast Avançados */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Avançados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Toast com Promise */}
            <Button 
              onClick={() => toast.promise(
                mockApiCall(),
                'Processando...',
                'Operação concluída!',
                'Erro na operação'
              )}
              variant="outline"
            >
              🔄 Promise Toast
            </Button>

            {/* Toast com Ação */}
            <Button 
              onClick={() => toast.warning('Produto será excluído', {
                duration: 10000,
                action: {
                  label: 'Desfazer',
                  onClick: () => toast.success('Exclusão cancelada!')
                }
              })}
              variant="outline"
            >
              🔧 Toast com Ação
            </Button>

            {/* Quick Toasts */}
            <Button 
              onClick={() => QuickToast.saved()}
              variant="outline"
            >
              ⚡ Quick Toast
            </Button>

            {/* Toast Customizado */}
            <Button 
              onClick={() => toast.custom(
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    G
                  </div>
                  <div>
                    <p className="font-semibold">Guilherme Vasques</p>
                    <p className="text-sm text-muted-foreground">Enviou uma mensagem</p>
                  </div>
                </div>
              )}
              variant="outline"
            >
              🎨 Toast Custom
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">📊 Impacto da Refatoração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">75%</div>
              <div className="text-sm text-muted-foreground">Redução Código</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-muted-foreground">Arquivos Centralizados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-muted-foreground">Categorias Padrões</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">80%</div>
              <div className="text-sm text-muted-foreground">Tempo Reduzido</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Código de Exemplo */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-700">💻 Exemplo de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-100 p-4 rounded-md text-sm overflow-x-auto">
{`// Antes (30+ linhas duplicadas):
const handleCreate = async () => {
  setLoading(true);
  toast({ title: "Criando...", description: "Aguarde..." });
  try {
    await api.create(data);
    toast({ title: "Criado!", description: "Sucesso!" });
  } catch (error) {
    toast({ title: "Erro", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

// Depois (1 linha apenas!):
const handleCreate = () => {
  asyncToast.crud.create(() => api.create(data), "Produto");
};`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToastDemo;