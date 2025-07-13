import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AmazonAdsRow, ValidationError, ChangeHistory, FileStats } from './types';
import { AmazonAdsValidator, formatCurrency, formatPercentage } from './validation';

export class AmazonAdsExporter {
  
  static async exportToExcel(
    data: AmazonAdsRow[], 
    changes: ChangeHistory[], 
    validationErrors: ValidationError[],
    originalFileName: string = 'amazon-ads-export'
  ): Promise<void> {
    
    const workbook = XLSX.utils.book_new();
    
    // Aba 1: Dados principais (formato Amazon original)
    this.addMainDataSheet(workbook, data);
    
    // Aba 2: Resumo executivo
    this.addExecutiveSummarySheet(workbook, data, changes, validationErrors);
    
    // Aba 3: Histórico de alterações
    this.addChangesHistorySheet(workbook, changes);
    
    // Aba 4: Relatório de validação
    this.addValidationReportSheet(workbook, validationErrors);
    
    // Gerar arquivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const fileName = `${originalFileName}_editado_${timestamp}.xlsx`;
    
    saveAs(file, fileName);
  }

  private static addMainDataSheet(workbook: XLSX.WorkBook, data: AmazonAdsRow[]): void {
    // Preparar dados removendo metadados internos
    const exportData = data.map(row => {
      const cleanRow = { ...row };
      delete cleanRow._id;
      delete cleanRow._originalIndex;
      delete cleanRow._hasChanges;
      delete cleanRow._validationErrors;
      return cleanRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Aplicar formatação
    this.applyAmazonFormatting(worksheet, exportData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sponsored Products Campaigns');
  }

  private static addExecutiveSummarySheet(
    workbook: XLSX.WorkBook, 
    data: AmazonAdsRow[], 
    changes: ChangeHistory[], 
    validationErrors: ValidationError[]
  ): void {
    
    const stats = this.calculateStats(data);
    const validationStats = AmazonAdsValidator.getValidationStats(validationErrors);
    
    const summaryData = [
      ['📊 RESUMO EXECUTIVO', ''],
      ['Data/Hora da Edição', new Date().toLocaleString('pt-BR')],
      ['', ''],
      
      ['📈 ESTATÍSTICAS GERAIS', ''],
      ['Total de Linhas', stats.totalRows],
      ['Total de Campanhas', stats.totalCampaigns],
      ['Total de Grupos de Anúncios', stats.totalAdGroups],
      ['Total de Keywords', stats.totalKeywords],
      ['Total de Keywords Negativas', stats.totalNegativeKeywords],
      ['', ''],
      
      ['✏️ ALTERAÇÕES REALIZADAS', ''],
      ['Total de Alterações', changes.length],
      ['Linhas Modificadas', new Set(changes.map(c => c.rowIndex)).size],
      ['', ''],
      
      ['🔍 STATUS DE VALIDAÇÃO', ''],
      ['Erros Críticos', validationStats.critical],
      ['Erros', validationStats.errors],
      ['Avisos', validationStats.warnings],
      ['Sugestões', validationStats.suggestions],
      ['Status de Export', validationStats.critical > 0 ? '❌ Bloqueado' : '✅ Liberado'],
      ['', ''],
      
      ['💰 RESUMO FINANCEIRO', ''],
      ['Gastos Total', formatCurrency(stats.totalSpend)],
      ['Vendas Total', formatCurrency(stats.totalSales)],
      ['Orçamento Diário Total', formatCurrency(stats.totalDailyBudget)],
      ['ACoS Médio', formatPercentage(stats.averageAcos)],
      ['ROAS Médio', stats.averageRoas.toFixed(2)],
      ['', ''],
      
      ['📊 PERFORMANCE GERAL', ''],
      ['Total de Impressões', stats.totalImpressions.toLocaleString('pt-BR')],
      ['Total de Cliques', stats.totalClicks.toLocaleString('pt-BR')],
      ['CTR Médio', formatPercentage(stats.averageCtr)],
      ['CPC Médio', formatCurrency(stats.averageCpc)],
      ['Taxa de Conversão Média', formatPercentage(stats.averageConversionRate)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Aplicar formatação ao resumo
    this.applySummaryFormatting(worksheet);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo Executivo');
  }

  private static addChangesHistorySheet(workbook: XLSX.WorkBook, changes: ChangeHistory[]): void {
    const historyData = changes.map(change => ({
      'Data/Hora': change.timestamp.toLocaleString('pt-BR'),
      'Linha': change.rowIndex + 1,
      'Campo': change.field,
      'Valor Anterior': this.formatValue(change.oldValue),
      'Valor Novo': this.formatValue(change.newValue),
      'Motivo': change.reason || 'Não informado'
    }));

    const worksheet = XLSX.utils.json_to_sheet(historyData);
    
    // Auto-width para colunas
    const colWidths = [
      { wch: 20 }, // Data/Hora
      { wch: 8 },  // Linha
      { wch: 25 }, // Campo
      { wch: 20 }, // Valor Anterior
      { wch: 20 }, // Valor Novo
      { wch: 40 }  // Motivo
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Alterações');
  }

  private static addValidationReportSheet(workbook: XLSX.WorkBook, validationErrors: ValidationError[]): void {
    const reportData = validationErrors.map(error => ({
      'Tipo': this.getValidationTypeEmoji(error.type),
      'Campo': error.field,
      'Severidade': error.severity,
      'Categoria': error.category,
      'Mensagem': error.message
    }));

    // Adicionar cabeçalho com estatísticas
    const stats = AmazonAdsValidator.getValidationStats(validationErrors);
    const headerData = [
      ['🔍 RELATÓRIO DE VALIDAÇÃO', '', '', '', ''],
      [`Críticos: ${stats.critical} | Erros: ${stats.errors} | Avisos: ${stats.warnings} | Sugestões: ${stats.suggestions}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Tipo', 'Campo', 'Severidade', 'Categoria', 'Mensagem']
    ];

    // Combinar cabeçalho com dados
    const worksheet = XLSX.utils.aoa_to_sheet(headerData);
    XLSX.utils.sheet_add_json(worksheet, reportData, { origin: 'A5', skipHeader: true });

    // Aplicar formatação
    const colWidths = [
      { wch: 10 }, // Tipo
      { wch: 25 }, // Campo
      { wch: 12 }, // Severidade
      { wch: 25 }, // Categoria
      { wch: 60 }  // Mensagem
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Validação');
  }

  private static applyAmazonFormatting(worksheet: XLSX.WorkSheet, data: AmazonAdsRow[]): void {
    // Aplicar formatação de moeda para campos monetários
    const currencyFields = ['Lance', 'Orçamento diário', 'Gastos', 'Vendas', 'CPC'];
    const percentageFields = ['Porcentagem', 'Taxa de cliques', 'Taxa de conversão', 'ACOS'];
    
    // Auto-width para todas as colunas
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    // Aplicar formatação específica seria feita aqui com mais detalhes
    // Para simplicidade, deixamos o Excel aplicar formatação automática
  }

  private static applySummaryFormatting(worksheet: XLSX.WorkSheet): void {
    const colWidths = [
      { wch: 30 }, // Descrição
      { wch: 20 }  // Valor
    ];
    worksheet['!cols'] = colWidths;
  }

  private static calculateStats(data: AmazonAdsRow[]) {
    const campaigns = new Set();
    const adGroups = new Set();
    let keywords = 0;
    let negativeKeywords = 0;
    let totalSpend = 0;
    let totalSales = 0;
    let totalDailyBudget = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    let acosSum = 0;
    let roasSum = 0;
    let ctrSum = 0;
    let cpcSum = 0;
    let conversionRateSum = 0;
    let validAcos = 0;
    let validRoas = 0;
    let validCtr = 0;
    let validCpc = 0;
    let validConversionRate = 0;

    data.forEach(row => {
      campaigns.add(row['Nome da campanha']);
      if (row['Nome do grupo de anúncios']) {
        adGroups.add(`${row['Nome da campanha']}-${row['Nome do grupo de anúncios']}`);
      }
      
      if (row.Entidade === 'Palavra-chave') keywords++;
      if (row.Entidade === 'Palavra-chave negativa') negativeKeywords++;
      
      totalSpend += row.Gastos || 0;
      totalSales += row.Vendas || 0;
      totalDailyBudget += row['Orçamento diário'] || 0;
      totalImpressions += row.Impressões || 0;
      totalClicks += row.Cliques || 0;
      totalOrders += row.Pedidos || 0;
      
      if (row.ACOS && row.ACOS > 0) {
        acosSum += row.ACOS;
        validAcos++;
      }
      if (row.ROAS && row.ROAS > 0) {
        roasSum += row.ROAS;
        validRoas++;
      }
      if (row['Taxa de cliques'] && row['Taxa de cliques'] > 0) {
        ctrSum += row['Taxa de cliques'];
        validCtr++;
      }
      if (row.CPC && row.CPC > 0) {
        cpcSum += row.CPC;
        validCpc++;
      }
      if (row['Taxa de conversão'] && row['Taxa de conversão'] > 0) {
        conversionRateSum += row['Taxa de conversão'];
        validConversionRate++;
      }
    });

    return {
      totalRows: data.length,
      totalCampaigns: campaigns.size,
      totalAdGroups: adGroups.size,
      totalKeywords: keywords,
      totalNegativeKeywords: negativeKeywords,
      totalSpend,
      totalSales,
      totalDailyBudget,
      totalImpressions,
      totalClicks,
      totalOrders,
      averageAcos: validAcos > 0 ? acosSum / validAcos : 0,
      averageRoas: validRoas > 0 ? roasSum / validRoas : 0,
      averageCtr: validCtr > 0 ? ctrSum / validCtr : 0,
      averageCpc: validCpc > 0 ? cpcSum / validCpc : 0,
      averageConversionRate: validConversionRate > 0 ? conversionRateSum / validConversionRate : 0
    };
  }

  private static formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }
    return String(value);
  }

  private static getValidationTypeEmoji(type: string): string {
    switch (type) {
      case 'critical': return '🔴 Crítico';
      case 'error': return '🟠 Erro';
      case 'warning': return '🟡 Aviso';
      case 'suggestion': return '🔵 Sugestão';
      default: return '⚪ Outros';
    }
  }
}

export function generateFileStats(data: AmazonAdsRow[], fileSize: number): FileStats {
  const campaigns = new Set(data.map(row => row['Nome da campanha']));
  const adGroups = new Set(data.map(row => 
    row['Nome do grupo de anúncios'] ? 
    `${row['Nome da campanha']}-${row['Nome do grupo de anúncios']}` : 
    null
  ).filter(Boolean));
  
  const keywords = data.filter(row => row.Entidade === 'Palavra-chave').length;
  const negativeKeywords = data.filter(row => row.Entidade === 'Palavra-chave negativa').length;

  return {
    totalRows: data.length,
    totalCampaigns: campaigns.size,
    totalAdGroups: adGroups.size,
    totalKeywords: keywords,
    totalNegativeKeywords: negativeKeywords,
    fileSize: formatFileSize(fileSize)
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}