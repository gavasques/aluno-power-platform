import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Globe,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WebhookConfig {
  id: number;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secretKey: string;
  retryAttempts: number;
  timeout: number;
  lastTriggered?: Date;
  successRate: number;
  totalCalls: number;
  failedCalls: number;
}

const WEBHOOK_EVENTS = [
  { value: 'news.created', label: 'Notícia Criada' },
  { value: 'news.updated', label: 'Notícia Atualizada' },
  { value: 'news.published', label: 'Notícia Publicada' },
  { value: 'news.deleted', label: 'Notícia Deletada' },
  { value: 'update.created', label: 'Atualização Criada' },
  { value: 'update.updated', label: 'Atualização Atualizada' },
  { value: 'update.published', label: 'Atualização Publicada' },
  { value: 'update.deleted', label: 'Atualização Deletada' },
  { value: 'user.created', label: 'Usuário Criado' },
  { value: 'user.updated', label: 'Usuário Atualizado' },
  { value: 'system.backup', label: 'Backup do Sistema' },
  { value: 'security.alert', label: 'Alerta de Segurança' }
];

export const WebhookManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    isActive: true,
    retryAttempts: 3,
    timeout: 10
  });

  // Fetch webhooks from database
  const { data: webhooks = [], isLoading } = useQuery<WebhookConfig[]>({
    queryKey: ['/api/webhook-configs'],
    staleTime: 30 * 1000,
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: (webhookData: typeof newWebhook) =>
      apiRequest('/api/webhook-configs', { method: 'POST', body: webhookData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-configs'] });
      setShowCreateForm(false);
      setNewWebhook({
        name: "",
        url: "",
        events: [],
        isActive: true,
        retryAttempts: 3,
        timeout: 10
      });
      toast({ title: "Webhook criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar webhook", variant: "destructive" });
    }
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<WebhookConfig>) =>
      apiRequest(`/api/webhook-configs/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-configs'] });
      toast({ title: "Webhook atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar webhook", variant: "destructive" });
    }
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhook-configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-configs'] });
      toast({ title: "Webhook removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover webhook", variant: "destructive" });
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhook-configs/${id}/test`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Webhook testado com sucesso!" });
      setTestingWebhook(null);
    },
    onError: () => {
      toast({ title: "Falha no teste do webhook", variant: "destructive" });
      setTestingWebhook(null);
    }
  });

  const handleEventToggle = (event: string, checked: boolean) => {
    setNewWebhook(prev => ({
      ...prev,
      events: checked
        ? [...prev.events, event]
        : prev.events.filter(e => e !== event)
    }));
  };

  const getStatusBadge = (webhook: WebhookConfig) => {
    if (!webhook.isActive) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    
    if (webhook.successRate >= 95) {
      return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    } else if (webhook.successRate >= 80) {
      return <Badge className="bg-yellow-100 text-yellow-800">Bom</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
    }
  };

  const getStatusIcon = (webhook: WebhookConfig) => {
    if (!webhook.isActive) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    
    if (webhook.successRate >= 95) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (webhook.successRate >= 80) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Webhooks</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Webhook
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{webhooks.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {webhooks.filter(w => w.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {webhooks.reduce((sum, w) => sum + w.totalCalls, 0)}
            </div>
            <div className="text-sm text-gray-600">Chamadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {webhooks.reduce((sum, w) => sum + w.failedCalls, 0)}
            </div>
            <div className="text-sm text-gray-600">Falhas</div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Webhook Form */}
      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Criar Novo Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="webhook-name">Nome</Label>
                <Input
                  id="webhook-name"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do webhook"
                />
              </div>
              <div>
                <Label htmlFor="webhook-url">URL do Endpoint</Label>
                <Input
                  id="webhook-url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://exemplo.com/webhook"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                <Input
                  id="retry-attempts"
                  type="number"
                  min="0"
                  max="10"
                  value={newWebhook.retryAttempts}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (segundos)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="60"
                  value={newWebhook.timeout}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Eventos para Monitorar</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <Switch
                      id={`new-${event.value}`}
                      checked={newWebhook.events.includes(event.value)}
                      onCheckedChange={(checked) => handleEventToggle(event.value, checked)}
                    />
                    <Label htmlFor={`new-${event.value}`} className="text-sm cursor-pointer">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => createWebhookMutation.mutate(newWebhook)}
                disabled={!newWebhook.name || !newWebhook.url || createWebhookMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createWebhookMutation.isPending ? "Criando..." : "Criar Webhook"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook List */}
      <div className="grid gap-6">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(webhook)}
                    <Globe className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                  </div>
                  {getStatusBadge(webhook)}
                  <Badge variant="outline" className="text-xs">
                    {webhook.events.length} evento{webhook.events.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestingWebhook(webhook.id);
                      testWebhookMutation.mutate(webhook.id);
                    }}
                    disabled={testingWebhook === webhook.id}
                  >
                    <Send className="h-4 w-4" />
                    {testingWebhook === webhook.id ? "Testando..." : "Testar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateWebhookMutation.mutate({ 
                      id: webhook.id, 
                      isActive: !webhook.isActive 
                    })}
                  >
                    {webhook.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">URL do Endpoint</Label>
                  <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    {webhook.url}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Taxa de Sucesso</Label>
                    <div className="text-sm text-gray-600">{webhook.successRate}%</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Total de Chamadas</Label>
                    <div className="text-sm text-gray-600">{webhook.totalCalls}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Chamadas Falhadas</Label>
                    <div className="text-sm text-gray-600">{webhook.failedCalls}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Último Trigger</Label>
                    <div className="text-sm text-gray-600">
                      {webhook.lastTriggered 
                        ? new Date(webhook.lastTriggered).toLocaleString('pt-BR')
                        : 'Nunca'
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Eventos Monitorados</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {webhook.events.map((event) => {
                      const eventConfig = WEBHOOK_EVENTS.find(e => e.value === event);
                      return (
                        <Badge key={event} variant="outline" className="text-xs">
                          {eventConfig?.label || event}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-12">
          <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum webhook configurado</h3>
          <p className="text-gray-500 mb-4">Configure webhooks para receber notificações em tempo real</p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Webhook
          </Button>
        </div>
      )}
    </div>
  );
};