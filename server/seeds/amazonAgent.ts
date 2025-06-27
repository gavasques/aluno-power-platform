import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const AMAZON_AGENT_ID = 'amazon-listing-agent-001';

export async function seedAmazonAgent() {
  try {
    // Check if agent already exists
    const existingAgent = await storage.getAgent(AMAZON_AGENT_ID);
    if (existingAgent) {
      console.log('Amazon agent already exists, skipping seed...');
      return;
    }

    console.log('Creating Amazon Listing Agent...');

    // Create the Amazon agent
    const agent = await storage.createAgent({
      id: AMAZON_AGENT_ID,
      name: 'Agente de Listings Amazon',
      description: 'Cria listings otimizados para Amazon baseado em análise de avaliações de produtos',
      category: 'E-commerce',
      icon: '🛒',
      isActive: true,
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    });

    // Create system prompt
    await storage.createAgentPrompt({
      id: uuidv4(),
      agentId: AMAZON_AGENT_ID,
      promptType: 'system',
      content: `Você é um especialista em marketplace Amazon com mais de 10 anos de experiência em criação de listings que convertem. Sua especialidade é analisar dados de produtos e avaliações para criar conteúdo otimizado que maximiza vendas e satisfação do cliente.

DIRETRIZES FUNDAMENTAIS:
- Sempre responda em JSON válido
- Use linguagem persuasiva mas honesta
- Foque em benefícios, não apenas recursos
- Considere SEO e palavras-chave relevantes
- Mantenha credibilidade evitando exageros
- Adapte tom conforme público-alvo identificado`,
      version: 1,
      isActive: true
    });

    // Create analysis prompt
    await storage.createAgentPrompt({
      id: uuidv4(),
      agentId: AMAZON_AGENT_ID,
      promptType: 'analysis',
      content: `Analise as informações do produto e dados de avaliações para identificar insights estratégicos.

DADOS DO PRODUTO:
{{PRODUCT_INFO}}

DADOS DAS AVALIAÇÕES:
{{REVIEWS_DATA}}

Retorne um JSON com esta estrutura exata:
{
  "keyBenefits": ["benefício principal 1", "benefício principal 2", "benefício principal 3"],
  "targetAudience": "descrição detalhada do público-alvo ideal",
  "competitiveAdvantages": ["vantagem competitiva 1", "vantagem competitiva 2"],
  "potentialConcerns": ["preocupação potencial 1", "preocupação potencial 2"],
  "marketPosition": "posicionamento no mercado (premium/intermediário/econômico)"
}

INSTRUÇÕES:
- Base a análise nas avaliações reais dos clientes
- Identifique padrões nos pontos positivos e negativos
- Determine o público que mais se beneficia do produto
- Identifique diferenciais competitivos claros
- Antecipe objeções comuns dos compradores`,
      version: 1,
      isActive: true
    });

    // Create title generation prompt
    await storage.createAgentPrompt({
      id: uuidv4(),
      agentId: AMAZON_AGENT_ID,
      promptType: 'title',
      content: `Crie 5 títulos otimizados para Amazon baseado na análise do produto.

INFORMAÇÕES DO PRODUTO:
{{PRODUCT_INFO}}

ANÁLISE ESTRATÉGICA:
{{ANALYSIS_RESULT}}

Retorne um JSON com esta estrutura exata:
{
  "titles": [
    "Título 1 - máximo 200 caracteres",
    "Título 2 - máximo 200 caracteres", 
    "Título 3 - máximo 200 caracteres",
    "Título 4 - máximo 200 caracteres",
    "Título 5 - máximo 200 caracteres"
  ]
}

REGRAS PARA TÍTULOS:
- Máximo 200 caracteres (incluindo espaços)
- Comece com palavra-chave principal
- Inclua benefício principal
- Mencione características técnicas relevantes
- Use termos que clientes pesquisam
- Evite símbolos especiais desnecessários
- Priorize clareza e escaneabilidade

ESTRUTURA SUGERIDA:
[Marca] [Produto] - [Benefício Principal] - [Características] - [Público/Uso]`,
      version: 1,
      isActive: true
    });

    // Create bullet points prompt
    await storage.createAgentPrompt({
      id: uuidv4(),
      agentId: AMAZON_AGENT_ID,
      promptType: 'bulletPoints',
      content: `Crie 5 bullet points persuasivos para Amazon baseado na análise do produto.

INFORMAÇÕES DO PRODUTO:
{{PRODUCT_INFO}}

ANÁLISE ESTRATÉGICA:
{{ANALYSIS_RESULT}}

Retorne um JSON com esta estrutura exata:
{
  "bulletPoints": [
    "Bullet point 1 - máximo 255 caracteres",
    "Bullet point 2 - máximo 255 caracteres",
    "Bullet point 3 - máximo 255 caracteres", 
    "Bullet point 4 - máximo 255 caracteres",
    "Bullet point 5 - máximo 255 caracteres"
  ]
}

REGRAS PARA BULLET POINTS:
- Máximo 255 caracteres cada
- Comece com benefício, não característica
- Use linguagem ativa e direta
- Inclua prova social quando relevante
- Antecipe objeções comuns
- Seja específico com números/dados

ESTRUTURA SUGERIDA:
✓ [BENEFÍCIO] - [Como/Porque] [Característica] [Resultado]

EXEMPLO:
✓ REDUZ TEMPO DE LIMPEZA EM 50% - Motor potente de 1200W remove sujeira pesada em uma passada, deixando superfícies impecáveis
✓ SEGURANÇA GARANTIDA - Certificação INMETRO e proteção contra superaquecimento protegem sua família durante o uso`,
      version: 1,
      isActive: true
    });

    // Create description prompt
    await storage.createAgentPrompt({
      id: uuidv4(),
      agentId: AMAZON_AGENT_ID,
      promptType: 'description',
      content: `Crie uma descrição completa e persuasiva para Amazon.

INFORMAÇÕES DO PRODUTO:
{{PRODUCT_INFO}}

ANÁLISE ESTRATÉGICA:
{{ANALYSIS_RESULT}}

TÍTULO SELECIONADO:
{{TITLE}}

BULLET POINTS:
{{BULLET_POINTS}}

Crie uma descrição detalhada que:

1. **ABERTURA IMPACTANTE** (2-3 frases)
   - Hook emocional conectando com problema do cliente
   - Apresente a solução de forma clara

2. **BENEFÍCIOS DETALHADOS** (3-4 parágrafos)
   - Expanda os bullet points com mais detalhes
   - Use storytelling quando apropriado
   - Inclua casos de uso específicos

3. **ESPECIFICAÇÕES TÉCNICAS** (1-2 parágrafos)
   - Dimensões, materiais, capacidades
   - Compatibilidades e requisitos
   - Certificações e garantias

4. **CALL TO ACTION** (1-2 frases)
   - Urgência sutil
   - Benefício final

DIRETRIZES:
- Máximo 2000 caracteres total
- Use parágrafos curtos (2-3 frases)
- Inclua palavras-chave naturalmente
- Tom conversacional mas profissional
- Foque em como o produto melhora a vida do cliente

Retorne apenas o texto da descrição, sem formatação JSON.`,
      version: 1,
      isActive: true
    });

    console.log('✓ Amazon Listing Agent created successfully with all prompts');
    console.log(`Agent ID: ${AMAZON_AGENT_ID}`);

  } catch (error) {
    console.error('Error seeding Amazon agent:', error);
    throw error;
  }
}