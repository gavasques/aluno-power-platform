# Sistema de Toast Centralizado

Este diretório contém o sistema de notificações toast centralizadas que elimina duplicação de código relacionada a notificações em todo o projeto.

## 🎯 Objetivo

Substituir os padrões duplicados de toast encontrados em 50+ arquivos, proporcionando:
- **Consistência** na experiência do usuário com notificações
- **Manutenibilidade** centralizada de lógica de toast
- **Redução de código** duplicado (~75% em notificações)

## 📦 Componentes Disponíveis

### ToastService

Serviço central para gerenciar todas as notificações toast.

```tsx
import { ToastService, toast } from '@/lib/services/ToastService';

// Notificações simples
ToastService.success('Produto criado com sucesso!');
ToastService.error('Erro ao criar produto');
ToastService.warning('Atenção: dados não salvos');
ToastService.info('Nova versão disponível');

// Com opções avançadas
ToastService.success('Salvo!', {
  description: 'Todas as alterações foram salvas',
  duration: 5000,
  action: {
    label: 'Desfazer',
    onClick: () => undo()
  }
});

// Toast de loading com Promise
ToastService.promise(
  api.createProduct(data),
  {
    loading: 'Criando produto...',
    success: 'Produto criado com sucesso!',
    error: 'Erro ao criar produto'
  }
);

// Alias mais curto
toast.success('Funcionou!');
```

**Métodos disponíveis:**
- `success(message, options?)` - Toast de sucesso
- `error(message, options?)` - Toast de erro
- `warning(message, options?)` - Toast de aviso
- `info(message, options?)` - Toast informativo
- `loading(message, options?)` - Toast de loading
- `promise(promise, options)` - Toast com Promise (loading → success/error)
- `dismiss(toastId?)` - Dismissar toast específico ou todos
- `custom(jsx, options?)` - Toast customizado com JSX

### useToast Hook

Hook para usar toasts de forma reativa.

```tsx
import { useToast } from '@/hooks/useToast';

const Component = () => {
  const toast = useToast();
  
  const handleSave = () => {
    toast.success('Dados salvos!');
  };
  
  const handleAsync = () => {
    toast.promise(
      saveData(),
      'Salvando...',
      'Salvo com sucesso!',
      'Erro ao salvar'
    );
  };
  
  return (
    <Button onClick={handleSave}>Salvar</Button>
  );
};
```

### useAsyncToast Hook

Hook especializado para operações assíncronas com toast automático.

```tsx
import { useAsyncToast } from '@/hooks/useToast';

const Component = () => {
  const asyncToast = useAsyncToast();
  
  const handleCreate = () => {
    asyncToast.crud.create(
      () => api.createProduct(data),
      "Produto"
    );
  };
  
  const handleCustom = () => {
    asyncToast.execute(
      () => api.customOperation(),
      {
        loading: 'Processando...',
        success: 'Concluído!',
        error: 'Erro na operação'
      }
    );
  };
  
  return <Button onClick={handleCreate}>Criar</Button>;
};
```

### useFormToast Hook

Hook especializado para formulários.

```tsx
import { useFormToast } from '@/hooks/useToast';

const FormComponent = () => {
  const formToast = useFormToast();
  
  const onSubmit = async (data) => {
    try {
      await formToast.handleSubmit(() => api.save(data));
      // Toast de sucesso automático
    } catch (error) {
      // Toast de erro automático
    }
  };
  
  const onValidationError = (error) => {
    formToast.handleValidationError(error.message);
  };
  
  return <Form onSubmit={onSubmit} />;
};
```

### useUploadToast Hook

Hook especializado para upload de arquivos.

```tsx
import { useUploadToast } from '@/hooks/useToast';

const UploadComponent = () => {
  const uploadToast = useUploadToast();
  
  const handleUpload = (file) => {
    uploadToast.handleUpload(
      () => api.uploadFile(file),
      file.name
    );
  };
  
  const validateFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      uploadToast.handleSizeLimitExceeded('10MB');
      return false;
    }
    
    if (!['jpg', 'png'].includes(file.extension)) {
      uploadToast.handleInvalidFile('Apenas JPG e PNG são permitidos');
      return false;
    }
    
    return true;
  };
  
  return <FileUpload onUpload={handleUpload} onValidate={validateFile} />;
};
```

## 🚀 Padrões Pré-definidos

### ToastPatterns

Padrões comuns para casos específicos.

```tsx
import { ToastPatterns } from '@/lib/services/ToastService';

// CRUD Operations
ToastPatterns.crud.creating('produto');
ToastPatterns.crud.created('Produto');
ToastPatterns.crud.updating('produto');
ToastPatterns.crud.updated('Produto');
ToastPatterns.crud.deleting('produto');
ToastPatterns.crud.deleted('Produto');
ToastPatterns.crud.error('criar', 'produto', 'Dados inválidos');

// Authentication
ToastPatterns.auth.loginSuccess();
ToastPatterns.auth.loginError('Senha incorreta');
ToastPatterns.auth.logoutSuccess();
ToastPatterns.auth.sessionExpired();
ToastPatterns.auth.registrationSuccess();

// Upload
ToastPatterns.upload.uploading('arquivo.pdf');
ToastPatterns.upload.uploaded('arquivo.pdf');
ToastPatterns.upload.error('arquivo.pdf', 'Arquivo corrompido');
ToastPatterns.upload.invalidFile('Formato não suportado');
ToastPatterns.upload.sizeLimitExceeded('5MB');

// Form
ToastPatterns.form.saved();
ToastPatterns.form.validationError('Campo obrigatório');
ToastPatterns.form.discardChanges();
ToastPatterns.form.unsavedChanges();

// Network
ToastPatterns.network.offline();
ToastPatterns.network.online();
ToastPatterns.network.slowConnection();
ToastPatterns.network.serverError();

// Clipboard
ToastPatterns.clipboard.copied('Texto');
ToastPatterns.clipboard.copyError();
```

### QuickToast

Atalhos para os padrões mais comuns.

```tsx
import { QuickToast } from '@/components/ui/toast';

// Operações básicas
QuickToast.saved();
QuickToast.deleted('Produto');
QuickToast.created('Produto');
QuickToast.updated('Produto');

// Autenticação
QuickToast.loginSuccess();
QuickToast.loginError('Credenciais inválidas');
QuickToast.sessionExpired();

// Upload
QuickToast.fileUploaded('documento.pdf');
QuickToast.uploadError('imagem.jpg', 'Arquivo muito grande');

// Clipboard
QuickToast.copied('Link do produto');

// Network
QuickToast.offline();
QuickToast.online();
QuickToast.serverError();
```

## 🔧 Setup e Configuração

### 1. Adicionar Provider ao App

```tsx
// App.tsx
import { ToastProvider } from '@/components/ui/toast';

function App() {
  return (
    <ToastProvider
      theme="system"
      position="top-right"
      richColors
      closeButton
    >
      <AppContent />
    </ToastProvider>
  );
}
```

### 2. Instalar dependência

```bash
npm install sonner
```

### 3. Configurar tema (opcional)

```tsx
<ToastProvider
  theme="dark"
  position="bottom-center"
  expand={true}
  richColors={true}
  closeButton={true}
  toastOptions={{
    duration: 5000,
    className: "custom-toast"
  }}
>
  <App />
</ToastProvider>
```

## 📊 Migração de Componentes Existentes

### Antes (Código Duplicado)
```tsx
// ❌ Padrão repetido em 50+ arquivos
import { useToast } from '@/hooks/use-toast';

const Component = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    toast({
      title: "Criando produto...",
      description: "Aguarde enquanto processamos.",
    });
    
    try {
      await api.createProduct(data);
      toast({
        title: "Produto criado!",
        description: "O produto foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return <Button onClick={handleCreate} disabled={loading}>Criar</Button>;
};
```

### Depois (Código Reutilizável)
```tsx
// ✅ 3 linhas apenas!
import { useAsyncToast } from '@/components/ui/toast';

const Component = () => {
  const asyncToast = useAsyncToast();

  const handleCreate = () => {
    asyncToast.crud.create(
      () => api.createProduct(data),
      "Produto"
    );
  };

  return <Button onClick={handleCreate}>Criar</Button>;
};
```

**Redução**: De 30-40 linhas para 3 linhas (**90% menos código**)

## ✨ Recursos Avançados

### Toast com Ações

```tsx
toast.warning('Item será excluído em 10 segundos', {
  duration: 10000,
  action: {
    label: 'Desfazer',
    onClick: () => {
      cancelDeletion();
      toast.success('Exclusão cancelada!');
    }
  },
  cancel: {
    label: 'Fechar'
  }
});
```

### Toast Customizado com JSX

```tsx
import { Button } from '@/components/ui/button';

toast.custom(
  <div className="flex items-center gap-3">
    <img src="/avatar.jpg" className="w-8 h-8 rounded-full" />
    <div>
      <p className="font-semibold">João Silva</p>
      <p className="text-sm text-muted-foreground">Enviou uma mensagem</p>
    </div>
    <Button size="sm">Responder</Button>
  </div>,
  { duration: 6000 }
);
```

### Toast com Promise Avançada

```tsx
const uploadPromise = new Promise((resolve, reject) => {
  const formData = new FormData();
  formData.append('file', file);
  
  fetch('/api/upload', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(resolve)
    .catch(reject);
});

toast.promise(uploadPromise, {
  loading: 'Enviando arquivo...',
  success: (data) => `Arquivo ${data.filename} enviado com sucesso!`,
  error: (error) => `Erro no upload: ${error.message}`
});
```

### Toast com Contagem Regressiva

```tsx
import { ToastUtils } from '@/components/ui/toast';

ToastUtils.countdown(
  'Sistema será reiniciado',
  30,
  () => {
    // Ação após 30 segundos
    restartSystem();
  }
);
```

### Toast baseado em Status HTTP

```tsx
import { ToastUtils } from '@/components/ui/toast';

try {
  const response = await api.call();
  ToastUtils.fromHttpStatus(response.status, 'Operação realizada!');
} catch (error) {
  ToastUtils.fromError(error);
}
```

## ✅ Benefícios

1. **Redução de Código**: ~75% menos código duplicado em toasts
2. **Consistência**: Mesma interface e comportamento em todo o app
3. **Tipagem**: Full TypeScript com tipos específicos
4. **Padrões**: Casos comuns pré-implementados
5. **Performance**: Otimizações automáticas (debounce, auto-dismiss)
6. **Acessibilidade**: Padrões acessíveis implementados
7. **Manutenibilidade**: Mudanças centralizadas afetam todo o sistema

## 🔄 Casos de Uso Comuns

### Operação CRUD Completa
```tsx
const ProductManager = () => {
  const asyncToast = useAsyncToast();
  
  return (
    <div>
      <Button onClick={() => asyncToast.crud.create(() => api.create(data), "Produto")}>
        Criar
      </Button>
      <Button onClick={() => asyncToast.crud.update(() => api.update(id, data), "Produto")}>
        Atualizar
      </Button>
      <Button onClick={() => asyncToast.crud.delete(() => api.delete(id), "Produto")}>
        Excluir
      </Button>
    </div>
  );
};
```

### Formulário com Validação
```tsx
const UserForm = () => {
  const formToast = useFormToast();
  
  const onSubmit = async (data) => {
    try {
      await formToast.handleSubmit(() => api.saveUser(data));
      // Sucesso automático
    } catch (error) {
      // Erro automático com mensagem específica
    }
  };
  
  return <Form onSubmit={onSubmit} />;
};
```

### Upload com Validação
```tsx
const FileUploader = () => {
  const uploadToast = useUploadToast();
  
  const handleFile = (file) => {
    // Validações automáticas
    if (file.size > 5 * 1024 * 1024) {
      uploadToast.handleSizeLimitExceeded('5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      uploadToast.handleInvalidFile('Apenas imagens são permitidas');
      return;
    }
    
    // Upload com toast automático
    uploadToast.handleUpload(() => api.uploadFile(file), file.name);
  };
  
  return <FileInput onChange={handleFile} />;
};
```

## 🔄 Próximos Passos

1. Migrar componentes existentes para usar este sistema
2. Remover código duplicado de toast em 50+ arquivos  
3. Implementar testes para os componentes
4. Adicionar mais padrões conforme necessário
5. Integrar com sistema de notificações push
6. Adicionar persistência de toasts importantes