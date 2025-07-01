import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Agent } from '@shared/schema';
import { BULLET_POINTS_CONFIG } from '@/lib/bulletPointsConfig';

interface UseBulletPointsGeneratorProps {
  agent?: Agent;
}

interface GenerationState {
  productName: string;
  brand: string;
  textInput: string;
  targetAudience: string;
  keywords: string;
  uniqueDifferential: string;
  materials: string;
  warranty: string;
  bulletPointsOutput: string;
  isGenerating: boolean;
  generatedBulletPoints: string;
  showReplaceDialog: boolean;
}

const BULLET_POINTS_PROMPT = `Gerar 8 bullet points convincentes que destaquem os benefícios do produto e levem o cliente a agir agora.

## 📝 Formato e Estilo dos Bullet Points

**Estrutura:** BENEFÍCIO PRINCIPAL EM MAIÚSCULAS – seguido de hífen "-" e então uma descrição com características de suporte que comprovem esse benefício.

**Tom:** Comercial, extremamente persuasivo e envolvente, focado em despertar urgência e desejo de compra agora. Fale diretamente com o cliente usando "você"/"seu".

**Quantidade e Tamanho:** Escreva 8 bullet points, cada um com entre 150 e 200 caracteres (contando espaços). Nunca menos de 150 ou mais de 200 caracteres por bullet.

**Call to Action:** O 3º bullet point deve terminar com "ADICIONAR AO CARRINHO" (em maiúsculas). Os demais não precisam incluir este texto.

**Formatação:** Forneça a resposta final em Markdown, com os bullet points listados claramente (pode numerar de 1 a 8 ou usar "-" para cada bullet). Separe a parte de análise prévia e os bullet points por seções, conforme Etapas definidas abaixo.

## 📦 Conteúdo e Estrutura dos 8 Bullet Points

Cada bullet point terá um foco específico, conforme abaixo:

1. **PÚBLICO-ALVO + PROPOSTA ÚNICA DE VALOR:** Quem é o cliente ideal e qual o diferencial único do produto. Estabeleça autoridade e confiança, mostrando como este produto é superior aos concorrentes e feito sob medida para o cliente. Tom: Transformacional (prometa uma mudança significativa, não apenas melhoria incremental).

2. **BENEFÍCIO EMOCIONAL PRINCIPAL:** Destaque o principal benefício emocional que o cliente terá. Foque no resultado real e sensorial que ele vai sentir ao usar o produto e conecte brevemente como alguma característica do produto proporciona esse resultado. Tom: Experiencial, evocando sentimentos positivos.

3. **CARACTERÍSTICAS TÉCNICAS + BENEFÍCIOS (com CTA):** Apresente as principais características técnicas ou funcionais do produto e ligue cada recurso a um benefício concreto. Se possível, responda a alguma dúvida frequente ou objeção do cliente através dessas características. Termine este bullet point com uma chamada para ação "ADICIONAR AO CARRINHO". Tom: Educativo e persuasivo.

4. **FACILIDADE DE USO:** Explique como o produto é fácil de usar ou manter. Destaque a conveniência e praticidade, removendo medos ou barreiras de uso. Tom: Tranquilizador e encorajador.

5. **REDUÇÃO DE RISCO + GARANTIAS:** Reforce elementos que passem segurança ao cliente. Inclua garantias, certificações, qualidade premium, origem confiável ou suporte que venha com o produto. Conecte também com valores do cliente se relevante. Tom: Confiável e seguro.

6. **TRANSFORMAÇÃO / RESULTADO FINAL:** Pinte um quadro da transformação completa que o produto proporciona. Use contraste de antes e depois para mostrar o impacto na vida do cliente após o uso. Crie um senso de urgência para aproveitar essa transformação agora. Tom: Inspiracional e empolgante.

7. **EXCLUSIVIDADE + INOVAÇÃO:** Destaque o que torna o produto único ou exclusivo. Isso pode ser uma tecnologia avançada, design inovador, edição limitada ou parceria exclusiva. Invoque a sensação de que este produto é especial e difícil de encontrar em outro lugar. Tom: Urgente e exclusivo.

8. **CALL TO ACTION FINAL (Resumo dos Benefícios):** Uma chamada final irresistível à ação. Faça uma síntese poderosa dos principais benefícios já mencionados, lembrando o cliente do quanto ele tem a ganhar. Termine convidando-o a agir imediatamente. Tom: Extremamente urgente e convincente, irresistível.

## 🧠 Técnicas de Copywriting Obrigatórias

Incorpore as seguintes estratégias psicológicas:

- **Agitação da Dor:** Mencione brevemente o problema ou dor que o produto resolve
- **Ponte Benefício-Característica:** Sempre que citar uma característica técnica, imediatamente conecte-a a como isso beneficia o cliente na prática
- **Prova Social/Autoridade:** Reforce a credibilidade com prova social ou autoridade relacionada
- **Urgência:** Utilize palavras que criem senso de urgência temporal, incentivando o cliente a não adiar a compra
- **Propriedade Mental:** Leve o cliente a se imaginar usando o produto e desfrutando dos benefícios
- **Transformação:** Reforce a ideia de que o produto traz uma mudança transformadora na vida do cliente

## 💥 Palavras de Poder (Power Words)

Inclua, quando adequado: Finalmente, Revolucionário, Exclusivo, Comprovado, Superior, Imediato, Instantâneo, Transforme, Experimente, Descubra, Garantido, Clinicamente Testado, Premium, Profissional, Único, Avançado, Inovador, Eficaz, Poderoso.

## 🚫 Restrições (O que NÃO fazer)

❌ Falar em 1ª pessoa plural: Não use "nós" ou "nosso(a)". Aborde sempre o cliente diretamente como "você"
❌ Menções de preço, promoção ou envio: Não mencione valores, descontos, frete, parcelamento, cupons, ou políticas de devolução
❌ Pressão de estoque explícita: Não use frases como "somente X unidades" ou "estoque limitado"
❌ Listar cores disponíveis: Não faça listagens do tipo "Disponível nas cores X, Y..."
❌ Jargões técnicos sem explicação: Se precisar citar termos técnicos, explique o benefício que eles trazem
❌ Linguagem genérica ou promessas vagas: Evite termos como "alta qualidade" sem contexto
❌ Fugir do tema do produto: Não inclua informações que não estejam relacionadas ao produto
❌ Inventar funcionalidades/benefícios não fornecidos: Use apenas informações fornecidas sobre o produto

## 📊 Etapa 1: Análise Prévia do Produto

Antes de redigir os bullet points, analise as informações do produto e identifique:

- **Diferencial Único:** O que torna este produto melhor ou diferente dos concorrentes?
- **Materiais:** Do que o produto é feito? Esses materiais trazem alguma vantagem?
- **Cores/Design:** Qual é o design ou as cores do produto e por que isso importa para o cliente?
- **Embalagem:** Como é a embalagem e qual o valor agregado dela?
- **Detalhes Adicionais:** Informações extras relevantes
- **Top 7 Benefícios para o Cliente:** Liste os 7 benefícios mais fortes e desejados que esse produto oferece

## 🚀 Etapa 2: Criação dos Bullet Points de Alta Conversão

Com base na análise acima, redija os 8 bullet points seguindo estritamente o formato e conteúdo especificado:

- Iniciar cada bullet com o benefício principal em maiúsculas, seguido de "–" e detalhes persuasivos
- Incorporar palavras de poder e técnicas psicológicas conforme adequado
- Manter o limite de caracteres (150 a 200) em cada bullet, sem exceder
- Revisar o tom para garantir que está fortemente persuasivo, focado no cliente
- Especial atenção ao 3º bullet: inclua no final a frase "ADICIONAR AO CARRINHO"
- Bullet 8 deve concluir amarrando os principais benefícios e convidando à ação imediata

**IMPORTANTE:** Execute primeiro a Etapa 1 (análise) e em seguida a Etapa 2 (bullet points).

Agora, utilizando as informações fornecidas sobre o produto abaixo, execute a Etapa 1 (análise) e em seguida a Etapa 2 (bullet points):

{{PRODUCT_INFO}}`;

export const useBulletPointsGenerator = ({ agent }: UseBulletPointsGeneratorProps) => {
  const [state, setState] = useState<GenerationState>({
    productName: '',
    brand: '',
    textInput: '',
    targetAudience: '',
    keywords: '',
    uniqueDifferential: '',
    materials: '',
    warranty: '',
    bulletPointsOutput: '',
    isGenerating: false,
    generatedBulletPoints: '',
    showReplaceDialog: false,
  });

  const [agentConfig, setAgentConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Atualizar configuração automaticamente quando o agente mudar
  useEffect(() => {
    if (agent) {
      const newConfig = {
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o-mini',
        temperature: typeof agent.temperature === 'string' ? parseFloat(agent.temperature) : agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 2000
      };
      console.log('🔧 [BULLET_POINTS] Auto-updating agent config:', newConfig);
      setAgentConfig(newConfig);
    }
  }, [agent]);

  const updateAgentConfig = useCallback(() => {
    if (agent) {
      const newConfig = {
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o-mini',
        temperature: typeof agent.temperature === 'string' ? parseFloat(agent.temperature) : agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 2000
      };
      console.log('🔧 [BULLET_POINTS] Manual update agent config:', newConfig);
      setAgentConfig(newConfig);
    }
  }, [agent]);

  const generateWithAI = useCallback(async () => {
    if (!state.productName.trim() || !state.textInput.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Campos obrigatórios",
        description: "Preencha o nome do produto e as informações detalhadas.",
      });
      return;
    }

    updateState({ isGenerating: true });

    try {
      // SEMPRE buscar as configurações mais recentes do agente antes de gerar
      const agentResponse = await fetch('/api/agents/bullet-points-generator', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!agentResponse.ok) {
        throw new Error('Erro ao buscar configurações do agente');
      }
      
      const agentData = await agentResponse.json();
      const currentConfig = {
        provider: agentData.provider || 'openai',
        model: agentData.model || 'gpt-4o-mini',
        temperature: typeof agentData.temperature === 'string' ? parseFloat(agentData.temperature) : agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 2000
      };

      console.log('🚀 [BULLET_POINTS] Starting generation with FRESH config:', currentConfig);
      setAgentConfig(currentConfig); // Atualizar o estado local também

      const startTime = Date.now();

      const productInfo = `
NOME DO PRODUTO: ${state.productName}
${state.brand ? `MARCA: ${state.brand}` : ''}
${state.targetAudience ? `PÚBLICO-ALVO: ${state.targetAudience}` : ''}
${state.keywords ? `PALAVRAS-CHAVE: ${state.keywords}` : ''}
${state.uniqueDifferential ? `DIFERENCIAL ÚNICO: ${state.uniqueDifferential}` : ''}
${state.materials ? `MATERIAIS: ${state.materials}` : ''}
${state.warranty ? `GARANTIA: ${state.warranty}` : ''}

INFORMAÇÕES DETALHADAS DO PRODUTO:
${state.textInput}
      `.trim();

      const prompt = BULLET_POINTS_PROMPT.replace('{{PRODUCT_INFO}}', productInfo);

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: currentConfig.provider,
          model: currentConfig.model,
          prompt: prompt,
          maxTokens: currentConfig.maxTokens,
          temperature: currentConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da IA');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro na geração de bullet points');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const responseText = data.response;

      // Salvar log da geração (somente se usuário estiver logado)
      if (user && user.id) {
        await fetch('/api/ai-generation-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: user.id,
            provider: currentConfig.provider,
            model: currentConfig.model,
            prompt: prompt,
            response: responseText,
            promptCharacters: prompt.length,
            responseCharacters: responseText.length,
            inputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.inputTokens || 0 : 0,
            outputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.outputTokens || 0 : 0,
            totalTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.totalTokens || 0 : 0,
            cost: data.cost || 0,
            duration: duration,
            feature: 'bullet-points-generator'
          })
        });
      }

      if (state.bulletPointsOutput && state.bulletPointsOutput.trim()) {
        updateState({ 
          generatedBulletPoints: responseText,
          showReplaceDialog: true 
        });
      } else {
        updateState({ bulletPointsOutput: responseText });
        toast({
          title: "✓ Bullet Points Gerados!",
          description: "Bullet points criados com sucesso usando IA",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao gerar bullet points",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      updateState({ isGenerating: false });
    }
  }, [state.productName, state.textInput, state.brand, state.targetAudience, state.keywords, state.bulletPointsOutput, user, agentConfig, toast, updateState]);

  const copyBulletPoints = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.bulletPointsOutput);
      toast({
        title: "✓ Copiado!",
        description: "Bullet points copiados para a área de transferência",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Erro ao copiar bullet points",
      });
    }
  }, [state.bulletPointsOutput, toast]);

  const handleReplace = useCallback(() => {
    updateState({
      bulletPointsOutput: state.generatedBulletPoints,
      showReplaceDialog: false,
      generatedBulletPoints: ''
    });
    toast({
      title: "✓ Bullet Points Substituídos!",
      description: "Novos bullet points aplicados com sucesso",
    });
  }, [state.generatedBulletPoints, toast, updateState]);

  const handleKeepBoth = useCallback(() => {
    const separator = '\n\n--- NOVA VERSÃO ---\n\n';
    updateState({
      bulletPointsOutput: state.bulletPointsOutput + separator + state.generatedBulletPoints,
      showReplaceDialog: false,
      generatedBulletPoints: ''
    });
    toast({
      title: "✓ Versões Combinadas!",
      description: "Ambas as versões foram mantidas",
    });
  }, [state.bulletPointsOutput, state.generatedBulletPoints, toast, updateState]);

  const handleClearAll = useCallback(() => {
    updateState({
      productName: '',
      brand: '',
      textInput: '',
      targetAudience: '',
      keywords: '',
      bulletPointsOutput: '',
      generatedBulletPoints: '',
      showReplaceDialog: false
    });
  }, [updateState]);

  return {
    state,
    agentConfig,
    updateState,
    updateAgentConfig,
    generateWithAI,
    copyBulletPoints,
    handleReplace,
    handleKeepBoth,
    handleClearAll
  };
};