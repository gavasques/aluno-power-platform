import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { logger } from '@/utils/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, Store, Check, X, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { PercentInput } from '@/components/ui/percent-input';
import { 
  calculateChannelProfitability, 
  formatCurrency, 
  formatPercent,
  type ChannelCalculationResult 
} from '@/utils/channelCalculations';

// Define channel types with their specific fields
const CHANNEL_FIELDS = {
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
  SHOPEE: {
    name: 'Shopee',
    icon: '🛍️',
    fields: [
      { key: 'idProduto', label: 'ID do Produto', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda Shopee', type: 'currency' },
    ]
  },
  MAGALU_FULL: {
    name: 'Magalu FULL',
    icon: '🏪',
    fields: [
      { key: 'skuMgl', label: 'SKU Mgl', type: 'text' },
      { key: 'productCostMagaluFull', label: 'Custo do Produto MGL FULL', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda MGL FULL', type: 'currency' },
    ]
  },
  MAGALU_ENVIOS: {
    name: 'Magalu Envios',
    icon: '📦',
    fields: [
      { key: 'skuMgl', label: 'SKU Mgl', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'shippingCostValue', label: 'Custo Frete R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda MGL Envios', type: 'currency' },
    ]
  },
  TIKTOKSHOP_NORMAL: {
    name: 'TikTok Shop',
    icon: '🎵',
    fields: [
      { key: 'idProduto', label: 'ID Produto', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'affiliateCommissionPercent', label: 'Comissão Afiliado %', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'shippingCostValue', label: 'Custo Frete R$', type: 'currency' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda TikTok', type: 'currency' },
    ]
  },
  MARKETPLACE_OTHER: {
    name: 'Outro Marketplace',
    icon: '🏪',
    fields: [
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
      { key: 'price', label: 'Preço de Venda', type: 'currency' },
    ]
  },
} as const;

// Simplified channel schema - no automatic validation to avoid "Required" messages
const channelSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    data: z.record(z.any()).optional().default({}),
  })),
});

type ChannelFormData = z.infer<typeof channelSchema>;

interface ChannelsEditorProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelsEditor: React.FC<ChannelsEditorProps> = ({ productId, isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [channelCalculations, setChannelCalculations] = React.useState<Record<string, ChannelCalculationResult>>({});
  
  // State to control which channels are expanded (all collapsed by default)
  const [expandedChannels, setExpandedChannels] = React.useState<Set<string>>(new Set());
  
  // Function to toggle channel expansion
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

  // Load product data - force fresh API call bypassing ALL cache
  const { data: product, isLoading: loadingProduct, error } = useQuery({
    queryKey: [`/api/products/${productId}`, 'channels-editor', Date.now()], // Force unique every time
    enabled: isOpen,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry failed requests
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
  React.useEffect(() => {
    if (product && isOpen) {
      console.log('📊 CHANNELS MODAL OPENED - Product ID:', productId);
      
      // Check response structure and extract channels  
      console.log('🔍 [SERVER SUCCESS] Raw storage data shows SITE_PROPRIO isActive: true, AMAZON_FBA isActive: true');
      console.log('🔍 [FULL RESPONSE] Complete product response:', product);
      console.log('🔍 [API CALL DEBUG] Query Key:', [`/api/products/${productId}`, 'channels-editor', Date.now()]);
      console.log('🔍 [API CALL DEBUG] Product ID being requested:', productId);
      console.log('🔍 [API CALL DEBUG] Response structure check:');
      console.log('🔍 [API CALL DEBUG] - product.success:', (product as any).success);
      console.log('🔍 [API CALL DEBUG] - product.data exists:', !!(product as any).data);
      console.log('🔍 [API CALL DEBUG] - product.data.channels exists:', !!(product as any).data?.channels);
      console.log('🔍 [API CALL DEBUG] - product.data.channels length:', (product as any).data?.channels?.length);
      console.log('🔍 [CACHE ISSUE] Response timestamp:', (product as any).timestamp);
      console.log('🔍 [CACHE ISSUE] Should see fresh server logs with CRITICAL DEBUG if not cached');
      
      // Manually invalidate cache and force fresh data
      if ((product as any).data?.channels?.every((ch: any) => !ch.isActive)) {
        console.log('🚨 [CACHE DETECTED] All channels inactive - forcing cache refresh');
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
        queryClient.removeQueries({ queryKey: [`/api/products/${productId}`] });
      }
      
      // Handle both response formats: direct channels or nested in data
      let productChannels = [];
      if (product) {
        // First check if it's the list format: product.data.channels
        if ((product as any).data?.channels) {
          productChannels = (product as any).data.channels;
          console.log('🔍 [STRUCTURE] Using product.data.channels (list endpoint format)');
        } 
        // Then check if it's the individual format: product.channels
        else if ((product as any).channels) {
          productChannels = (product as any).channels;
          console.log('🔍 [STRUCTURE] Using product.channels (individual endpoint format)');
        }
        // Finally check if response is wrapped in data: product.data (API response format)
        else if ((product as any).data) {
          const productData = (product as any).data;
          if (productData.channels) {
            productChannels = productData.channels;
            console.log('🔍 [STRUCTURE] Using product.data.channels (API response format)');
          }
        }
      }
      
      console.log('🔍 [FINAL CHANNELS] Selected channels:', productChannels);
      console.log('🔍 [COMPARISON] Should be isActive true, getting:', productChannels.find((ch: any) => ch.type === 'SITE_PROPRIO')?.isActive);
      
      // Verificar especificamente SITE_PROPRIO e AMAZON_FBA
      const siteProprio = productChannels.find((ch: any) => ch.type === 'SITE_PROPRIO');
      const amazonFBA = productChannels.find((ch: any) => ch.type === 'AMAZON_FBA');
      
      console.log('📊 Raw channel data - SITE_PROPRIO:', siteProprio);
      console.log('📊 Raw channel data - AMAZON_FBA:', amazonFBA);
      console.log('📊 Product channels array:', productChannels);
      console.log('📊 Product.data:', (product as any).data);
      console.log('📊 Product.channels direct:', (product as any).channels);
      
      // Create a map of existing channels
      const channelMap = new Map(productChannels.map((ch: any) => [ch.type, ch]));
      
      // Update form with product data
      const formChannels = Object.keys(CHANNEL_FIELDS).map(channelType => {
        const existingChannel = channelMap.get(channelType) as any;
        
        if (channelType === 'SITE_PROPRIO' || channelType === 'AMAZON_FBA') {
          console.log(`🔍 [CHANNEL MAPPING] Channel: ${channelType}`);
          console.log(`🔍 [CHANNEL MAPPING] existingChannel:`, existingChannel);
          console.log(`🔍 [CHANNEL MAPPING] existingChannel?.isActive:`, existingChannel?.isActive);
        }
        
        // Convert string values to numbers for all channel data with safe type handling
        const convertedData: Record<string, any> = {};
        if (existingChannel?.data) {
          Object.keys(existingChannel.data).forEach(key => {
            const value = (existingChannel.data as any)[key];
            convertedData[key] = value ? parseFloat(value) || 0 : 0;
          });
        }
        
        const result = {
          type: channelType,
          isActive: existingChannel?.isActive || false,
          data: convertedData,
        };
        
        if (channelType === 'SITE_PROPRIO' || channelType === 'AMAZON_FBA') {
          console.log(`📊 Form value for ${channelType}:`, result);
        }

        return result;
      });
      
      console.log('📊 Final form data:', {
        siteProprio: formChannels.find(ch => ch.type === 'SITE_PROPRIO'),
        amazonFBA: formChannels.find(ch => ch.type === 'AMAZON_FBA')
      });

      form.reset({ channels: formChannels });
    }
  }, [product, isOpen, form]);

  // Calculate financial metrics in real-time
  const watchedValues = form.watch();
  
  React.useEffect(() => {
    if (!product) return;

    const newCalculations: Record<string, ChannelCalculationResult> = {};

    watchedValues.channels.forEach((channel, index) => {
      if (channel.isActive && channel.data) {
        const productBase = {
          costItem: parseFloat((product as any).data?.costItem) || 0,
          taxPercent: parseFloat((product as any).data?.taxPercent) || 0,
        };

        const calculation = calculateChannelProfitability(
          channel.type,
          channel.data as any,
          productBase
        );

        newCalculations[channel.type] = calculation;
      }
    });

    setChannelCalculations(newCalculations);
  }, [watchedValues, product]);

  const onSubmit = async (data: ChannelFormData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      logger.debug("🔍 [CHANNELS_FORM] Form data being submitted:", data);

      // Validate that active channels have price filled
      const validationErrors: string[] = [];
      
      data.channels.forEach((channel, index) => {
        if (channel.isActive) {
          const price = (channel.data as any)?.price;
          if (!price || parseFloat(price.toString()) <= 0) {
            const channelConfig = Object.values(CHANNEL_FIELDS)[index];
            validationErrors.push(`${channelConfig.name}: Preço de venda é obrigatório`);
          }
        }
      });

      if (validationErrors.length > 0) {
        toast({
          title: "Preço obrigatório",
          description: validationErrors.join(' • '),
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Process all channels (active and inactive), converting empty fields to 0
      const processedChannels = data.channels.map(channel => ({
        type: channel.type,
        isActive: channel.isActive,
        data: Object.keys((channel.data as any) || {}).reduce((acc, key) => {
          const value = (channel.data as any)?.[key];
          acc[key] = value && value !== '' ? parseFloat(value.toString()) || 0 : 0;
          return acc;
        }, {} as Record<string, number>),
      }));

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          channels: processedChannels,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update channels');
      }

      toast({
        title: "Canais atualizados",
        description: "Os canais de venda foram atualizados com sucesso!",
      });

      // Invalidate and refresh product data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });

      onClose();
    } catch (error) {
      logger.error('Error updating channels:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os canais de venda.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando dados do produto...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    console.error('🔥 [ERROR] Query error:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8 text-red-600">
            <span>Erro ao carregar produto: {(error as any)?.message || 'Erro desconhecido'}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Store className="h-6 w-6" />
            Editar Canais de Venda
          </DialogTitle>
          <p className="text-muted-foreground">
            Configure os canais de venda onde o produto será comercializado
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(CHANNEL_FIELDS).map(([channelType, channelConfig], index) => {
                const isActive = form.watch(`channels.${index}.isActive`);
                
                const isExpanded = expandedChannels.has(channelType);
                
                return (
                  <Card key={channelType} className={isActive ? 'border-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-2 cursor-pointer flex-1 justify-start p-0 h-auto hover:bg-transparent"
                          onClick={() => toggleChannelExpansion(channelType)}
                        >
                          <span className="text-2xl">{channelConfig.icon}</span>
                          <CardTitle className="text-lg">{channelConfig.name}</CardTitle>
                          {isActive && (
                            <div className="ml-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </Button>
                        <FormField
                          control={form.control}
                          name={`channels.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardHeader>
                    
                    {isActive && isExpanded && (
                      <CardContent className="space-y-3 pt-0">
                        <div className="text-sm text-muted-foreground mb-3">
                          Custo do produto: R$ {(product as any)?.data?.costItem || '0,00'} | 
                          Impostos: {(product as any)?.data?.taxPercent || '0,00'}%
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {channelConfig.fields.map((fieldConfig) => (
                            <FormField
                              key={fieldConfig.key}
                              control={form.control}
                              name={`channels.${index}.data.${fieldConfig.key}`}
                              render={({ field }) => (
                                <FormItem className={fieldConfig.key === 'price' ? 'col-span-2' : ''}>
                                  <FormLabel className={fieldConfig.key === 'price' ? 'font-semibold' : ''}>
                                    {fieldConfig.label}
                                  </FormLabel>
                                  <FormControl>
                                    {fieldConfig.type === 'currency' ? (
                                      <CurrencyInput
                                        value={parseFloat(field.value?.toString() || '0') || 0}
                                        onChange={field.onChange}
                                        placeholder="R$ 0,00"
                                      />
                                    ) : fieldConfig.type === 'percent' ? (
                                      <PercentInput
                                        value={parseFloat(field.value?.toString() || '0') || 0}
                                        onChange={field.onChange}
                                        placeholder="0,00%"
                                      />
                                    ) : (
                                      <Input
                                        value={field.value?.toString() || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder={fieldConfig.label}
                                      />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        
                        {/* Financial Summary */}
                        {channelCalculations[channelType] && (
                          <div className="border-t pt-3 mt-3">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                {channelCalculations[channelType].isProfit ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium text-sm">Resumo Financeiro</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Custos Totais:</span>
                                  <br />
                                  <span className="font-medium">
                                    {formatCurrency(channelCalculations[channelType].totalCosts)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Lucro Líquido:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(channelCalculations[channelType].netProfit)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Margem:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(channelCalculations[channelType].marginPercent)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ROI:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(channelCalculations[channelType].roi)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar Canais
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelsEditor;