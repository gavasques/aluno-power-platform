// Unified Provider Settings Page - Central management for all provider configurations

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Settings, 
  Brain,
  TestTube,
  FileText,
  Layers,
  Database,
  Plus,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnifiedProviderManager } from "@/components/providers/UnifiedProviderManager";
import { KnowledgeBaseManager } from "../agents/KnowledgeBaseManager";
import { ProviderConfiguration, ProviderWorkflow } from "@/components/providers/types";

export default function UnifiedProviderSettings() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedConfig, setSelectedConfig] = useState<ProviderConfiguration | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProviderWorkflow | null>(null);
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);

  // Fetch saved configurations
  const { data: configurations = [] } = useQuery<ProviderConfiguration[]>({
    queryKey: ['/api/provider-configurations'],
    enabled: user?.role === 'admin'
  });

  // Fetch saved workflows
  const { data: workflows = [] } = useQuery<ProviderWorkflow[]>({
    queryKey: ['/api/agent-workflows'],
    enabled: user?.role === 'admin'
  });

  // Fetch provider status for overview
  const { data: providerStatus = {} } = useQuery({
    queryKey: ['/api/ai-providers/status'],
    enabled: user?.role === 'admin'
  });

  const configuredProviders = Object.entries(providerStatus).filter(([_, status]) => status).length;
  const totalProviders = Object.keys(providerStatus).length;

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Acesso Negado</h1>
        <p className="text-muted-foreground">Você precisa ser administrador para acessar esta página.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Configurações de Provedores</h1>
          </div>
          <p className="text-muted-foreground">
            Gerenciamento unificado de provedores de IA, configurações e testes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {configuredProviders}/{totalProviders} Provedores Ativos
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold">{configurations.length}</p>
                <p className="text-xs text-muted-foreground">Configurações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-semibold">{workflows.length}</p>
                <p className="text-xs text-muted-foreground">Fluxos Multi-Etapas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-semibold">{configuredProviders}</p>
                <p className="text-xs text-muted-foreground">Provedores Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold">-</p>
                <p className="text-xs text-muted-foreground">Base Conhecimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="configurations">Configurações</TabsTrigger>
          <TabsTrigger value="workflows">Fluxos Multi-Etapas</TabsTrigger>
          <TabsTrigger value="knowledge-base">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="testing">Central de Testes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provider Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Status dos Provedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(providerStatus).map(([provider, status]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="capitalize">{provider}</span>
                    <Badge className={status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {status ? 'Configurado' : 'Não Configurado'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isCreateConfigOpen} onOpenChange={setIsCreateConfigOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Configuração Simples
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Configuração de Provider</DialogTitle>
                    </DialogHeader>
                    <UnifiedProviderManager
                      mode="single-step"
                      showTesting={true}
                      showPromptConfiguration={true}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Layers className="w-4 h-4 mr-2" />
                      Novo Fluxo Multi-Etapas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Novo Fluxo Multi-Etapas</DialogTitle>
                    </DialogHeader>
                    <UnifiedProviderManager
                      mode="multi-step"
                      showTesting={true}
                      showPromptConfiguration={true}
                    />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start">
                  <TestTube className="w-4 h-4 mr-2" />
                  Central de Testes
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Gerenciar Base de Conhecimento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Configurações Salvas</h2>
            <Dialog open={isCreateConfigOpen} onOpenChange={setIsCreateConfigOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Configuração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Configuração</DialogTitle>
                </DialogHeader>
                <UnifiedProviderManager
                  mode="single-step"
                  showTesting={true}
                  showPromptConfiguration={true}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configurations.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <Badge variant="outline">
                      {config.provider}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Modelo:</span>
                      <span className="font-medium">{config.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperatura:</span>
                      <span className="font-medium">{config.temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Tokens:</span>
                      <span className="font-medium">{config.maxTokens}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedConfig(config)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fluxos Multi-Etapas</h2>
            <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fluxo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Fluxo Multi-Etapas</DialogTitle>
                </DialogHeader>
                <UnifiedProviderManager
                  mode="multi-step"
                  showTesting={true}
                  showPromptConfiguration={true}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      {workflow.steps.length} Etapas
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="flex-1">{step.stepName}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.configuration.provider}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <TestTube className="w-3 h-3 mr-1" />
                      Testar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-6">
          <KnowledgeBaseManager />
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Central de Testes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedProviderManager
                mode="full-configuration"
                showTesting={true}
                showPromptConfiguration={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Configuration Dialog */}
      {selectedConfig && (
        <Dialog open={!!selectedConfig} onOpenChange={() => setSelectedConfig(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Configuração: {selectedConfig.name}</DialogTitle>
            </DialogHeader>
            <UnifiedProviderManager
              mode="single-step"
              showTesting={true}
              showPromptConfiguration={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Workflow Dialog */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Fluxo: {selectedWorkflow.name}</DialogTitle>
            </DialogHeader>
            <UnifiedProviderManager
              mode="multi-step"
              workflow={selectedWorkflow}
              showTesting={true}
              showPromptConfiguration={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}