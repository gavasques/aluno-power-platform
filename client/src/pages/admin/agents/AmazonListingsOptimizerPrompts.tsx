import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  TestTube, 
  History, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Eye,
  Copy,
  Sparkles,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PromptVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'archived' | 'draft';
  testResults?: {
    success: boolean;
    message: string;
    testedAt: string;
  };
}

interface AgentPrompt {
  id: string;
  name: string;
  description: string;
  currentVersion: PromptVersion;
  versions: PromptVersion[];
  variables: string[];
  maxLength: number;
}

const PROMPT_VARIABLES = {
  analysis: [
    '{{PRODUCT_NAME}}',
    '{{PRODUCT_DESCRIPTION}}', 
    '{{KEYWORDS}}',
    '{{COMPETITOR_REVIEWS}}',
    '{{CATEGORY}}'
  ],
  titles: [
    '{{PRODUCT_NAME}}',
    '{{KEYWORDS}}',
    '{{MAIN_BENEFITS}}',
    '{{TARGET_AUDIENCE}}',
    '{{CATEGORY}}'
  ],
  bulletPoints: [
    '{{PRODUCT_NAME}}',
    '{{KEY_FEATURES}}',
    '{{MAIN_BENEFITS}}',
    '{{PAIN_POINTS}}',
    '{{EMOTIONAL_TRIGGERS}}'
  ],
  description: [
    '{{PRODUCT_NAME}}',
    '{{ANALYSIS_RESULT}}',
    '{{KEY_FEATURES}}',
    '{{TARGET_AUDIENCE}}',
    '{{MARKET_DIFFERENTIATORS}}'
  ]
};

function VariablesList({ variables }: { variables: string[] }) {
  const { toast } = useToast();

  const copyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      toast({
        description: `Variável ${variable} copiada!`
      });
    } catch (error) {
      toast({
        description: "Erro ao copiar variável",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Variáveis Disponíveis
      </h4>
      <div className="flex flex-wrap gap-2">
        {variables.map((variable) => (
          <button
            key={variable}
            onClick={() => copyVariable(variable)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded border hover:bg-blue-200 transition-colors"
          >
            {variable}
            <Copy className="w-3 h-3" />
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-2">
        Clique nas variáveis para copiar. Elas serão substituídas automaticamente durante o processamento.
      </p>
    </div>
  );
}

function PromptEditor({ 
  prompt, 
  onSave, 
  onTest, 
  isSaving, 
  isTesting 
}: { 
  prompt: AgentPrompt;
  onSave: (content: string) => void;
  onTest: (content: string) => void;
  isSaving: boolean;
  isTesting: boolean;
}) {
  const [content, setContent] = useState(prompt.currentVersion.content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(prompt.currentVersion.content);
    setHasChanges(false);
  }, [prompt.currentVersion.content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== prompt.currentVersion.content);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{prompt.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{prompt.description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTest(content)}
            disabled={isTesting || !hasChanges}
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Testando...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Testar
              </>
            )}
          </Button>
          <Button 
            onClick={() => onSave(content)}
            disabled={isSaving || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <VariablesList variables={prompt.variables} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Conteúdo do Prompt
          </label>
          <div className="text-xs text-gray-500">
            {content.length} / {prompt.maxLength} caracteres
            {hasChanges && <span className="text-orange-600 ml-2">• Não salvo</span>}
          </div>
        </div>
        
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[400px] font-mono text-sm resize-none"
            maxLength={prompt.maxLength}
            placeholder="Digite o prompt aqui... Use as variáveis disponíveis para personalizar o conteúdo."
          />
          
          {content.length > prompt.maxLength * 0.9 && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você está próximo do limite de caracteres ({content.length}/{prompt.maxLength})
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionHistory({ 
  versions, 
  onRestore 
}: { 
  versions: PromptVersion[];
  onRestore: (version: PromptVersion) => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <History className="w-5 h-5" />
        Histórico de Versões
      </h4>

      <div className="grid gap-3">
        {versions.map((version) => (
          <Card key={version.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(version.status)}>
                    v{version.version}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {version.createdBy}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedVersion(version)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {version.status !== 'active' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restaurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restaurar Versão</DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja restaurar a versão {version.version}? 
                            Esta ação criará uma nova versão com este conteúdo.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancelar</Button>
                          <Button onClick={() => onRestore(version)}>
                            Restaurar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {version.testResults && (
                <div className={`p-2 rounded text-xs ${
                  version.testResults.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center gap-1 mb-1">
                    {version.testResults.success ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    Último teste: {formatDate(version.testResults.testedAt)}
                  </div>
                  <div>{version.testResults.message}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Version Preview Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Visualizar Versão {selectedVersion?.version}
            </DialogTitle>
            <DialogDescription>
              Criada em {selectedVersion ? formatDate(selectedVersion.createdAt) : ''} por {selectedVersion?.createdBy}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
              {selectedVersion?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AmazonListingsOptimizerPrompts() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
  }, [isAdmin, navigate]);

  // Fetch prompts from API
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['agent-prompts', 'amazon-listings'],
    queryFn: async () => {
      const response = await fetch('/api/agent-prompts/amazon-listings');
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      return response.json();
    }
  });

  const savePromptMutation = useMutation({
    mutationFn: async ({ promptId, content }: { promptId: string; content: string }) => {
      const response = await fetch(`/api/agent-prompts/amazon-listings/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        description: "Prompt salvo com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['agent-prompts'] });
    },
    onError: () => {
      toast({
        description: "Erro ao salvar prompt",
        variant: "destructive"
      });
    }
  });

  const testPromptMutation = useMutation({
    mutationFn: async ({ promptId, content }: { promptId: string; content: string }) => {
      const response = await fetch(`/api/agent-prompts/amazon-listings/${promptId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to test prompt');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        description: result.message
      });
    },
    onError: () => {
      toast({
        description: "Erro ao testar prompt",
        variant: "destructive"
      });
    }
  });

  const handleSavePrompt = (promptId: string, content: string) => {
    savePromptMutation.mutate({ promptId, content });
  };

  const handleTestPrompt = (promptId: string, content: string) => {
    testPromptMutation.mutate({ promptId, content });
  };

  const handleRestoreVersion = (version: PromptVersion) => {
    toast({
      description: `Versão ${version.version} restaurada com sucesso!`
    });
    queryClient.invalidateQueries({ queryKey: ['agent-prompts'] });
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edição de Prompts - Amazon Listings
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure e teste os prompts do agente de otimização de listagens
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts Tabs */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Configuração de Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analysis">Análise</TabsTrigger>
                <TabsTrigger value="titles">Títulos</TabsTrigger>
                <TabsTrigger value="bulletPoints">Bullet Points</TabsTrigger>
                <TabsTrigger value="description">Descrição</TabsTrigger>
              </TabsList>

              {prompts.map((prompt: AgentPrompt) => (
                <TabsContent key={prompt.id} value={prompt.id} className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Editor Principal */}
                    <div className="lg:col-span-2">
                      <PromptEditor
                        prompt={prompt}
                        onSave={(content) => handleSavePrompt(prompt.id, content)}
                        onTest={(content) => handleTestPrompt(prompt.id, content)}
                        isSaving={savePromptMutation.isPending}
                        isTesting={testPromptMutation.isPending}
                      />
                    </div>

                    {/* Histórico de Versões */}
                    <div>
                      <VersionHistory
                        versions={[prompt.currentVersion, ...prompt.versions]}
                        onRestore={handleRestoreVersion}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}