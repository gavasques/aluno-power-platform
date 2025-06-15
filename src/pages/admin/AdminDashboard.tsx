
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, TrendingUp, MessageSquare, FileText, Settings, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: "Usuários Ativos", value: "1,247", change: "+12%", icon: Users, color: "text-blue-400" },
    { title: "Novos Usuários (30d)", value: "156", change: "+8%", icon: TrendingUp, color: "text-green-400" },
    { title: "Créditos IA Usados", value: "45,231", change: "-3%", icon: CreditCard, color: "text-orange-400" },
    { title: "Tickets Suporte", value: "23", change: "+5%", icon: MessageSquare, color: "text-red-400" },
    { title: "Conteúdos Publicados", value: "1,834", change: "+15%", icon: FileText, color: "text-purple-400" },
    { title: "Taxa de Engajamento", value: "78%", change: "+2%", icon: Activity, color: "text-emerald-400" }
  ];

  const quickActions = [
    { title: "Gerenciar Usuários", description: "Controle de grupos e permissões", action: () => navigate("/admin/usuarios"), icon: Users },
    { title: "Cadastros", description: "Categorias, prompts, templates", action: () => navigate("/admin/cadastros"), icon: Database },
    { title: "Gestão de Conteúdo", description: "Hub de recursos e selos", action: () => navigate("/admin/conteudo"), icon: FileText },
    { title: "Suporte", description: "Tickets e atendimento", action: () => navigate("/admin/suporte"), icon: MessageSquare },
    { title: "Configurações", description: "Configurações gerais", action: () => navigate("/admin/configuracoes"), icon: Settings }
  ];

  const recentActivity = [
    { user: "João Silva", action: "Criou novo produto", time: "2 min atrás", type: "create" },
    { user: "Maria Santos", action: "Abriu ticket de suporte", time: "5 min atrás", type: "support" },
    { user: "Pedro Costa", action: "Usou 50 créditos IA", time: "10 min atrás", type: "credits" },
    { user: "Ana Lima", action: "Completou curso", time: "15 min atrás", type: "course" },
    { user: "Carlos Souza", action: "Fez login na plataforma", time: "20 min atrás", type: "login" }
  ];

  const getActivityBadge = (type: string) => {
    const badges = {
      create: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Criação</Badge>,
      support: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suporte</Badge>,
      credits: <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Créditos</Badge>,
      course: <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Curso</Badge>,
      login: <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Login</Badge>
    };
    return badges[type as keyof typeof badges];
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Painel Administrativo</h1>
          <p className="text-slate-400">Visão geral da plataforma e métricas principais</p>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-lg px-4 py-2">
          Administrador
        </Badge>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{metric.title}</CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{metric.value}</div>
              <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ações Rápidas */}
        <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
          <CardHeader>
            <CardTitle className="text-slate-100">Ações Rápidas</CardTitle>
            <p className="text-sm text-slate-400">Acesso rápido às principais funcionalidades</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <action.icon className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="font-medium text-slate-100">{action.title}</h4>
                    <p className="text-sm text-slate-400">{action.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={action.action}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30"
                  variant="outline"
                >
                  Acessar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
          <CardHeader>
            <CardTitle className="text-slate-100">Atividade Recente</CardTitle>
            <p className="text-sm text-slate-400">Últimas ações dos usuários na plataforma</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/30 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium text-slate-100">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  {getActivityBadge(activity.type)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
