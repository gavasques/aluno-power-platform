/**
 * Excel Import/Export Service
 * Comprehensive XLSX handling for products and sales channels
 * 
 * FEATURES:
 * - Smart duplicate detection
 * - User confirmation for updates
 * - Template generation
 * - Full data export
 * - Progress tracking
 * - Error handling and validation
 */

import XLSX from 'xlsx';
import { storage } from '../storage';
import { Product, InsertProduct } from '../../shared/schema';

export interface ImportResult {
  newProducts: number;
  updatedProducts: number;
  errors: ImportError[];
  conflicts: ImportConflict[];
  totalProcessed: number;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ImportConflict {
  row: number;
  existingProduct: Product;
  newData: Partial<InsertProduct>;
  conflictType: 'sku' | 'name' | 'supplierCode';
}

export interface ChannelConfiguration {
  productId: number;
  channelName: string;
  isActive: boolean;
  price: number;
  stock: number;
  title: string;
  description: string;
  categories: string[];
  keywords: string[];
  configuration: Record<string, any>;
}

export interface ExcelTemplate {
  type: 'products' | 'channels';
  headers: string[];
  sampleData: any[];
  validationRules: Record<string, any>;
}

export class ExcelImportExportService {
  private static instance: ExcelImportExportService;

  static getInstance(): ExcelImportExportService {
    if (!this.instance) {
      this.instance = new ExcelImportExportService();
    }
    return this.instance;
  }

  /**
   * Generate Excel template for products
   */
  generateProductTemplate(): ExcelTemplate {
    const headers = [
      'nome',
      'sku',
      'codigo_fornecedor',
      'codigo_interno',
      'ean',
      'marca',
      'categoria',
      'fornecedor_id',
      'ncm',
      'dimensoes_comprimento',
      'dimensoes_largura',
      'dimensoes_altura',
      'peso',
      'custo_item',
      'custo_embalagem',
      'percentual_imposto',
      'observacoes',
      'bullet_points',
      'descricao',
      'ativo'
    ];

    const sampleData = [
      {
        nome: 'Produto Exemplo 1',
        sku: 'SKU001',
        codigo_fornecedor: 'FORN001',
        codigo_interno: 'INT001',
        ean: '7891234567890',
        marca: 'Marca Exemplo',
        categoria: 'Eletrônicos',
        fornecedor_id: 1,
        ncm: '85176220',
        dimensoes_comprimento: 10,
        dimensoes_largura: 8,
        dimensoes_altura: 5,
        peso: 0.5,
        custo_item: 25.90,
        custo_embalagem: 2.50,
        percentual_imposto: 18,
        observacoes: 'Produto em promoção',
        bullet_points: 'Alta qualidade;Garantia 1 ano;Envio rápido',
        descricao: 'Descrição detalhada do produto exemplo',
        ativo: true
      },
      {
        nome: 'Produto Exemplo 2',
        sku: 'SKU002',
        codigo_fornecedor: 'FORN002',
        codigo_interno: 'INT002',
        ean: '7891234567891',
        marca: 'Outra Marca',
        categoria: 'Casa e Jardim',
        fornecedor_id: 2,
        ncm: '94032900',
        dimensoes_comprimento: 15,
        dimensoes_largura: 12,
        dimensoes_altura: 8,
        peso: 1.2,
        custo_item: 45.00,
        custo_embalagem: 5.00,
        percentual_imposto: 12,
        observacoes: 'Produto sazonal',
        bullet_points: 'Resistente;Fácil instalação;Design moderno',
        descricao: 'Descrição completa do segundo produto',
        ativo: true
      }
    ];

    const validationRules = {
      nome: { required: true, maxLength: 255 },
      sku: { required: true, unique: true, maxLength: 100 },
      custo_item: { type: 'number', min: 0 },
      peso: { type: 'number', min: 0 },
      ativo: { type: 'boolean' }
    };

    return {
      type: 'products',
      headers,
      sampleData,
      validationRules
    };
  }

  /**
   * Generate Excel template for sales channels
   */
  generateChannelsTemplate(): ExcelTemplate {
    const headers = [
      'produto_id',
      'produto_nome',
      'canal',
      'ativo',
      'preco',
      'estoque',
      'titulo',
      'descricao',
      'categorias',
      'palavras_chave',
      'amazon_asin',
      'amazon_categoria',
      'mercadolivre_id',
      'mercadolivre_categoria',
      'shopify_handle',
      'magento_sku'
    ];

    const sampleData = [
      {
        produto_id: 1,
        produto_nome: 'Produto Exemplo 1',
        canal: 'Amazon',
        ativo: true,
        preco: 39.90,
        estoque: 100,
        titulo: 'Produto Exemplo Premium - Alta Qualidade',
        descricao: 'Descrição otimizada para Amazon com palavras-chave',
        categorias: 'Eletrônicos > Acessórios',
        palavras_chave: 'produto,exemplo,qualidade,premium',
        amazon_asin: 'B08EXAMPLE',
        amazon_categoria: 'Electronics',
        mercadolivre_id: '',
        mercadolivre_categoria: '',
        shopify_handle: '',
        magento_sku: ''
      },
      {
        produto_id: 1,
        produto_nome: 'Produto Exemplo 1',
        canal: 'Mercado Livre',
        ativo: true,
        preco: 42.90,
        estoque: 80,
        titulo: 'Produto Exemplo - Melhor Preço',
        descricao: 'Descrição adaptada para Mercado Livre',
        categorias: 'Eletrônicos e Áudio > Acessórios',
        palavras_chave: 'produto,exemplo,barato,promoção',
        amazon_asin: '',
        amazon_categoria: '',
        mercadolivre_id: 'MLB123456789',
        mercadolivre_categoria: 'Eletrônicos',
        shopify_handle: '',
        magento_sku: ''
      }
    ];

    const validationRules = {
      produto_id: { required: true, type: 'number' },
      canal: { required: true, enum: ['Amazon', 'Mercado Livre', 'Shopify', 'Magento', 'Site Próprio'] },
      preco: { required: true, type: 'number', min: 0 },
      estoque: { type: 'number', min: 0 }
    };

    return {
      type: 'channels',
      headers,
      sampleData,
      validationRules
    };
  }

  /**
   * Export products to Excel
   */
  async exportProductsToExcel(userId: number, includeData: boolean = true): Promise<Buffer> {
    const template = this.generateProductTemplate();
    
    let data: any[] = [];
    
    if (includeData) {
      const products = await storage.getProducts();
      const userProducts = products.filter(p => p.userId === userId);
      
      data = userProducts.map(product => ({
        nome: product.name,
        sku: product.sku || '',
        codigo_fornecedor: product.supplierCode || '',
        codigo_interno: product.internalCode || '',
        ean: product.ean || '',
        marca: product.brand || '',
        categoria: product.category || '',
        fornecedor_id: product.supplierId || '',
        ncm: product.ncm || '',
        dimensoes_comprimento: product.dimensions?.length || '',
        dimensoes_largura: product.dimensions?.width || '',
        dimensoes_altura: product.dimensions?.height || '',
        peso: product.weight || '',
        custo_item: product.costItem || '',
        custo_embalagem: product.packCost || '',
        percentual_imposto: product.taxPercent || '',
        observacoes: product.observations || '',
        bullet_points: Array.isArray(product.bulletPoints) ? product.bulletPoints.join(';') : '',
        descricao: product.description || '',
        ativo: product.active
      }));
    } else {
      data = template.sampleData;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');

    // Add instructions sheet
    const instructions = [
      { Campo: 'nome', Obrigatório: 'Sim', Tipo: 'Texto', Descrição: 'Nome do produto (máx. 255 caracteres)' },
      { Campo: 'sku', Obrigatório: 'Sim', Tipo: 'Texto', Descrição: 'SKU único do produto (máx. 100 caracteres)' },
      { Campo: 'codigo_fornecedor', Obrigatório: 'Não', Tipo: 'Texto', Descrição: 'Código do produto no fornecedor' },
      { Campo: 'custo_item', Obrigatório: 'Não', Tipo: 'Número', Descrição: 'Custo do item (ex: 25.90)' },
      { Campo: 'ativo', Obrigatório: 'Não', Tipo: 'Verdadeiro/Falso', Descrição: 'Se o produto está ativo (true/false)' }
    ];
    
    const instructionsWs = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instruções');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export sales channels to Excel
   */
  async exportChannelsToExcel(userId: number, includeData: boolean = true): Promise<Buffer> {
    const template = this.generateChannelsTemplate();
    
    let data: any[] = [];
    
    if (includeData) {
      const products = await storage.getProducts();
      const userProducts = products.filter(p => p.userId === userId);
      
      // Generate channel data from products.channels field
      data = userProducts.flatMap(product => {
        if (!product.channels || !Array.isArray(product.channels)) {
          return [{
            produto_id: product.id,
            produto_nome: product.name,
            canal: 'Amazon',
            ativo: false,
            preco: '',
            estoque: '',
            titulo: '',
            descricao: '',
            categorias: '',
            palavras_chave: '',
            amazon_asin: '',
            amazon_categoria: '',
            mercadolivre_id: '',
            mercadolivre_categoria: '',
            shopify_handle: '',
            magento_sku: ''
          }];
        }
        
        return product.channels.map((channel: any) => ({
          produto_id: product.id,
          produto_nome: product.name,
          canal: channel.name || '',
          ativo: channel.active || false,
          preco: channel.price || '',
          estoque: channel.stock || '',
          titulo: channel.title || '',
          descricao: channel.description || '',
          categorias: channel.categories ? channel.categories.join(' > ') : '',
          palavras_chave: channel.keywords ? channel.keywords.join(',') : '',
          amazon_asin: channel.amazon?.asin || '',
          amazon_categoria: channel.amazon?.category || '',
          mercadolivre_id: channel.mercadolivre?.id || '',
          mercadolivre_categoria: channel.mercadolivre?.category || '',
          shopify_handle: channel.shopify?.handle || '',
          magento_sku: channel.magento?.sku || ''
        }));
      });
    } else {
      data = template.sampleData;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Canais de Venda');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Process product import from Excel
   */
  async processProductImport(
    fileBuffer: Buffer, 
    userId: number,
    autoUpdate: boolean = false
  ): Promise<ImportResult> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    const result: ImportResult = {
      newProducts: 0,
      updatedProducts: 0,
      errors: [],
      conflicts: [],
      totalProcessed: 0
    };

    const existingProducts = await storage.getProducts();
    const userProducts = existingProducts.filter(p => p.userId === userId);

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any;
      const rowNumber = i + 2; // Excel row number (header is row 1)
      
      try {
        // Validate required fields
        if (!row.nome || !row.sku) {
          result.errors.push({
            row: rowNumber,
            field: 'nome/sku',
            message: 'Nome e SKU são obrigatórios',
            value: { nome: row.nome, sku: row.sku }
          });
          continue;
        }

        // Check for conflicts
        const existingBySku = userProducts.find(p => p.sku === row.sku);
        const existingByName = userProducts.find(p => p.name === row.nome);
        
        if (existingBySku || existingByName) {
          const conflictType = existingBySku ? 'sku' : 'name';
          const existingProduct = existingBySku || existingByName!;
          
          if (!autoUpdate) {
            result.conflicts.push({
              row: rowNumber,
              existingProduct,
              newData: this.mapRowToProduct(row, userId),
              conflictType
            });
            continue;
          }
        }

        // Process the product
        const productData = this.mapRowToProduct(row, userId);
        
        if (existingBySku) {
          await storage.updateProduct(existingBySku.id, productData);
          result.updatedProducts++;
        } else {
          await storage.createProduct(productData);
          result.newProducts++;
        }
        
        result.totalProcessed++;
        
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Erro desconhecido',
          value: row
        });
      }
    }

    return result;
  }

  /**
   * Process channels import from Excel
   */
  async processChannelsImport(
    fileBuffer: Buffer,
    userId: number,
    autoUpdate: boolean = false
  ): Promise<ImportResult> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    const result: ImportResult = {
      newProducts: 0,
      updatedProducts: 0,
      errors: [],
      conflicts: [],
      totalProcessed: 0
    };

    // Group by product_id
    const channelsByProduct = new Map<number, any[]>();
    
    for (const row of rawData as any[]) {
      if (!row.produto_id) continue;
      
      const productId = Number(row.produto_id);
      if (!channelsByProduct.has(productId)) {
        channelsByProduct.set(productId, []);
      }
      channelsByProduct.get(productId)!.push(row);
    }

    // Process each product's channels
    for (const [productId, channels] of channelsByProduct) {
      try {
        const product = await storage.getProduct(productId);
        if (!product || product.userId !== userId) {
          result.errors.push({
            row: 0,
            field: 'produto_id',
            message: `Produto ${productId} não encontrado ou não pertence ao usuário`,
            value: productId
          });
          continue;
        }

        const channelsData = channels.map(row => this.mapRowToChannel(row));
        
        await storage.updateProduct(productId, {
          channels: channelsData
        });
        
        result.updatedProducts++;
        result.totalProcessed++;
        
      } catch (error: any) {
        result.errors.push({
          row: 0,
          field: 'general',
          message: error.message || 'Erro ao processar canais',
          value: productId
        });
      }
    }

    return result;
  }

  /**
   * Map Excel row to product data
   */
  private mapRowToProduct(row: any, userId: number): InsertProduct {
    return {
      userId,
      name: row.nome,
      sku: row.sku || '',
      supplierCode: row.codigo_fornecedor || null,
      internalCode: row.codigo_interno || null,
      ean: row.ean || null,
      brand: row.marca || null,
      category: row.categoria || null,
      supplierId: row.fornecedor_id ? Number(row.fornecedor_id) : null,
      ncm: row.ncm || null,
      dimensions: row.dimensoes_comprimento ? {
        length: Number(row.dimensoes_comprimento) || 0,
        width: Number(row.dimensoes_largura) || 0,
        height: Number(row.dimensoes_altura) || 0
      } : null,
      weight: row.peso ? String(row.peso) : "0",
      costItem: row.custo_item ? String(row.custo_item) : "0",
      packCost: row.custo_embalagem ? String(row.custo_embalagem) : "0",
      taxPercent: row.percentual_imposto ? String(row.percentual_imposto) : "0",
      observations: row.observacoes || null,
      bulletPoints: row.bullet_points ? row.bullet_points.split(';') : [],
      description: row.descricao || null,
      active: row.ativo !== false, // Default to true if not specified
      photo: null
    };
  }

  /**
   * Map Excel row to channel data
   */
  private mapRowToChannel(row: any): any {
    return {
      name: row.canal,
      active: row.ativo !== false,
      price: row.preco ? Number(row.preco) : 0,
      stock: row.estoque ? Number(row.estoque) : 0,
      title: row.titulo || '',
      description: row.descricao || '',
      categories: row.categorias ? row.categorias.split(' > ') : [],
      keywords: row.palavras_chave ? row.palavras_chave.split(',') : [],
      amazon: {
        asin: row.amazon_asin || '',
        category: row.amazon_categoria || ''
      },
      mercadolivre: {
        id: row.mercadolivre_id || '',
        category: row.mercadolivre_categoria || ''
      },
      shopify: {
        handle: row.shopify_handle || ''
      },
      magento: {
        sku: row.magento_sku || ''
      }
    };
  }
}

export const excelImportExportService = ExcelImportExportService.getInstance();