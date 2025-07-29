import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Palette, 
  Landmark, 
  CreditCard, 
  Receipt, 
  Users, 
  ArrowLeftRight, 
  BarChart3,
  FileText,
  FileCheck,
  RefreshCw,
  Calculator,
  TrendingUp,
  Settings,
  Hash
} from 'lucide-react';

// Import dos managers
import EmpresasManager from '@/components/financas360/EmpresasManager';
import CanaisManager from '@/components/financas360/CanaisManager';
import BancosManager from '@/components/financas360/BancosManager';
import LancamentosManager from '@/components/financas360/LancamentosManager';

const Financas360Index = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Se uma view específica está ativa, renderiza o componente correspondente
  if (activeView === 'empresas') {
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
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Voltar ao Dashboard
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
            onClick={() => setActiveView('dashboard')}
            className="mb-4"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
        <BancosManager />
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
      path: '/minha-area/financas360/cadastros/contas-bancarias',
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Essencial'
    },
    {
      title: 'Formas de Pagamento',
      description: 'Configurar métodos de pagamento',
      icon: Receipt,
      path: '/minha-area/financas360/cadastros/formas-pagamento',
      color: 'bg-orange-50 text-orange-600',
      badge: 'Essencial'
    },
    {
      title: 'Parceiros',
      description: 'Cadastro de clientes e fornecedores',
      icon: Users,
      path: '/minha-area/financas360/cadastros/parceiros',
      color: 'bg-cyan-50 text-cyan-600',
      badge: 'Essencial'
    },
    {
      title: 'Canais de Pagamento',
      description: 'Gateways e processadores de pagamento',
      icon: ArrowLeftRight,
      path: '/minha-area/financas360/cadastros/canais-pagamento',
      color: 'bg-pink-50 text-pink-600',
      badge: 'Avançado'
    },
    {
      title: 'Estrutura DRE',
      description: 'Configurar estrutura de relatórios',
      icon: BarChart3,
      path: '/minha-area/financas360/cadastros/estrutura-dre',
      color: 'bg-teal-50 text-teal-600',
      badge: 'Avançado'
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
      path: '/minha-area/financas360/operacoes/notas-fiscais',
      color: 'bg-amber-50 text-amber-600',
      badge: 'Fiscal'
    },
    {
      title: 'Devoluções',
      description: 'Controle de devoluções e estornos',
      icon: RefreshCw,
      path: '/minha-area/financas360/operacoes/devolucoes',
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

      {/* Status Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Em Desenvolvimento
            </Badge>
            <span className="text-sm text-orange-800">
              Módulo em desenvolvimento ativo - Implementação progressiva por fases
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              8 Cadastros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Módulos de configuração base para organizar sua estrutura financeira
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              3 Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Operações principais para controle do dia a dia financeiro
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              Análises gerenciais e relatórios fiscais automatizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cadastros */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-foreground">Cadastros Base</h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">8 Módulos</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cadastrosCards.map((card) => (
            <div key={card.title}>
              {card.action ? (
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  onClick={card.action}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Link href={card.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${card.color}`}>
                          <card.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {card.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Operações */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-foreground">Operações Financeiras</h2>
          <Badge variant="outline" className="bg-green-100 text-green-800">3 Módulos</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {operacoesCards.map((card) => (
            <div key={card.title}>
              {card.action ? (
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  onClick={card.action}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {card.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Acessar Módulo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Link href={card.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${card.color}`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {card.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {card.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Acessar Módulo
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Plano de Implementação */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Plano de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-800">1</span>
              </div>
              <div>
                <div className="font-semibold text-green-800">Fase 1 - Estrutura Base ✅</div>
                <div className="text-sm text-green-700">Interface, rotas e componentes placeholder</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-800">2</span>
              </div>
              <div>
                <div className="font-semibold text-blue-800">Fase 2 - Database Schema</div>
                <div className="text-sm text-blue-700">Criação das tabelas e migrações</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">3</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Fase 3 - Backend Services</div>
                <div className="text-sm text-gray-700">APIs, validações e serviços</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">4</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Fase 4 - Cadastros Funcionais</div>
                <div className="text-sm text-gray-700">Implementação dos 8 cadastros</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">5</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Fase 5 - Operações Financeiras</div>
                <div className="text-sm text-gray-700">Lançamentos, NFs e devoluções</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financas360Index;