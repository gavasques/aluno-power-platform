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

  // Views dos managers individuais
  if (activeView === 'empresas') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <EmpresasManager />
      </div>
    );
  }

  if (activeView === 'canais') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <CanaisManager />
      </div>
    );
  }

  if (activeView === 'bancos') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <BancosManager />
      </div>
    );
  }

  if (activeView === 'contas-bancarias') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <ContasBancariasManager />
      </div>
    );
  }

  if (activeView === 'formas-pagamento') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <FormasPagamentoManager />
      </div>
    );
  }

  if (activeView === 'parceiros') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <ParceirosManager />
      </div>
    );
  }

  if (activeView === 'canais-pagamento') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <CanaisPagamentoManager />
      </div>
    );
  }

  if (activeView === 'estrutura-dre') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('cadastros-base')}
            className="mb-4"
          >
            ← Voltar aos Cadastros Base
          </Button>
        </div>
        <EstruturaDREManager />
      </div>
    );
  }

  if (activeView === 'lancamentos') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
        <LancamentosManager />
      </div>
    );
  }

  if (activeView === 'notas-fiscais') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
        <NotasFiscaisManager />
      </div>
    );
  }

  if (activeView === 'devolucoes') {
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
        <DevolucaesManager />
      </div>
    );
  }

  // View da página de Cadastros Base
  if (activeView === 'cadastros-base') {
    const cadastrosCards = [
      {
        title: 'Empresas',
        description: 'Gerenciar dados das empresas do grupo',
        icon: Building2,
        action: () => setActiveView('empresas'),
        color: 'bg-blue-50 text-blue-600',
        badge: 'Básico'
      },
      {
        title: 'Canais',
        description: 'Configurar canais de vendas e operações',
        icon: Hash,
        action: () => setActiveView('canais'),
        color: 'bg-purple-50 text-purple-600',  
        badge: 'Básico'
      },
      {
        title: 'Bancos',
        description: 'Cadastro de instituições bancárias',
        icon: Landmark,
        action: () => setActiveView('bancos'),
        color: 'bg-green-50 text-green-600',
        badge: 'Básico'
      },
      {
        title: 'Contas Bancárias',
        description: 'Gerenciar contas e saldos bancários',
        icon: CreditCard,
        action: () => setActiveView('contas-bancarias'),
        color: 'bg-indigo-50 text-indigo-600',
        badge: 'Essencial'
      },
      {
        title: 'Formas de Pagamento',
        description: 'Configurar métodos de pagamento',
        icon: Receipt,
        action: () => setActiveView('formas-pagamento'),
        color: 'bg-orange-50 text-orange-600',
        badge: 'Essencial'
      },
      {
        title: 'Parceiros',
        description: 'Cadastro de clientes e fornecedores',
        icon: Users,
        action: () => setActiveView('parceiros'),
        color: 'bg-cyan-50 text-cyan-600',
        badge: 'Essencial'
      },
      {
        title: 'Canais de Pagamento',
        description: 'Gateways e processadores de pagamento',
        icon: ArrowLeftRight,
        action: () => setActiveView('canais-pagamento'),
        color: 'bg-pink-50 text-pink-600',
        badge: 'Avançado'
      },
      {
        title: 'Estrutura DRE',
        description: 'Configurar estrutura de relatórios',
        icon: BarChart3,
        action: () => setActiveView('estrutura-dre'),
        color: 'bg-teal-50 text-teal-600',
        badge: 'Avançado'
      }
    ];

    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-full">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Cadastros Base</h1>
              <p className="text-muted-foreground text-lg">8 Módulos</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
          >
            ← Voltar ao Dashboard
          </Button>
        </div>

        {/* Cadastros Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cadastrosCards.map((card, index) => {
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
  }

  // Dashboard principal - simplificado
  const mainCards = [
    {
      title: 'Cadastros Base',
      description: 'Configurar empresas, canais, bancos e estruturas base do sistema',
      icon: Settings,
      action: () => setActiveView('cadastros-base'),
      color: 'bg-blue-50 text-blue-600',
      badge: '8 Módulos'
    }
  ];

  const operacoesCards = [
    {
      title: 'Lançamentos',
      description: 'Controle de receitas e despesas',
      icon: FileText,
      action: () => setActiveView('lancamentos'),
      color: 'bg-emerald-50 text-emerald-600',
      badge: 'Principal'
    },
    {
      title: 'Notas Fiscais',
      description: 'Gestão de documentos fiscais',
      icon: FileCheck,
      action: () => setActiveView('notas-fiscais'),
      color: 'bg-amber-50 text-amber-600',
      badge: 'Fiscal'
    },
    {
      title: 'Devoluções',
      description: 'Controle de devoluções e estornos',
      icon: RefreshCw,
      action: () => setActiveView('devolucoes'),
      color: 'bg-red-50 text-red-600',
      badge: 'Especial'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-50 p-3 rounded-full">
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Finanças360</h1>
        </div>
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