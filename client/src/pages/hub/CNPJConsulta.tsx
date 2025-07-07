import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Building, Users, MapPin, Phone, Mail, Calendar, DollarSign, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CNPJInput, validateCNPJ } from '@/components/common/CNPJInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreditCostButton } from '@/components/CreditCostButton';
import { useUserCreditBalance } from '@/hooks/useUserCredits';

// Types
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

// Components
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
  children
}) => (
  <Card className="w-full">
    <CardHeader 
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </CardHeader>
    {isExpanded && (
      <CardContent className="border-t">
        {children}
      </CardContent>
    )}
  </Card>
);

export default function CNPJConsulta() {
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState<CNPJResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    address: false,
    contact: false,
    financial: false,
    partners: false,
  });

  const { execute, loading, error } = useApiRequest<CNPJResponse>({
    successMessage: 'Dados da empresa consultados com sucesso!',
  });
  const { balance: userBalance } = useUserCreditBalance();

  const handleSubmit = async () => {
    if (!validateCNPJ(cnpj)) return;

    const data = await execute(
      () => fetch(`/api/cnpj-consulta?cnpj=${cnpj}`),
    );

    if (data) {
      setCnpjData(data);
      setExpandedSections(prev => ({ ...prev, basicInfo: true }));
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateStr: string): string => {
    return dateStr || 'Não informado';
  };

  const formatPhone = (phone: string): string => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Building className="h-8 w-8" />
          Consulta de CNPJ
        </h1>
        <p className="text-muted-foreground">
          Consulte informações completas de empresas brasileiras através do CNPJ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultar Empresa</CardTitle>
          <CardDescription>
            Digite o CNPJ da empresa que deseja consultar (apenas números)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <CNPJInput
              value={cnpj}
              onChange={setCnpj}
              placeholder="Digite o CNPJ (apenas números)"
              className="w-full"
            />
          </div>

          <CreditCostButton
            featureName="tools.cnpj_lookup"
            userBalance={userBalance}
            onProcess={handleSubmit}
            disabled={loading || !validateCNPJ(cnpj)}
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Consultando...' : 'Consultar CNPJ'}
          </CreditCostButton>

          {loading && <LoadingSpinner message="Consultando dados da empresa..." />}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {cnpjData && cnpjData.status && (
        <div className="space-y-4">
          {/* Informações Básicas */}
          <ExpandableSection
            title="Informações Básicas"
            icon={Building}
            isExpanded={expandedSections.basicInfo}
            onToggle={() => toggleSection('basicInfo')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Razão Social:</span>
                    <p className="font-semibold">{cnpjData.dados.razao_social}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nome Fantasia:</span>
                    <p>{cnpjData.dados.nome_fantasia || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">CNPJ:</span>
                    <p className="font-mono">{cnpjData.dados.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Situação:</span>
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      cnpjData.dados.situacao?.toLowerCase().includes('ativa') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cnpjData.dados.situacao}
                    </span>
                  </div>
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
                  <p className="break-words">{cnpjData.dados.natureza_juridica}</p>
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
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Logradouro:</span>
                <p>{cnpjData.dados.endereco.logradouro}, {cnpjData.dados.endereco.numero}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Complemento:</span>
                <p>{cnpjData.dados.endereco.complemento || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Bairro:</span>
                <p>{cnpjData.dados.endereco.bairro}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Cidade/UF:</span>
                <p>{cnpjData.dados.endereco.municipio} - {cnpjData.dados.endereco.uf}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">CEP:</span>
                <p>{cnpjData.dados.endereco.cep}</p>
              </div>
            </div>
          </ExpandableSection>

          {/* Contato */}
          <ExpandableSection
            title="Contato"
            icon={Phone}
            isExpanded={expandedSections.contact}
            onToggle={() => toggleSection('contact')}
          >
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Telefones:</span>
                {cnpjData.dados.telefones?.length > 0 ? (
                  <div className="space-y-1">
                    {cnpjData.dados.telefones.map((telefone, index) => (
                      <p key={index}>{formatPhone(telefone)}</p>
                    ))}
                  </div>
                ) : (
                  <p>Não informado</p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p>{cnpjData.dados.email || 'Não informado'}</p>
              </div>
            </div>
          </ExpandableSection>

          {/* Dados Financeiros */}
          <ExpandableSection
            title="Dados Financeiros e Atividades"
            icon={DollarSign}
            isExpanded={expandedSections.financial}
            onToggle={() => toggleSection('financial')}
          >
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Capital Social:</span>
                <p>{cnpjData.dados.capital_social}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">CNAE Principal:</span>
                <p className="break-words">{cnpjData.dados.cnae_principal}</p>
              </div>
              {cnpjData.dados.cnaes_secundarios?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">CNAEs Secundários:</span>
                  <div className="space-y-1 mt-1">
                    {cnpjData.dados.cnaes_secundarios.map((cnae, index) => (
                      <p key={index} className="text-sm break-words">{cnae}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ExpandableSection>

          {/* Sócios */}
          {cnpjData.socios?.length > 0 && (
            <ExpandableSection
              title="Sócios e Administradores"
              icon={Users}
              isExpanded={expandedSections.partners}
              onToggle={() => toggleSection('partners')}
            >
              <div className="space-y-4">
                {cnpjData.socios.map((socio, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Nome:</span>
                        <p className="font-semibold break-words">{socio.nome_socio}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Qualificação:</span>
                        <p>{socio.qualificacao}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Documento:</span>
                        <p className="font-mono">{socio.documento_socio}</p>
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