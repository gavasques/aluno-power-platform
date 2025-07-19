import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <Helmet>
        <title>Política de Privacidade - Core Guilherme Vasques</title>
        <meta name="description" content="Política de Privacidade da plataforma Core Guilherme Vasques - Aluno Power Platform" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Aluno Power Platform - Core Guilherme Vasques
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>LIBERDADE VIRTUAL LTDA</strong><br/>
                CNPJ: 53.822.042/0001-74<br/>
                Endereço: Rua São João Del Rey, 5863, Sala C, Vila Gaúcha, Marechal Cândido Rondon/PR, CEP: 85.966-174<br/>
                E-mail: suporte@guivasques.app | Telefone: (45) 9154-5607
              </p>
            </div>
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2>INTRODUÇÃO</h2>
            <p>
              A <strong>LIBERDADE VIRTUAL LTDA</strong>, responsável pela plataforma <strong>CORE GUILHERME VASQUES</strong>, 
              tem o compromisso de proteger a privacidade e os dados pessoais de todos os usuários de seus serviços. 
              Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados 
              (LGPD - Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e demais legislações 
              aplicáveis à proteção de dados pessoais no Brasil.
            </p>

            <p>
              Este documento tem como objetivo esclarecer de forma transparente e acessível como coletamos, utilizamos, 
              armazenamos, compartilhamos e protegemos os dados pessoais dos usuários da plataforma Aluno Power Platform, 
              bem como informar sobre os direitos dos titulares de dados e como exercê-los.
            </p>

            <h2>1. DADOS PESSOAIS COLETADOS</h2>

            <h3>1.1. Dados de Cadastro e Identificação</h3>
            <p><strong>Dados Coletados:</strong></p>
            <ul>
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>CPF ou CNPJ (conforme aplicável)</li>
            </ul>
            <p><strong>Finalidade:</strong> Criação e manutenção da conta do usuário, identificação para prestação dos serviços, cumprimento de obrigações legais e fiscais, comunicação oficial e suporte técnico.</p>

            <h3>1.2. Dados de Pagamento e Financeiros</h3>
            <p><strong>Dados Coletados:</strong></p>
            <ul>
              <li>Informações de cartão de crédito (processadas por parceiros seguros)</li>
              <li>Dados bancários para PIX e transferências</li>
              <li>Histórico de transações e pagamentos</li>
              <li>Informações de faturamento</li>
            </ul>
            <p><strong>Observação:</strong> Dados sensíveis de pagamento são processados por meio de parceiros especializados em segurança de pagamentos (como Stripe), que possuem certificações PCI DSS. Os dados de pagamento não são armazenados pela CONTRATADA.</p>

            <h3>1.3. Dados de Uso e Navegação</h3>
            <p><strong>Dados Coletados:</strong></p>
            <ul>
              <li>Endereço IP</li>
              <li>Informações do dispositivo (tipo, modelo, sistema operacional)</li>
              <li>Informações do navegador</li>
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Funcionalidades utilizadas</li>
              <li>Logs de acesso e atividades</li>
            </ul>

            <h3>1.4. Dados de Conteúdo e Arquivos</h3>
            <p><strong>Dados Coletados:</strong></p>
            <ul>
              <li>Imagens enviadas para processamento</li>
              <li>Textos e descrições inseridos</li>
              <li>Dados de produtos (títulos, descrições, preços)</li>
              <li>Informações de fornecedores</li>
              <li>Arquivos e documentos carregados na plataforma</li>
            </ul>

            <h2>2. FINALIDADES DO TRATAMENTO</h2>

            <h3>2.1. Prestação dos Serviços Contratados</h3>
            <p>Utilização dos dados para fornecimento das funcionalidades da plataforma, incluindo agentes de inteligência artificial, processamento de imagens, simuladores financeiros e ferramentas de gestão.</p>

            <h3>2.2. Gestão de Conta e Relacionamento</h3>
            <p>Criação, manutenção e gestão da conta do usuário, incluindo autenticação, controle de acesso e personalização da experiência.</p>

            <h3>2.3. Segurança e Prevenção de Fraudes</h3>
            <p>Proteção da plataforma e dos usuários contra atividades fraudulentas, ataques cibernéticos e outras ameaças à segurança.</p>

            <h3>2.4. Melhoria e Desenvolvimento dos Serviços</h3>
            <p>Análise de uso da plataforma, desenvolvimento de novas funcionalidades e otimização da experiência do usuário.</p>

            <h2>3. COMPARTILHAMENTO DE DADOS</h2>

            <h3>3.1. Parceiros Tecnológicos</h3>
            <p>Compartilhamos dados com parceiros tecnológicos necessários para operação da plataforma:</p>
            <ul>
              <li><strong>OpenAI, Anthropic, Google:</strong> Para processamento de inteligência artificial</li>
              <li><strong>Stripe:</strong> Para processamento seguro de pagamentos</li>
              <li><strong>Provedores de hospedagem:</strong> Para armazenamento e operação da plataforma</li>
            </ul>

            <h3>3.2. Autoridades Competentes</h3>
            <p>Podemos compartilhar dados quando exigido por lei ou por determinação de autoridades competentes.</p>

            <h2>4. SEGURANÇA DOS DADOS</h2>
            <p>Implementamos medidas técnicas e organizacionais adequadas para proteger os dados pessoais:</p>
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
              <li>Treinamento de equipe em proteção de dados</li>
            </ul>

            <h2>5. DIREITOS DOS TITULARES</h2>
            <p>Conforme a LGPD, você tem os seguintes direitos:</p>
            <ul>
              <li><strong>Confirmação:</strong> Confirmar a existência de tratamento de seus dados</li>
              <li><strong>Acesso:</strong> Acessar seus dados pessoais</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização/Bloqueio:</strong> Solicitar anonimização ou bloqueio de dados</li>
              <li><strong>Eliminação:</strong> Solicitar eliminação de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Solicitar portabilidade dos dados</li>
              <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
            </ul>

            <h2>6. RETENÇÃO DE DADOS</h2>
            <p>Mantemos os dados pessoais pelo tempo necessário para:</p>
            <ul>
              <li>Prestação dos serviços contratados</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Exercício de direitos em processos judiciais</li>
              <li>Dados de pagamento: conforme exigido pela legislação fiscal (mínimo 5 anos)</li>
              <li>Dados de navegação: até 2 anos</li>
            </ul>

            <h2>7. COOKIES E TECNOLOGIAS SIMILARES</h2>
            <p>Utilizamos cookies para:</p>
            <ul>
              <li>Manter sessões de usuário ativas</li>
              <li>Lembrar preferências e configurações</li>
              <li>Analisar o uso da plataforma</li>
              <li>Melhorar a experiência do usuário</li>
            </ul>
            <p>Você pode gerenciar as configurações de cookies através do seu navegador.</p>

            <h2>8. TRANSFERÊNCIA INTERNACIONAL</h2>
            <p>Alguns de nossos parceiros tecnológicos podem estar localizados fora do Brasil. Nesses casos, garantimos que as transferências sejam realizadas com adequado nível de proteção, conforme exigido pela LGPD.</p>

            <h2>9. CONTATO E EXERCÍCIO DE DIREITOS</h2>
            <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta Política:</p>
            <ul>
              <li><strong>E-mail:</strong> suporte@guivasques.app</li>
              <li><strong>Telefone:</strong> (45) 9154-5607</li>
              <li><strong>Endereço:</strong> Rua São João Del Rey, 5863, Sala C, Vila Gaúcha, Marechal Cândido Rondon/PR, CEP: 85.966-174</li>
            </ul>

            <h2>10. ALTERAÇÕES NESTA POLÍTICA</h2>
            <p>Esta Política pode ser atualizada periodicamente. Sempre que houver alterações significativas, notificaremos os usuários através da plataforma ou por e-mail, com antecedência mínima de 30 dias.</p>

            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Última atualização:</strong> Janeiro de 2025<br/>
                Para dúvidas sobre esta Política de Privacidade, entre em contato através do email: suporte@guivasques.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}