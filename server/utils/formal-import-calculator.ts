// Utilitários otimizados para cálculos de importação formal

export interface Tax {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

export interface Expense {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

export interface Product {
  id?: string;
  nome: string;
  ncm: string;
  quantidade: number;
  valorUnitarioUsd: number;
  comprimento: number;
  largura: number;
  altura: number;
  cbmUnitario?: number;
  cbmTotal?: number;
  percentualContainer?: number;
  valorTotalUSD?: number;
  valorTotalBRL?: number;
  freteRateio?: number;
  despesasRateio?: number;
  impostos?: {
    ii: number;
    ipi: number;
    pis: number;
    cofins: number;
    icms: number;
  };
  custoTotal?: number;
  custoUnitario?: number;
}

export interface FormalImportSimulation {
  id?: number;
  nome: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  impostos: Tax[];
  despesasAdicionais: Expense[];
  produtos: Product[];
  resultados: {
    valorFobReal?: number;
    valorFreteReal?: number;
    valorCfrDolar?: number;
    valorCfrReal?: number;
    valorSeguro?: number;
    totalImpostos?: number;
    totalDespesas?: number;
    custoTotal?: number;
    cbmTotal?: number;
  };
  codigoSimulacao?: string;
  dataCriacao?: string;
  dataModificacao?: string;
}

// Funções de cálculo otimizadas
export const calcularCBM = (comprimento: number, largura: number, altura: number): number => {
  if (comprimento <= 0 || largura <= 0 || altura <= 0) return 0;
  return (comprimento * largura * altura) / 1000000; // Converter cm³ para m³
};

export const converterDolarParaReal = (valorDolar: number, taxaDolar: number): number => {
  return valorDolar * taxaDolar;
};

export const calcularCFR = (valorFOB: number, valorFrete: number): number => {
  return valorFOB + valorFrete;
};

export const calcularSeguro = (valorCFR: number, percentualSeguro: number): number => {
  return valorCFR * (percentualSeguro / 100);
};

// Funções de cálculo de impostos otimizadas
export const calcularBaseII = (valorFOBReal: number): number => {
  return valorFOBReal;
};

export const calcularBaseIPI = (valorFOBReal: number, valorFreteReal: number, valorII: number): number => {
  return valorFOBReal + valorFreteReal + valorII;
};

export const calcularBaseTotalImpostos = (valorFOBReal: number, valorFreteReal: number, valorII: number, valorIPI: number): number => {
  return valorFOBReal + valorFreteReal + valorII + valorIPI;
};

export const calcularImposto = (baseCalculo: number, aliquota: number): number => {
  return baseCalculo * (aliquota / 100);
};

// Função principal de cálculo otimizada
export const calcularSimulacaoCompleta = (simulacao: FormalImportSimulation): FormalImportSimulation => {
  try {
    // Valores base convertidos
    const valorFOBReal = converterDolarParaReal(simulacao.valorFobDolar, simulacao.taxaDolar);
    const valorFreteReal = converterDolarParaReal(simulacao.valorFreteDolar, simulacao.taxaDolar);
    const valorCFRDolar = calcularCFR(simulacao.valorFobDolar, simulacao.valorFreteDolar);
    const valorCFRReal = converterDolarParaReal(valorCFRDolar, simulacao.taxaDolar);
    const valorSeguro = calcularSeguro(valorCFRDolar, simulacao.percentualSeguro);

    // Cálculo de impostos seguindo a sequência correta
    const baseII = calcularBaseII(valorFOBReal);
    const aliquotaII = (simulacao.impostos.find((i: any) => i.nome.includes("II"))?.aliquota || 14.4) / 100;
    const valorII = calcularImposto(baseII, aliquotaII);
    
    const baseIPI = calcularBaseIPI(valorFOBReal, valorFreteReal, valorII);
    const aliquotaIPI = (simulacao.impostos.find((i: any) => i.nome.includes("IPI"))?.aliquota || 3.25) / 100;
    const valorIPI = calcularImposto(baseIPI, aliquotaIPI);
    
    const baseTotalImpostos = calcularBaseTotalImpostos(valorFOBReal, valorFreteReal, valorII, valorIPI);
    
    // Calcular outros impostos
    const aliquotaPIS = (simulacao.impostos.find((i: any) => i.nome.includes("PIS"))?.aliquota || 2.1) / 100;
    const aliquotaCOFINS = (simulacao.impostos.find((i: any) => i.nome.includes("COFINS"))?.aliquota || 9.65) / 100;
    const aliquotaICMS = (simulacao.impostos.find((i: any) => i.nome.includes("ICMS"))?.aliquota || 12) / 100;
    
    const valorPIS = calcularImposto(baseTotalImpostos, aliquotaPIS);
    const valorCOFINS = calcularImposto(baseTotalImpostos, aliquotaCOFINS);
    const valorICMS = calcularImposto(baseTotalImpostos, aliquotaICMS);
    
    const totalImpostos = valorII + valorIPI + valorPIS + valorCOFINS + valorICMS;

    // Calcular total de despesas adicionais
    let totalDespesas = 0;
    simulacao.despesasAdicionais.forEach((despesa: any) => {
      if (despesa.valorDolar > 0) {
        despesa.valorReal = converterDolarParaReal(despesa.valorDolar, simulacao.taxaDolar);
      }
      totalDespesas += despesa.valorReal;
    });

    // Calcular CBM total e percentuais do container
    let cbmTotal = 0;
    simulacao.produtos.forEach((produto: any) => {
      produto.cbmUnitario = calcularCBM(produto.comprimento, produto.largura, produto.altura);
      produto.cbmTotal = produto.cbmUnitario * produto.quantidade;
      cbmTotal += produto.cbmTotal;
    });

    // Calcular percentuais do container e rateios
    simulacao.produtos.forEach((produto: any) => {
      produto.percentualContainer = cbmTotal > 0 ? produto.cbmTotal / cbmTotal : 0;
      
      // Valores do produto
      produto.valorTotalUSD = produto.valorUnitarioUsd * produto.quantidade;
      produto.valorTotalBRL = converterDolarParaReal(produto.valorTotalUSD, simulacao.taxaDolar);
      
      // Rateios por CBM
      produto.freteRateio = valorFreteReal * produto.percentualContainer;
      produto.despesasRateio = totalDespesas * produto.percentualContainer;
      
      // Impostos rateados
      produto.impostos = {
        ii: valorII * produto.percentualContainer,
        ipi: valorIPI * produto.percentualContainer,
        pis: valorPIS * produto.percentualContainer,
        cofins: valorCOFINS * produto.percentualContainer,
        icms: valorICMS * produto.percentualContainer
      };
      
      const totalImpostosProduto = produto.impostos.ii + produto.impostos.ipi + 
                                  produto.impostos.pis + produto.impostos.cofins + produto.impostos.icms;
      
      produto.custoTotal = produto.valorTotalBRL + produto.freteRateio + produto.despesasRateio + totalImpostosProduto;
      produto.custoUnitario = produto.quantidade > 0 ? produto.custoTotal / produto.quantidade : 0;
    });

    // Atualizar objeto de resultados
    simulacao.resultados = {
      valorFobReal: valorFOBReal,
      valorFreteReal,
      valorCfrDolar: valorCFRDolar,
      valorCfrReal: valorCFRReal,
      valorSeguro,
      totalImpostos,
      totalDespesas,
      custoTotal: valorFOBReal + valorFreteReal + valorSeguro + totalImpostos + totalDespesas,
      cbmTotal
    };

    return simulacao;
  } catch (error) {
    console.error('Erro no cálculo da simulação:', error);
    throw new Error('Erro no cálculo da simulação');
  }
};

// Função de validação otimizada
export const validarSimulacao = (simulacao: FormalImportSimulation): string[] => {
  const errors: string[] = [];
  
  if (!simulacao.nome?.trim()) {
    errors.push('Nome da simulação é obrigatório');
  }
  
  if (simulacao.taxaDolar <= 0) {
    errors.push('Taxa do dólar deve ser maior que zero');
  }
  
  if (simulacao.valorFobDolar < 0) {
    errors.push('Valor FOB não pode ser negativo');
  }
  
  if (simulacao.valorFreteDolar < 0) {
    errors.push('Valor do frete não pode ser negativo');
  }
  
  if (simulacao.percentualSeguro < 0) {
    errors.push('Percentual do seguro não pode ser negativo');
  }
  
  if (!simulacao.produtos?.length) {
    errors.push('Adicione pelo menos um produto');
  }
  
  // Validar produtos
  simulacao.produtos?.forEach((produto, index) => {
    if (!produto.nome?.trim()) {
      errors.push(`Produto ${index + 1}: Nome é obrigatório`);
    }
    
    if (produto.quantidade <= 0) {
      errors.push(`Produto ${index + 1}: Quantidade deve ser maior que zero`);
    }
    
    if (produto.valorUnitarioUsd < 0) {
      errors.push(`Produto ${index + 1}: Valor unitário não pode ser negativo`);
    }
    
    if (produto.comprimento <= 0 || produto.largura <= 0 || produto.altura <= 0) {
      errors.push(`Produto ${index + 1}: Dimensões devem ser maiores que zero`);
    }
  });
  
  return errors;
}; 