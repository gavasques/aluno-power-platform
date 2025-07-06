import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  DollarSign,
  BarChart3,
  PieChart,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Award,
  Target,
  Zap,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Interfaces
interface UsageTransaction {
  id: string;
  timestamp: Date;
  featureName: string;
  category: string;
  creditsUsed: number;
  description: string;
  status: 'success' | 'failed' | 'partial';
  metadata: {
    projectId?: string;
    duration?: number;
    fileSize?: number;
    quality?: number;
    model?: string;
    provider?: string;
  };
}

interface UsageAnalytics {
  totalCredits: number;
  averageDaily: number;
  topFeatures: Array<{name: string, usage: number, percentage: number}>;
  patterns: {
    peakHours: number[];
    activeDays: string[];
    efficiency: number;
  };
  insights: string[];
  recommendations: string[];
  dailyUsage: Array<{date: string, usage: number}>;
  categoryBreakdown: Array<{category: string, usage: number, percentage: number}>;
}

interface UsageSummary {
  period: string;
  totalCreditsUsed: number;
  averageDaily: number;
  currentBalance: number;
  totalTransactions: number;
  topFeatures: Array<{name: string, usage: number, percentage: number}>;
  comparisonWithPrevious: {
    creditsChange: number;
    percentChange: number;
  };
}

// Period Selector Component
const PeriodSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-40">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7d">Últimos 7 dias</SelectItem>
      <SelectItem value="30d">Últimos 30 dias</SelectItem>
      <SelectItem value="90d">Últimos 90 dias</SelectItem>
      <SelectItem value="1y">Último ano</SelectItem>
    </SelectContent>
  </Select>
);

// Usage Summary Component
const UsageSummary = ({ summary, loading }: { summary: UsageSummary | null; loading: boolean }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: 'Créditos Gastos',
      value: summary.totalCreditsUsed.toLocaleString(),
      description: `${summary.averageDaily.toFixed(1)} por dia em média`,
      icon: DollarSign,
      trend: summary.comparisonWithPrevious.percentChange,
      color: 'text-blue-600'
    },
    {
      title: 'Saldo Atual',
      value: summary.currentBalance.toLocaleString(),
      description: 'Créditos disponíveis',
      icon: Zap,
      color: 'text-green-600'
    },
    {
      title: 'Transações',
      value: summary.totalTransactions.toString(),
      description: `No período de ${summary.period}`,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Funcionalidade Top',
      value: summary.topFeatures[0]?.name || 'N/A',
      description: `${summary.topFeatures[0]?.percentage.toFixed(1) || 0}% do uso`,
      icon: Award,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
                {card.trend !== undefined && (
                  <div className="flex items-center mt-2">
                    {card.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${card.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(card.trend).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Usage Charts Component
const UsageCharts = ({ analytics }: { analytics: UsageAnalytics | null }) => {
  if (!analytics) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Daily Usage Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Uso Diário de Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: number) => [value, 'Créditos']}
              />
              <Area type="monotone" dataKey="usage" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Uso por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="usage"
                data={analytics.categoryBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
              >
                {analytics.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Créditos']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Transaction List Component
const TransactionList = ({ 
  transactions, 
  loading, 
  onFiltersChange,
  filters 
}: { 
  transactions: UsageTransaction[]; 
  loading: boolean;
  onFiltersChange: (filters: any) => void;
  filters: any;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'success' ? 'Sucesso' : status === 'failed' ? 'Falha' : 'Parcial'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-48 mb-2" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Transações</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">Tente ajustar os filtros ou período</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{transaction.featureName}</h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{new Date(transaction.timestamp).toLocaleString('pt-BR')}</span>
                      <span>{transaction.category}</span>
                      {transaction.metadata.duration && (
                        <span>{(transaction.metadata.duration / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">{transaction.creditsUsed}</p>
                  <p className="text-sm text-muted-foreground">créditos</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Insights Panel Component
const InsightsPanel = ({ insights, recommendations, alerts }: { 
  insights: string[]; 
  recommendations: string[];
  alerts: string[];
}) => (
  <div className="space-y-6">
    {/* Insights */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum insight disponível</p>
        ) : (
          insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-sm">{insight}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>

    {/* Recommendations */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Recomendações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma recomendação disponível</p>
        ) : (
          recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm">{recommendation}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>

    {/* Alerts */}
    {alerts.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <p className="text-sm">{alert}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </div>
);

// Export Modal Component
const ExportModal = ({ onExport }: { onExport: (format: string, options: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState('csv');
  const [includeMetadata, setIncludeMetadata] = useState(false);

  const handleExport = () => {
    onExport(format, { includeMetadata });
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Formato</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="metadata"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
                <label htmlFor="metadata" className="text-sm">Incluir metadados técnicos</label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleExport} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Main Usage Page Component
const UserUsage = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState('30d');
  const [filters, setFilters] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');

  // Data fetching
  const { data: summary, isLoading: summaryLoading } = useQuery<UsageSummary>({
    queryKey: ['/api/user/usage/summary', period],
    enabled: true
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<{
    transactions: UsageTransaction[];
    pagination: any;
  }>({
    queryKey: ['/api/user/usage/transactions', period, filters],
    enabled: true
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<UsageAnalytics>({
    queryKey: ['/api/user/usage/analytics', period],
    enabled: true
  });

  const { data: insights } = useQuery<{
    insights: string[];
    recommendations: string[];
    alerts: string[];
    metrics: any;
  }>({
    queryKey: ['/api/user/usage/insights'],
    enabled: true
  });

  const handleExport = async (format: string, options: any) => {
    try {
      const response = await fetch('/api/user/usage/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ period, format, ...options }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Exportação iniciada',
          description: `Arquivo ${data.filename} será baixado em breve.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Uso</h1>
          <p className="text-muted-foreground">Acompanhe seu consumo de créditos e padrões de uso</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ExportModal onExport={handleExport} />
        </div>
      </div>

      {/* Summary Cards */}
      <UsageSummary summary={summary || null} loading={summaryLoading} />

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UsageCharts analytics={analytics || null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionList
                transactions={transactionsData?.transactions || []}
                loading={transactionsLoading}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
            <div>
              <InsightsPanel
                insights={insights?.insights || []}
                recommendations={insights?.recommendations || []}
                alerts={insights?.alerts || []}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UsageCharts analytics={analytics || null} />
          
          {/* Patterns and Efficiency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Padrões Temporais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Horários de Pico</p>
                    <p className="text-lg font-semibold">
                      {analytics?.patterns.peakHours.map(h => `${h}h`).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dias Mais Ativos</p>
                    <p className="text-lg font-semibold">
                      {analytics?.patterns.activeDays.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Eficiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Taxa de Sucesso</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics?.patterns.efficiency || 0} className="flex-1" />
                      <span className="text-sm font-semibold">{analytics?.patterns.efficiency || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Média Diária</p>
                    <p className="text-lg font-semibold">{analytics?.averageDaily || 0} créditos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center">
                    🎯 Usuário Ativo
                  </Badge>
                  <Badge variant="secondary" className="w-full justify-center">
                    🚀 Explorador
                  </Badge>
                  <Badge variant="secondary" className="w-full justify-center">
                    💎 Eficiente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionList
            transactions={transactionsData?.transactions || []}
            loading={transactionsLoading}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel
            insights={insights?.insights || []}
            recommendations={insights?.recommendations || []}
            alerts={insights?.alerts || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserUsage;