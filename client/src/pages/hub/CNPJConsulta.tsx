import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Building, Users, MapPin, Phone, Mail, Calendar, DollarSign, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface EnderecoData {
  bairro: string;
  cep: string;
  complemento: string;
  logradouro: string;
  municipio: string;
  numero: string;
  uf: string;
}

interface SocioData {
  data_entrada: string;
  documento_socio: string;
  nome_socio: string;
  qualificacao: string;
}

interface CNPJData {
  capital_social: string;
  cnae_principal: string;
  cnaes_secundarios: string[];
  cnpj: string;
  data_criacao: string;
  data_situacao: string;
  email: string;
  endereco: EnderecoData;
  natureza_juridica: string;
  nome_fantasia: string;
  porte: string;
  razao_social: string;
  situacao: string;
  telefones: string[];
}

interface CNPJResponse {
  dados: CNPJData;
  mensagem: string;
  participacoes: any[];
  socios: SocioData[];
  status: boolean;
}

interface ExpandableSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors cross-browser-transition"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500 cross-browser-transition" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 cross-browser-transition" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default function CNPJConsulta() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [cnpjData, setCnpjData] = useState<CNPJResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    address: false,
    contact: false,
    financial: false,
    partners: false,
  });
  const { toast } = useToast();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const limited = numbers.slice(0, 14);
    
    // Aplica a máscara
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 14;
  };

  const handleSubmit = async () => {
    if (!validateCNPJ(cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, insira um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      
      const response = await fetch(`/api/cnpj-consulta?cnpj=${cnpjNumbers}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar CNPJ');
      }

      const data: CNPJResponse = await response.json();
      
      if (!data.status) {
        throw new Error(data.mensagem || 'Erro na consulta');
      }

      setCnpjData(data);
      
      // Expandir seção básica automaticamente
      setExpandedSections(prev => ({
        ...prev,
        basicInfo: true
      }));

      toast({
        title: "Consulta realizada com sucesso",
        description: `Dados encontrados para ${data.dados.razao_social}`,
      });

    } catch (error) {
      console.error('Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro desconhecido ao consultar CNPJ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatQualificacao = (qualificacao: string) => {
    return qualificacao.charAt(0).toUpperCase() + qualificacao.slice(1).toLowerCase();
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="product-details-container container mx-auto px-4 py-6 max-w-6xl cross-browser-scrollbar">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 cross-browser-break-words">
          Consulta de CNPJ
        </h1>
        <p className="text-sm sm:text-base text-gray-600 cross-browser-break-words">
          Consulte informações detalhadas de empresas brasileiras através do CNPJ
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Empresa
          </CardTitle>
          <CardDescription>
            Digite o CNPJ da empresa para consultar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <div className="flex gap-2">
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                className="flex-1"
                maxLength={18}
              />
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !validateCNPJ(cnpj)}
                className="cross-browser-button"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Consultar
                  </>
                )}
              </Button>
            </div>
            {cnpj && !validateCNPJ(cnpj) && (
              <p className="text-sm text-red-600">CNPJ deve ter 14 dígitos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {cnpjData && (
        <div className="space-y-4">
          {/* Informações Básicas */}
          <ExpandableSection
            title="Informações Básicas"
            icon={Building}
            isExpanded={expandedSections.basicInfo}
            onToggle={() => toggleSection('basicInfo')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Razão Social:</span>
                  <p className="font-semibold cross-browser-break-words">{cnpjData.dados.razao_social}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Nome Fantasia:</span>
                  <p className="cross-browser-break-words">{cnpjData.dados.nome_fantasia || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">CNPJ:</span>
                  <p className="font-mono text-sm">{formatCNPJ(cnpjData.dados.cnpj)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Situação:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    cnpjData.dados.situacao === 'Ativa' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cnpjData.dados.situacao}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Porte:</span>
                  <p>{cnpjData.dados.porte}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Data de Criação:</span>
                  <p>{formatDate(cnpjData.dados.data_criacao)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Data da Situação:</span>
                  <p>{formatDate(cnpjData.dados.data_situacao)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Natureza Jurídica:</span>
                  <p className="cross-browser-break-words">{cnpjData.dados.natureza_juridica}</p>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Endereço */}
          <ExpandableSection
            title="Endereço"
            icon={MapPin}
            isExpanded={expandedSections.address}
            onToggle={() => toggleSection('address')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Logradouro:</span>
                  <p className="cross-browser-break-words">{cnpjData.dados.endereco.logradouro}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Número:</span>
                  <p>{cnpjData.dados.endereco.numero}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Complemento:</span>
                  <p>{cnpjData.dados.endereco.complemento || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Bairro:</span>
                  <p>{cnpjData.dados.endereco.bairro}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Município/UF:</span>
                  <p>{cnpjData.dados.endereco.municipio}/{cnpjData.dados.endereco.uf}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">CEP:</span>
                  <p className="font-mono text-sm">{cnpjData.dados.endereco.cep}</p>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Contato */}
          <ExpandableSection
            title="Informações de Contato"
            icon={Phone}
            isExpanded={expandedSections.contact}
            onToggle={() => toggleSection('contact')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email:
                </span>
                <p className="mt-1 cross-browser-break-words">{cnpjData.dados.email || 'Não informado'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefones:
                </span>
                <div className="mt-1 space-y-1">
                  {cnpjData.dados.telefones.length > 0 ? (
                    cnpjData.dados.telefones.map((telefone, index) => (
                      <p key={index} className="font-mono text-sm">{telefone}</p>
                    ))
                  ) : (
                    <p>Não informado</p>
                  )}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Informações Financeiras */}
          <ExpandableSection
            title="Informações Financeiras e Atividades"
            icon={DollarSign}
            isExpanded={expandedSections.financial}
            onToggle={() => toggleSection('financial')}
          >
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Capital Social:</span>
                <p className="text-lg font-semibold text-green-600">{cnpjData.dados.capital_social}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">CNAE Principal:</span>
                <p className="cross-browser-break-words">{cnpjData.dados.cnae_principal}</p>
              </div>
              
              {cnpjData.dados.cnaes_secundarios.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">CNAEs Secundários:</span>
                  <div className="mt-2 space-y-1">
                    {cnpjData.dados.cnaes_secundarios.map((cnae, index) => (
                      <p key={index} className="text-sm cross-browser-break-words">{cnae}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ExpandableSection>

          {/* Sócios */}
          {cnpjData.socios.length > 0 && (
            <ExpandableSection
              title={`Sócios e Administradores (${cnpjData.socios.length})`}
              icon={Users}
              isExpanded={expandedSections.partners}
              onToggle={() => toggleSection('partners')}
            >
              <div className="space-y-4">
                {cnpjData.socios.map((socio, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Nome:</span>
                        <p className="font-semibold cross-browser-break-words">{socio.nome_socio}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Qualificação:</span>
                        <p className="cross-browser-break-words">{formatQualificacao(socio.qualificacao)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Documento:</span>
                        <p className="font-mono text-sm">{socio.documento_socio}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Data de Entrada:</span>
                        <p>{formatDate(socio.data_entrada)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}
        </div>
      )}
    </div>
  );
}