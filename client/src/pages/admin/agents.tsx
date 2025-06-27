import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  DollarSign, 
  Users, 
  Activity,
  BarChart3
} from 'lucide-react';

// Types
interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface AgentUsage {
  totalGenerations: number;
  totalTokens: number;
  totalCost: number;
  lastUsed: Date;
}

interface AdminAgentConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  modelConfig: ModelConfig;
  usage: AgentUsage;
}

// Constants
const DEFAULT_MODEL = 'GPT-4o';
const COST_PER_1K_TOKENS = 0.01;

// Utility functions
const calculateEstimatedCost = (model: string, tokens: number): number => {
  return (tokens / 1000) * COST_PER_1K_TOKENS;
};

const formatCurrency = (value: number): string => 
  new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value);

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('pt-BR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  }).format(date);

// Components
const ModelConfigSection: React.FC<{
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
}> = ({ config, onChange }) => {
  const estimatedCost = calculateEstimatedCost(config.model, config.maxTokens);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Configuração do Modelo</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Modelo</label>
          <Input
            value={config.model}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            placeholder="GPT-4o"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Max Tokens</label>
          <Input
            type="number"
            value={config.maxTokens}
            onChange={(e) => onChange({ 
              ...config, 
              maxTokens: parseInt(e.target.value) || 1000 
            })}
            min={100}
            max={4000}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Temperatura: {config.temperature}
        </label>
        <Slider
          value={[config.temperature]}
          onValueChange={([value]) => onChange({ ...config, temperature: value })}
          min={0}
          max={2}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Top P</label>
          <Input
            type="number"
            value={config.topP || 1}
            onChange={(e) => onChange({ 
              ...config, 
              topP: parseFloat(e.target.value) || 1 
            })}
            min={0}
            max={1}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Frequency Penalty</label>
          <Input
            type="number"
            value={config.frequencyPenalty || 0}
            onChange={(e) => onChange({ 
              ...config, 
              frequencyPenalty: parseFloat(e.target.value) || 0 
            })}
            min={-2}
            max={2}
            step={0.1}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Custo estimado: {formatCurrency(estimatedCost)} por execução
          </span>
        </div>
      </div>
    </div>
  );
};



const AgentCard: React.FC<{
  agent: AdminAgentConfig;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (agent: AdminAgentConfig) => void;
  onDuplicate: (agent: AdminAgentConfig) => void;
  onDelete: (id: string) => void;
}> = ({ agent, onToggle, onEdit, onDuplicate, onDelete }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <p className="text-gray-600 text-sm mt-1">{agent.description}</p>
          <Badge variant="outline" className="mt-2">
            {agent.category}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={agent.isActive}
            onCheckedChange={(checked) => onToggle(agent.id, checked)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(agent)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(agent)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(agent.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Modelo:</span>
          <p className="font-medium">{agent.modelConfig.model}</p>
        </div>
        <div>
          <span className="text-gray-500">Temperatura:</span>
          <p className="font-medium">{agent.modelConfig.temperature}</p>
        </div>
        <div>
          <span className="text-gray-500">Uso Total:</span>
          <p className="font-medium">{agent.usage.totalGenerations} gerações</p>
        </div>
        <div>
          <span className="text-gray-500">Custo:</span>
          <p className="font-medium">{formatCurrency(agent.usage.totalCost)}</p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Último uso: {formatDate(agent.usage.lastUsed)}
      </div>
    </CardContent>
  </Card>
);

const AgentConfigDialog: React.FC<{
  agent: AdminAgentConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: AdminAgentConfig) => void;
}> = ({ agent, isOpen, onClose, onSave }) => {
  const [editingAgent, setEditingAgent] = useState<AdminAgentConfig | null>(null);

  React.useEffect(() => {
    setEditingAgent(agent ? { ...agent } : null);
  }, [agent]);

  const handleSave = () => {
    if (editingAgent) {
      onSave(editingAgent);
      onClose();
    }
  };

  if (!editingAgent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agent?.id ? 'Editar Agente' : 'Novo Agente'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={editingAgent.name}
                onChange={(e) => setEditingAgent({
                  ...editingAgent,
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input
                value={editingAgent.category}
                onChange={(e) => setEditingAgent({
                  ...editingAgent,
                  category: e.target.value
                })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={editingAgent.description}
              onChange={(e) => setEditingAgent({
                ...editingAgent,
                description: e.target.value
              })}
            />
          </div>

          <ModelConfigSection
            config={editingAgent.modelConfig}
            onChange={(config) => setEditingAgent({
              ...editingAgent,
              modelConfig: config
            })}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const AdminAgents: React.FC = () => {
  const [agents, setAgents] = useState<AdminAgentConfig[]>([
    {
      id: '1',
      name: 'Gerador de Listings Amazon',
      description: 'Cria títulos, bullet points e descrições otimizadas',
      category: 'E-commerce',
      isActive: true,
      modelConfig: {
        model: 'GPT-4o',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      usage: {
        totalGenerations: 245,
        totalTokens: 189000,
        totalCost: 5.67,
        lastUsed: new Date()
      }
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<AdminAgentConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createNewAgent = () => {
    const newAgent: AdminAgentConfig = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: '',
      isActive: false,
      modelConfig: {
        model: DEFAULT_MODEL,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      usage: {
        totalGenerations: 0,
        totalTokens: 0,
        totalCost: 0,
        lastUsed: new Date()
      }
    };
    
    setSelectedAgent(newAgent);
    setIsDialogOpen(true);
  };

  const editAgent = (agent: AdminAgentConfig) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  const duplicateAgent = (agent: AdminAgentConfig) => {
    const duplicated: AdminAgentConfig = {
      ...agent,
      id: Date.now().toString(),
      name: `${agent.name} (Cópia)`,
      usage: {
        totalGenerations: 0,
        totalTokens: 0,
        totalCost: 0,
        lastUsed: new Date()
      }
    };
    setAgents([...agents, duplicated]);
  };

  const deleteAgent = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
      setAgents(agents.filter(agent => agent.id !== id));
    }
  };

  const toggleAgent = (id: string, isActive: boolean) => {
    setAgents(agents.map(agent => 
      agent.id === id ? { ...agent, isActive } : agent
    ));
  };

  const saveAgent = (updatedAgent: AdminAgentConfig) => {
    const exists = agents.find(a => a.id === updatedAgent.id);
    
    if (exists) {
      setAgents(agents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      ));
    } else {
      setAgents([...agents, updatedAgent]);
    }
  };

  const totalCost = agents.reduce((sum, agent) => sum + agent.usage.totalCost, 0);
  const totalGenerations = agents.reduce((sum, agent) => sum + agent.usage.totalGenerations, 0);
  const activeAgents = agents.filter(agent => agent.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Agentes</h1>
          <p className="text-gray-600">Configure e monitore agentes de IA</p>
        </div>
        <Button onClick={createNewAgent}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Agentes Ativos</p>
                <p className="text-xl font-bold">{activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Gerações</p>
                <p className="text-xl font-bold">{totalGenerations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Agentes</p>
                <p className="text-xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agentes */}
      <div className="space-y-4">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onToggle={toggleAgent}
            onEdit={editAgent}
            onDuplicate={duplicateAgent}
            onDelete={deleteAgent}
          />
        ))}
      </div>

      {/* Dialog de Configuração */}
      <AgentConfigDialog
        agent={selectedAgent}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAgent(null);
        }}
        onSave={saveAgent}
      />
    </div>
  );
};

export default AdminAgents;