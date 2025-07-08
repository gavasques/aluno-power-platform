import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Download, RotateCcw } from 'lucide-react';

// Interfaces
interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  duracaoGiro: number;
  unidadeTempo: 'dias' | 'semanas' | 'meses';
  numeroGiros: number;
}

interface GiroCalculado {
  numero: number;
  investimento: number;
  retorno: number;
  aporte: number;
  retirada: number;
  saldo: number;
  roiGiro: number;
  tempoDecorrido: number;
}

// Funções de formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const formatPercent = (value: number): string => {
  return `${(value || 0).toFixed(2)}%`;
};

// Componente de input de moeda brasileira para valores inteiros
const CurrencyInput = ({ value, onChange, className = "", placeholder = "R$ 0" }: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      // Formatar como moeda brasileira sem decimais
      setDisplayValue(value.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove tudo exceto números
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    
    // Se estiver vazio, zera o valor
    if (numbersOnly === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }
    
    // Converte para número inteiro
    const numericValue = parseInt(numbersOnly) || 0;
    onChange(numericValue);
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default function InvestimentosROI() {
  const { toast } = useToast();
  
  // Estado da configuração
  const [config, setConfig] = useState<ConfiguracaoSimulacao>({
    investimentoInicial: 10000,
    duracaoGiro: 45,
    unidadeTempo: 'dias',
    numeroGiros: 12
  });

  // Estado para aportes, retiradas e ROIs editáveis
  const [aportes, setAportes] = useState<number[]>(Array(12).fill(0));
  const [retiradas, setRetiradas] = useState<number[]>(Array(12).fill(0));
  const [rois, setRois] = useState<number[]>(Array(12).fill(20)); // 20% por padrão

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('investimentos-roi-config', JSON.stringify(config));
    localStorage.setItem('investimentos-roi-aportes', JSON.stringify(aportes));
    localStorage.setItem('investimentos-roi-retiradas', JSON.stringify(retiradas));
    localStorage.setItem('investimentos-roi-rois', JSON.stringify(rois));
  }, [config, aportes, retiradas, rois]);

  // Carregar do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('investimentos-roi-config');
    const savedAportes = localStorage.getItem('investimentos-roi-aportes');
    const savedRetiradas = localStorage.getItem('investimentos-roi-retiradas');
    const savedRois = localStorage.getItem('investimentos-roi-rois');
    
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.warn('Erro ao carregar configuração salva:', error);
      }
    }
    
    if (savedAportes) {
      try {
        setAportes(JSON.parse(savedAportes));
      } catch (error) {
        console.warn('Erro ao carregar aportes salvos:', error);
      }
    }
    
    if (savedRetiradas) {
      try {
        setRetiradas(JSON.parse(savedRetiradas));
      } catch (error) {
        console.warn('Erro ao carregar retiradas salvas:', error);
      }
    }
    
    if (savedRois) {
      try {
        setRois(JSON.parse(savedRois));
      } catch (error) {
        console.warn('Erro ao carregar ROIs salvos:', error);
      }
    }
  }, []);

  // Ajustar arrays quando número de giros mudar
  useEffect(() => {
    if (aportes.length !== config.numeroGiros) {
      setAportes(prev => {
        const newAportes = [...prev];
        while (newAportes.length < config.numeroGiros) {
          newAportes.push(0);
        }
        return newAportes.slice(0, config.numeroGiros);
      });
    }
    
    if (retiradas.length !== config.numeroGiros) {
      setRetiradas(prev => {
        const newRetiradas = [...prev];
        while (newRetiradas.length < config.numeroGiros) {
          newRetiradas.push(0);
        }
        return newRetiradas.slice(0, config.numeroGiros);
      });
    }
    
    if (rois.length !== config.numeroGiros) {
      setRois(prev => {
        const newRois = [...prev];
        while (newRois.length < config.numeroGiros) {
          newRois.push(20); // 20% por padrão
        }
        return newRois.slice(0, config.numeroGiros);
      });
    }
  }, [config.numeroGiros, aportes.length, retiradas.length, rois.length]);

  // Calcular giros com base na configuração
  const giros = useMemo(() => {
    const girosCalculados: GiroCalculado[] = [];
    let investimentoAtual = config.investimentoInicial;
    
    for (let i = 1; i <= config.numeroGiros; i++) {
      const roiGiro = rois[i - 1] || 20;
      const retorno = investimentoAtual * (roiGiro / 100);
      const aporte = aportes[i - 1] || 0;
      const retirada = retiradas[i - 1] || 0;
      
      const saldo = investimentoAtual + retorno + aporte - retirada;
      const tempoDecorrido = i * config.duracaoGiro;
      
      girosCalculados.push({
        numero: i,
        investimento: investimentoAtual,
        retorno,
        aporte,
        retirada,
        saldo,
        roiGiro,
        tempoDecorrido
      });
      
      investimentoAtual = saldo;
    }
    
    return girosCalculados;
  }, [config, aportes, retiradas, rois]);

  // Atualizar configuração
  const updateConfig = (key: keyof ConfiguracaoSimulacao, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Atualizar aporte
  const updateAporte = (index: number, value: number) => {
    setAportes(prev => {
      const newAportes = [...prev];
      newAportes[index] = value;
      return newAportes;
    });
  };

  // Atualizar retirada
  const updateRetirada = (index: number, value: number) => {
    setRetiradas(prev => {
      const newRetiradas = [...prev];
      newRetiradas[index] = value;
      return newRetiradas;
    });
  };

  // Atualizar ROI
  const updateRoi = (index: number, value: number) => {
    setRois(prev => {
      const newRois = [...prev];
      newRois[index] = value;
      return newRois;
    });
  };

  // Resetar configuração
  const resetConfig = () => {
    setConfig({
      investimentoInicial: 10000,
      duracaoGiro: 45,
      unidadeTempo: 'dias',
      numeroGiros: 12
    });
    setAportes(Array(12).fill(0));
    setRetiradas(Array(12).fill(0));
    setRois(Array(12).fill(20));
    toast({
      title: "Configuração resetada",
      description: "Todos os valores foram restaurados para o padrão"
    });
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = [
      'Giro',
      'Investimento',
      'Retorno',
      'Aporte',
      'Retirada',
      'Saldo',
      'ROI do Giro (%)',
      'Tempo (' + config.unidadeTempo + ')'
    ];
    
    const rows = giros.map(giro => [
      giro.numero,
      giro.investimento.toFixed(2),
      giro.retorno.toFixed(2),
      giro.aporte.toFixed(2),
      giro.retirada.toFixed(2),
      giro.saldo.toFixed(2),
      giro.roiGiro.toFixed(2),
      giro.tempoDecorrido
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulacao-investimentos-roi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação CSV concluída",
      description: "Arquivo CSV baixado com sucesso"
    });
  };

  // Exportar para PDF
  const exportarPDF = async () => {
    try {
      // Dinamicamente importar jsPDF
      const { jsPDF } = await import('jspdf');
      require('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Configurações do documento
      doc.setFont('helvetica');
      
      // Título
      doc.setFontSize(16);
      doc.text('Simulador de Investimentos e ROI', 105, 20, { align: 'center' });
      
      // Configurações
      doc.setFontSize(10);
      doc.text(`Investimento Inicial: ${formatCurrency(config.investimentoInicial)}`, 14, 35);
      doc.text(`Duração do Giro: ${config.duracaoGiro} ${config.unidadeTempo}`, 14, 42);
      doc.text(`Número de Giros: ${config.numeroGiros}`, 14, 49);
      
      // Tabela
      const tableData = giros.map(giro => [
        giro.numero.toString(),
        formatCurrency(giro.investimento),
        formatCurrency(giro.retorno),
        formatCurrency(giro.aporte),
        formatCurrency(giro.retirada),
        formatCurrency(giro.saldo),
        formatPercent(giro.roiGiro),
        `${giro.tempoDecorrido}`
      ]);
      
      (doc as any).autoTable({
        head: [['Giro', 'Investimento', 'Retorno', 'Aporte', 'Retirada', 'Saldo', 'ROI', 'Tempo']],
        body: tableData,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Resumo
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Resumo:', 14, finalY);
      
      doc.setFontSize(10);
      const totalAportes = aportes.reduce((sum, aporte) => sum + aporte, 0);
      const totalRetiradas = retiradas.reduce((sum, retirada) => sum + retirada, 0);
      const capitalFinal = giros[giros.length - 1]?.saldo || 0;
      
      doc.text(`Capital Final: ${formatCurrency(capitalFinal)}`, 14, finalY + 8);
      doc.text(`Total Aportes: ${formatCurrency(totalAportes)}`, 14, finalY + 15);
      doc.text(`Total Retiradas: ${formatCurrency(totalRetiradas)}`, 14, finalY + 22);
      doc.text(`Tempo Total: ${config.numeroGiros * config.duracaoGiro} ${config.unidadeTempo}`, 14, finalY + 29);
      
      // Salvar
      doc.save('simulacao-investimentos-roi.pdf');
      
      toast({
        title: "Exportação PDF concluída",
        description: "Arquivo PDF baixado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          Simulador de Investimentos e ROI
        </h1>
        <p className="text-muted-foreground">
          Calcule o crescimento de capital através de giros de investimento e visualize o tempo para atingir suas metas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configuração
              </CardTitle>
              <CardDescription>
                Defina os parâmetros da simulação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Investimento Inicial */}
              <div>
                <Label htmlFor="investimentoInicial">Investimento Inicial</Label>
                <Input
                  id="investimentoInicial"
                  type="number"
                  value={config.investimentoInicial}
                  onChange={(e) => updateConfig('investimentoInicial', Number(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>



              {/* Duração do Giro */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="duracaoGiro">Duração do Giro</Label>
                  <Input
                    id="duracaoGiro"
                    type="number"
                    value={config.duracaoGiro}
                    onChange={(e) => updateConfig('duracaoGiro', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="unidadeTempo">Unidade</Label>
                  <Select value={config.unidadeTempo} onValueChange={(value) => updateConfig('unidadeTempo', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dias">Dias</SelectItem>
                      <SelectItem value="semanas">Semanas</SelectItem>
                      <SelectItem value="meses">Meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Número de Giros */}
              <div>
                <Label htmlFor="numeroGiros">Número de Giros</Label>
                <Input
                  id="numeroGiros"
                  type="number"
                  value={config.numeroGiros}
                  onChange={(e) => updateConfig('numeroGiros', Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={resetConfig} variant="outline" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
                <div className="flex gap-2">
                  <Button onClick={exportarCSV} variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={exportarPDF} variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Giro</CardTitle>
              <CardDescription>
                Análise detalhada de cada giro da simulação - campos editáveis: Aporte, Retirada e ROI %
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-center p-3 w-16 bg-gray-50 font-semibold">Giro</th>
                      <th className="text-center p-3 w-32 bg-gray-50 font-semibold">Investimento</th>
                      <th className="text-center p-3 w-32 bg-gray-50 font-semibold">Retorno</th>
                      <th className="text-center p-3 w-32 bg-gray-50 font-semibold">Aporte</th>
                      <th className="text-center p-3 w-32 bg-gray-50 font-semibold">Retirada</th>
                      <th className="text-center p-3 w-32 bg-gray-50 font-semibold">Saldo</th>
                      <th className="text-center p-3 w-20 bg-gray-50 font-semibold">ROI %</th>
                      <th className="text-center p-3 w-20 bg-gray-50 font-semibold">Tempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giros.map((giro, index) => (
                      <tr key={giro.numero} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-center font-medium">{giro.numero}</td>
                        <td className="p-3 text-center">{formatCurrency(giro.investimento)}</td>
                        <td className="p-3 text-center text-green-600 font-medium">{formatCurrency(giro.retorno)}</td>
                        <td className="p-3">
                          <CurrencyInput
                            value={giro.aporte}
                            onChange={(value) => updateAporte(index, value)}
                            className="w-full h-8 text-center text-xs"
                            placeholder="R$ 0"
                          />
                        </td>
                        <td className="p-3">
                          <CurrencyInput
                            value={giro.retirada}
                            onChange={(value) => updateRetirada(index, value)}
                            className="w-full h-8 text-center text-xs"
                            placeholder="R$ 0"
                          />
                        </td>
                        <td className="p-3 text-center font-semibold text-blue-600">{formatCurrency(giro.saldo)}</td>
                        <td className="p-3">
                          <Input
                            type="text"
                            value={giro.roiGiro.toString()}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d,\.]/g, '');
                              const numericValue = parseFloat(value.replace(',', '.')) || 0;
                              updateRoi(index, numericValue);
                            }}
                            className="w-full h-8 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="20"
                          />
                        </td>
                        <td className="p-3 text-center">{giro.tempoDecorrido}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Resumo na parte inferior */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Capital Final</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(giros[giros.length - 1]?.saldo || 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Aportes</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(aportes.reduce((sum, aporte) => sum + aporte, 0))}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Retiradas</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(retiradas.reduce((sum, retirada) => sum + retirada, 0))}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Tempo Total</p>
                  <p className="text-lg font-bold text-purple-600">
                    {config.numeroGiros * config.duracaoGiro} {config.unidadeTempo}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}