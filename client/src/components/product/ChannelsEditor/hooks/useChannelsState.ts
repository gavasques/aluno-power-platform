import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Schema para validação dos canais
const channelSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    data: z.record(z.any()).optional().default({}),
  })),
});

export type ChannelFormData = z.infer<typeof channelSchema>;

// Configuração dos campos dos canais
export const CHANNEL_FIELDS = {
  SITE_PROPRIO: {
    name: 'Site Próprio',
    icon: '🌐',
    fields: [
      { key: 'codigoSite', label: 'Código Site', type: 'text' },
      { key: 'packagingCostValue', label: 'Custo de Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'marketingCostPercent', label: 'Custos Marketing %', type: 'percent' },
      { key: 'financialCostPercent', label: 'Custos Financeiro %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda Site', type: 'currency' },
    ]
  },
  AMAZON_FBM: {
    name: 'Amazon FBM',
    icon: '📮',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBM', type: 'currency' },
    ]
  },
  AMAZON_FBA_ONSITE: {
    name: 'Amazon FBA On Site',
    icon: '🏭',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete FBA ON Site', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda FBA On Site', type: 'currency' },
    ]
  },
  AMAZON_DBA: {
    name: 'Amazon DBA',
    icon: '🚛',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete DBA', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda DBA', type: 'currency' },
    ]
  },
  AMAZON_FBA: {
    name: 'Amazon FBA',
    icon: '🏭',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'productCostFBA', label: 'Custo do Produto no FBA', type: 'currency' },
      { key: 'shippingCost', label: 'Custo do Frete FBA', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'prepCenterCost', label: 'Custo Prep. Center', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBA', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_ME1: {
    name: 'Mercado Livre ME1',
    icon: '🛒',
    fields: [
      { key: 'mlb', label: 'MLB', type: 'text' },
      { key: 'mlbCatalogo', label: 'MLB Catálogo', type: 'text' },
      { key: 'idProduto', label: 'ID Produto', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML ME1', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_FLEX: {
    name: 'Mercado Livre Flex',
    icon: '📦',
    fields: [
      { key: 'mlb', label: 'MLB', type: 'text' },
      { key: 'mlbCatalogo', label: 'MLB Catálogo', type: 'text' },
      { key: 'idProduto', label: 'ID Produto', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete ML Flex', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'revenueMLFlex', label: 'Receita ML Flex R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_ENVIOS: {
    name: 'Mercado Livre Envios',
    icon: '🚚',
    fields: [
      { key: 'mlb', label: 'MLB', type: 'text' },
      { key: 'mlbCatalogo', label: 'MLB Catálogo', type: 'text' },
      { key: 'idProduto', label: 'ID Produto', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete ML Envios', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_FULL: {
    name: 'Mercado Livre FULL',
    icon: '🏪',
    fields: [
      { key: 'mlb', label: 'MLB', type: 'text' },
      { key: 'mlbCatalogo', label: 'MLB Catálogo', type: 'text' },
      { key: 'idProduto', label: 'ID Produto', type: 'text' },
      { key: 'productCostMLFull', label: 'Custo do Produto no ML FULL', type: 'currency' },
      { key: 'shippingCost', label: 'Custo Frete ML FULL', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'prepCenterCost', label: 'Custo Prep. Center', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML FULL', type: 'currency' },
    ]
  },
};

export const useChannelsState = (productId: number, isOpen: boolean) => {
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  // Load product data - force fresh API call bypassing ALL cache
  const { data: product, isLoading: loadingProduct, error } = useQuery({
    queryKey: [`/api/products/${productId}`, 'channels-editor', Date.now()],
    enabled: isOpen,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      channels: Object.keys(CHANNEL_FIELDS).map(channelType => ({
        type: channelType,
        isActive: false,
        data: {},
      })),
    },
  });

  // Update form when product loads
  useEffect(() => {
    if (product && isOpen) {
      // Handle both response formats: direct channels or nested in data
      let productChannels = [];
      if (product) {
        // First check if it's the list format: product.data.channels
        if ((product as any).data?.channels) {
          productChannels = (product as any).data.channels;
        } 
        // Then check if it's the individual format: product.channels
        else if ((product as any).channels) {
          productChannels = (product as any).channels;
        }
        // Finally check if response is wrapped in data: product.data (API response format)
        else if ((product as any).data) {
          const productData = (product as any).data;
          if (productData.channels) {
            productChannels = productData.channels;
          }
        }
      }
      
      // Create a map of existing channels
      const channelMap = new Map(productChannels.map((ch: any) => [ch.type, ch]));
      
      // Update form with product data
      const formChannels = Object.keys(CHANNEL_FIELDS).map(channelType => {
        const existingChannel = channelMap.get(channelType) as any;
        
        // Convert string values to numbers for all channel data with safe type handling
        const convertedData: Record<string, any> = {};
        if (existingChannel?.data) {
          Object.keys(existingChannel.data).forEach(key => {
            const value = (existingChannel.data as any)[key];
            convertedData[key] = value ? parseFloat(value) || 0 : 0;
          });
        }
        
        return {
          type: channelType,
          isActive: existingChannel?.isActive || false,
          data: convertedData,
        };
      });

      form.reset({ channels: formChannels });
    }
  }, [product, isOpen, form]);

  const toggleChannelExpansion = (channelType: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelType)) {
        newSet.delete(channelType);
      } else {
        newSet.add(channelType);
      }
      return newSet;
    });
  };

  return {
    product,
    loadingProduct,
    error,
    form,
    expandedChannels,
    toggleChannelExpansion,
    CHANNEL_FIELDS
  };
}; 