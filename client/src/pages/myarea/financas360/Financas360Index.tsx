import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Settings, 
  FileText,
  Building2,
  Hash,
  Landmark,
  CreditCard,
  Receipt,
  Users,
  ArrowLeftRight,
  BarChart3,
  FileCheck,
  RefreshCw
} from 'lucide-react';

// Import dos managers
import EmpresasManager from '@/components/financas360/EmpresasManager';
import CanaisManager from '@/components/financas360/CanaisManager';
import BancosManager from '@/components/financas360/BancosManager';
import ContasBancariasManager from '@/components/financas360/ContasBancariasManager';
import FormasPagamentoManager from '@/components/financas360/FormasPagamentoManager';
import ParceirosManager from '@/components/financas360/ParceirosManager';
import CanaisPagamentoManager from '@/components/financas360/CanaisPagamentoManager';
import EstruturaDREManager from '@/components/financas360/EstruturaDREManager';
import LancamentosManager from '@/components/financas360/LancamentosManager';
import NotasFiscaisManager from '@/components/financas360/NotasFiscaisManager';
import DevolucaesManager from '@/components/financas360/DevolucaesManager';

type ActiveView = 
  | 'dashboard' 
  | 'cadastros-base'
  | 'empresas'
  | 'canais'
  | 'bancos'
  | 'contas-bancarias'
  | 'formas-pagamento'
  | 'parceiros'
  | 'canais-pagamento'
  | 'estrutura-dre'
  | 'lancamentos'
  | 'notas-fiscais'
  | 'devolucoes';

export default function Financas360Index() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [previousView, setPreviousView] = useState<ActiveView>('dashboard');

  const navigateTo = (view: ActiveView) => {
    setPreviousView(activeView);
    setActiveView(view);
  };

  const goBack = () => {
    setActiveView(previousView);
  };

  // Cards dos cadastros base
  const mainCards = [
    {
      title: 'Empresas',
      description: 'Cadastro das empresas do grupo com dados fiscais completos',
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
      badge: 'Base',
      action: () => navigateTo('empresas')
    },
    {
      title: 'Canais',
      description: 'Canais de vendas, compras e prestação de serviços',
      icon: Hash,
      color: 'bg-emerald-50 text-emerald-600',
      badge: 'Base',
      action: () => navigateTo('canais')
    },
    {
      title: 'Bancos',
      description: 'Cadastro de instituições bancárias e financeiras',
      icon: Landmark,
      color: 'bg-purple-50 text-purple-600',
      badge: 'Base',
      action: () => navigateTo('bancos')
    },
    {
      title: 'Contas Bancárias',
      description: 'Contas correntes, poupança e investimentos',
      icon: CreditCard,
      color: 'bg-orange-50 text-orange-600',
      badge: 'Base',
      action: () => navigateTo('contas-bancarias')
    },
    {
      title: 'Formas de Pagamento',
      description: 'Métodos de pagamento e recebimento',
      icon: Receipt,
      color: 'bg-red-50 text-red-600',
      badge: 'Base',
      action: () => navigateTo('formas-pagamento')
    },
    {
      title: 'Parceiros',
      description: 'Clientes, fornecedores e prestadores de serviços',
      icon: Users,
      color: 'bg-cyan-50 text-cyan-600',
      badge: 'Base',
      action: () => navigateTo('parceiros')
    },
    {
      title: 'Canais de Pagamento',
      description: 'Integração com gateways e processadores',
      icon: ArrowLeftRight,
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Base',
      action: () => navigateTo('canais-pagamento')
    },
    {
      title: 'Estrutura DRE',
      description: 'Estrutura contábil do Demonstrativo de Resultados',
      icon: BarChart3,
      color: 'bg-teal-50 text-teal-600',
      badge: 'Base',
      action: () => navigateTo('estrutura-dre')
    }
  ];

  // Cards das operações
  const operacoesCards = [
    {
      title: 'Lançamentos',
      description: 'Lançamentos financeiros de receitas e despesas',
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      badge: 'Operação',
      action: () => navigateTo('lancamentos')
    },
    {
      title: 'Notas Fiscais',
      description: 'Controle de documentos fiscais de entrada e saída',
      icon: FileCheck,
      color: 'bg-amber-50 text-amber-600',
      badge: 'Operação',
      action: () => navigateTo('notas-fiscais')
    },
    {
      title: 'Devoluções',
      description: 'Gestão de devoluções de clientes e fornecedores',
      icon: RefreshCw,
      color: 'bg-rose-50 text-rose-600',
      badge: 'Operação',
      action: () => navigateTo('devolucoes')
    }
  ];

  // Render component content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'empresas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
                <p className="text-muted-foreground mt-2">Gestão das empresas do grupo</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <EmpresasManager />
          </div>
        );

      case 'canais':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Canais</h1>
                <p className="text-muted-foreground mt-2">Canais de vendas, compras e serviços</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <CanaisManager />
          </div>
        );

      case 'bancos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Bancos</h1>
                <p className="text-muted-foreground mt-2">Instituições bancárias e financeiras</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <BancosManager />
          </div>
        );

      case 'contas-bancarias':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Contas Bancárias</h1>
                <p className="text-muted-foreground mt-2">Contas correntes, poupança e investimentos</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <ContasBancariasManager />
          </div>
        );

      case 'formas-pagamento':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Formas de Pagamento</h1>
                <p className="text-muted-foreground mt-2">Métodos de pagamento e recebimento</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <FormasPagamentoManager />
          </div>
        );

      case 'parceiros':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Parceiros</h1>
                <p className="text-muted-foreground mt-2">Clientes, fornecedores e prestadores</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <ParceirosManager />
          </div>
        );

      case 'canais-pagamento':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Canais de Pagamento</h1>
                <p className="text-muted-foreground mt-2">Gateways e processadores de pagamento</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <CanaisPagamentoManager />
          </div>
        );

      case 'estrutura-dre':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Estrutura DRE</h1>
                <p className="text-muted-foreground mt-2">Estrutura do Demonstrativo de Resultados</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar aos Cadastros Base
              </Button>
            </div>
            <EstruturaDREManager />
          </div>
        );

      case 'lancamentos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Lançamentos</h1>
                <p className="text-muted-foreground mt-2">Lançamentos de receitas e despesas</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar ao Dashboard
              </Button>
            </div>
            <LancamentosManager />
          </div>
        );

      case 'notas-fiscais':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
                <p className="text-muted-foreground mt-2">Documentos fiscais de entrada e saída</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar ao Dashboard
              </Button>
            </div>
            <NotasFiscaisManager />
          </div>
        );

      case 'devolucoes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Devoluções</h1>
                <p className="text-muted-foreground mt-2">Devoluções de clientes e fornecedores</p>
              </div>
              <Button variant="outline" onClick={goBack}>
                ← Voltar ao Dashboard
              </Button>
            </div>
            <DevolucaesManager />
          </div>
        );

      case 'cadastros-base':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Cadastros Base</h1>
                <p className="text-muted-foreground mt-2">Configurações fundamentais do sistema financeiro</p>
              </div>
              <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                ← Voltar ao Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card 
                    key={index} 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
                    onClick={card.action}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${card.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {card.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {card.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      default: // dashboard
        return (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Calculator className="h-4 w-4" />
                Finanças360
              </div>
              <h1 className="text-4xl font-bold text-foreground">Sistema Financeiro Empresarial</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Sistema completo de gestão financeira empresarial com controle de receitas, despesas, 
                documentos fiscais e relatórios gerenciais integrados.
              </p>
            </div>

            {/* Cadastros Base Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-foreground">Configurações Base</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainCards.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <Card 
                      key={index} 
                      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
                      onClick={card.action}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-xl ${card.color}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {card.badge}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Operações Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-foreground">Operações Financeiras</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operacoesCards.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <Card 
                      key={index} 
                      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
                      onClick={card.action}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-xl ${card.color}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {card.badge}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderContent()}
    </div>
  );
}