import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star, Copy, Play, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Agent, AGENT_CATEGORIES } from '@/types/agent';

const AgentDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  // Mock data baseado no ID
  const getAgentById = (agentId: string): Agent | null => {
    const agents = [
      {
        id: '1',
        title: 'Gerador de Listings Amazon',
        description: 'Crie listings otimizados para Amazon com títulos, bullet points e descrições que convertem mais vendas.',
        icon: '🛒',
        category: AGENT_CATEGORIES.find(c => c.id === 'ecommerce')!,
        badges: ['Novo!'],
        isFavorite: false,
        isNew: true,
        isBeta: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Análise de Escrita',
        description: 'Analise e melhore seus e-mails para aumentar taxa de abertura e engajamento dos destinatários.',
        icon: '✍️',
        category: AGENT_CATEGORIES.find(c => c.id === 'emails')!,
        badges: [],
        isFavorite: false,
        isNew: false,
        isBeta: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Ângulos de Anúncios',
        description: 'Gere múltiplos ângulos criativos para seus anúncios e encontre o que melhor ressoa com seu público.',
        icon: '📊',
        category: AGENT_CATEGORIES.find(c => c.id === 'marketing')!,
        badges: ['Beta'],
        isFavorite: false,
        isNew: false,
        isBeta: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        title: 'Criador de Conteúdo',
        description: 'Produza conteúdo envolvente para redes sociais, blogs e campanhas de marketing digital.',
        icon: '📝',
        category: AGENT_CATEGORIES.find(c => c.id === 'content')!,
        badges: [],
        isFavorite: false,
        isNew: false,
        isBeta: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        title: 'Otimizador de Títulos',
        description: 'Otimize títulos para SEO e conversão usando técnicas comprovadas de copywriting e marketing.',
        icon: '🎯',
        category: AGENT_CATEGORIES.find(c => c.id === 'marketing')!,
        badges: [],
        isFavorite: false,
        isNew: false,
        isBeta: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        title: 'Gerador de Scripts',
        description: 'Crie scripts envolventes para vídeos do YouTube que mantêm a audiência engajada do início ao fim.',
        icon: '🎬',
        category: AGENT_CATEGORIES.find(c => c.id === 'youtube')!,
        badges: ['Beta'],
        isFavorite: false,
        isNew: false,
        isBeta: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return agents.find(agent => agent.id === agentId) || null;
  };

  const agent = getAgentById(id!);

  if (!agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Agente não encontrado</h1>
          <Button onClick={() => setLocation('/hub/agents')}>
            Voltar para Agentes
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Entrada necessária",
        description: "Por favor, forneça uma entrada para o agente processar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simular processamento
    setTimeout(() => {
      const mockOutputs = {
        '1': `**Título Otimizado:**
Fone Bluetooth Premium | Cancelamento Ruído Ativo | 30h Bateria | Resistente Água IPX7

**Bullet Points:**
• ✅ CANCELAMENTO DE RUÍDO ATIVO - Tecnologia avançada que elimina 95% dos ruídos externos
• 🔋 BATERIA ULTRA DURADOURA - Até 30 horas de reprodução contínua com case de carregamento
• 💧 RESISTENTE À ÁGUA IPX7 - Proteção total contra suor e chuva para uso em exercícios
• 🎵 QUALIDADE AUDIO HD - Drivers premium de 40mm para graves profundos e agudos cristalinos
• 📱 CONEXÃO INSTANTÂNEA - Pareamento automático com qualquer dispositivo Bluetooth 5.0

**Descrição A+:**
Experimente a liberdade total do som sem fio com nosso fone Bluetooth premium. Desenvolvido para quem não aceita menos que a perfeição...`,
        
        '2': `**Análise da Escrita:**

**Taxa de Abertura Estimada:** 24% (+8% acima da média)

**Pontos Fortes:**
✅ Linha de assunto clara e direta
✅ Personalização adequada
✅ Call-to-action bem posicionado

**Sugestões de Melhoria:**
🔸 Adicionar urgência na linha de assunto
🔸 Incluir prova social no primeiro parágrafo
🔸 Reduzir texto em 15% para melhor engajamento
🔸 Adicionar P.S. com benefício adicional

**Versão Otimizada:**
Assunto: [URGENTE] Sua proposta expira em 24h, João

Olá João,

Notei que você ainda não aproveitou nossa oferta especial...`,

        '3': `**Ângulos de Anúncios Gerados:**

**Ângulo 1 - Problema/Solução:**
"Cansado de perder clientes para concorrência? Nossa estratégia aumenta vendas em 40% nos primeiros 30 dias."

**Ângulo 2 - Prova Social:**
"Mais de 1.247 empresas já aumentaram suas vendas conosco. Veja os resultados reais de nossos clientes."

**Ângulo 3 - Urgência/Escassez:**
"Apenas 15 vagas restantes para consultoria gratuita. Garante a sua antes que seja tarde demais."

**Ângulo 4 - Benefício Único:**
"O único método que combina IA + estratégia humana para resultados 3x mais rápidos."

**Ângulo 5 - Curiosidade:**
"O segredo que empresas bilionárias usam (e você pode copiar hoje mesmo)."`,

        '4': `**Conteúdo Criado:**

**Post LinkedIn:**
🚀 3 erros que estão sabotando seu crescimento online:

1️⃣ Não conhecer seu público real
2️⃣ Focar em métricas de vaidade
3️⃣ Não ter um funil estruturado

A boa notícia? Todos são facilmente corrigíveis.

Salvou este post? Compartilhe com quem precisa ver.

**Thread Twitter:**
🧵 Como aumentei meu faturamento em 300% em 6 meses:

1/ Parei de vender produtos
2/ Comecei a vender transformações
3/ Entendi que pessoas compram resultados, não recursos...

**Caption Instagram:**
✨ Transformação real acontece quando você para de fazer mais do mesmo.

Swipe para ver os 5 hábitos que mudaram meu negócio em 2024 →`,

        '5': `**Títulos Otimizados:**

**Original:** Como Ganhar Dinheiro Online

**Versões Otimizadas:**

🎯 **Para SEO:**
"Como Ganhar R$ 5.000/mês Online: 7 Métodos Comprovados [2024]"

🔥 **Para Conversão:**
"O Método Simples que Me Fez Ganhar R$ 15.000 no Primeiro Mês"

💡 **Para Curiosidade:**
"Este 'Truque' Idiota Me Fez Ganhar R$ 127.000 Trabalhando 3h/dia"

📊 **Para Credibilidade:**
"Estudo de Caso: Como Transformei R$ 500 em R$ 50.000 Online"

⚡ **Para Urgência:**
"Última Chance: O Segredo que Bancos Não Querem que Você Saiba"`,

        '6': `**Script de Vídeo YouTube:**

**HOOK (0-15s):**
"Se você tem menos de 1000 seguidores, este vídeo vai mudar sua vida. Fica até o final porque no minuto 8:47 eu revelo o segredo que ninguém conta."

**INTRODUÇÃO (15-45s):**
"E aí, pessoal! Tudo bem? Eu sou [SEU NOME] e hoje vou compartilhar com vocês a estratégia exata que usei para sair de 0 para 100.000 seguidores em apenas 90 dias..."

**DESENVOLVIMENTO (45s-8min):**
1. O erro que 99% das pessoas cometem
2. A fórmula dos 3 pilares
3. Caso prático passo a passo
4. Ferramentas que você precisa

**REVELAÇÃO (8m-9m):**
"E agora o que prometi: o segredo que mudou tudo para mim foi..."

**CALL TO ACTION (9m-10m):**
"Se este vídeo te ajudou, deixa o like, se inscreve no canal e comenta AÍ embaixo qual foi sua maior dificuldade. Vejo vocês no próximo vídeo!"`,
      };

      setOutput(mockOutputs[agent.id as keyof typeof mockOutputs] || "Resultado gerado com sucesso!");
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o resultado.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'Novo!':
        return 'default';
      case 'Beta':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation('/hub/agents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="text-4xl">{agent.icon}</div>
          <div>
            <h1 className="text-3xl font-bold">{agent.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={agent.category.color} variant="secondary">
                {agent.category.name}
              </Badge>
              {agent.badges.map((badge) => (
                <Badge
                  key={badge}
                  variant={getBadgeVariant(badge)}
                  className="text-xs"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="ml-auto">
          <Star className="h-4 w-4 mr-2" />
          Favoritar
        </Button>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre este Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{agent.description}</p>
        </CardContent>
      </Card>

      {/* Input/Output Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={getPlaceholder(agent.id)}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Gerar Resultado
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Resultado
              </span>
              {output && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(output)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="bg-gray-50 border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                O resultado aparecerá aqui após a geração
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function getPlaceholder(agentId: string): string {
  const placeholders = {
    '1': 'Descreva seu produto:\n\nNome: Fone Bluetooth Premium\nCaracterísticas: Cancelamento de ruído, 30h bateria, resistente à água\nPúblico-alvo: Profissionais que trabalham em casa\nDiferenciais: Qualidade de som superior, design ergonômico',
    '2': 'Cole seu e-mail aqui:\n\nAssunto: Oferta especial para você\n\nOlá [Nome],\n\nEspero que esteja bem. Queria compartilhar uma oportunidade única...',
    '3': 'Descreva seu produto/serviço:\n\nProduto: Curso de Marketing Digital\nPúblico: Empreendedores iniciantes\nBenefício principal: Aumentar vendas online\nObjetivo: Gerar leads qualificados',
    '4': 'Tópico para conteúdo:\n\nTema: Produtividade no trabalho remoto\nPlataforma: LinkedIn\nTom: Profissional e inspirador\nObjetivo: Engajamento e autoridade',
    '5': 'Título original:\n\nComo Ganhar Dinheiro Online\n\nContexto: Artigo de blog sobre métodos de renda extra\nPúblico: Pessoas buscando renda adicional\nObjetivo: Aumentar cliques e conversão',
    '6': 'Tópico do vídeo:\n\nTema: Como crescer no Instagram\nDuração: 10 minutos\nPúblico: Criadores de conteúdo\nObjetivo: Educativo e engajante'
  };
  
  return placeholders[agentId as keyof typeof placeholders] || 'Descreva o que você gostaria de gerar...';
}

export default AgentDetail;