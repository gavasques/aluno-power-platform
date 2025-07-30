/**
 * HOOK: useChannelsEditor
 * Lógica de negócio completa para editor de canais
 * Extraído de ChannelsEditor.tsx (735 linhas) para modularização
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { logger } from '@/utils/logger';
import {
  calculateChannelProfitability,
  formatCurrency,
  formatPercent,
  type ChannelCalculationResult
} from '@/utils/channelCalculations';
import {
  ChannelType,
  ChannelData,
  Product,
  ChannelsEditorState,
  ChannelsEditorActions,
  ChannelsEditorUtils,
  ChannelsFormData,
  channelsFormSchema,
  ChannelsFormSchemaType,
  CHANNEL_CONFIGS,
  ChannelsEditorContainerProps,
  ChannelConfig,
  ChannelsApiResponse,
  ProductApiResponse
} from '../types/channels';

export const useChannelsEditor = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
  readOnly = false,
  initialChannels = []
}: ChannelsEditorContainerProps) => {
  const { toast } = useToast();

  // ===== STATE MANAGEMENT =====
  const [state, setState] = useState<ChannelsEditorState>({
    isLoading: false,
    isSaving: false,
    error: null,
    product: null,
    channels: initialChannels,
    formData: {},
    expandedChannels: new Set<ChannelType>(),
    calculations: {} as Record<ChannelType, ChannelCalculationResult>,
    hasUnsavedChanges: false
  });

  // ===== FORM MANAGEMENT =====
  const form = useForm<ChannelsFormSchemaType>({
    resolver: zodResolver(channelsFormSchema),
    defaultValues: {},
  });

  // ===== DATA FETCHING =====
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      const response = await apiRequest(`/api/products/${productId}`) as ProductApiResponse;
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar produto');
      }
      return response.data;
    },
    enabled: isOpen && !!productId,
  });

  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ['product-channels', productId],
    queryFn: async (): Promise<ChannelData[]> => {
      const response = await apiRequest(`/api/products/${productId}/channels`) as ChannelsApiResponse;
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar canais');
      }
      return response.data;
    },
    enabled: isOpen && !!productId,
  });

  // ===== MUTATIONS =====
  const saveChannelsMutation = useMutation({
    mutationFn: async (channelData: Partial<ChannelData>[]): Promise<ChannelData[]> => {
      const response = await apiRequest(`/api/products/${productId}/channels`, {
        method: 'PUT',
        body: JSON.stringify({ channels: channelData }),
        headers: {
          'Content-Type': 'application/json',
        },
      }) as ChannelsApiResponse;

      if (!response.success) {
        throw new Error(response.error || 'Erro ao salvar canais');
      }

      return response.data;
    },
    onSuccess: (savedChannels) => {
      setState(prev => ({
        ...prev,
        channels: savedChannels,
        hasUnsavedChanges: false,
        isSaving: false
      }));

      queryClient.invalidateQueries({ queryKey: ['product-channels', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });

      toast({
        title: 'Sucesso',
        description: 'Canais salvos com sucesso!',
      });

      onSuccess?.(savedChannels);
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, isSaving: false, error: error.message }));
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar canais',
        variant: 'destructive',
      });
      
      logger.error('Error saving channels:', error);
    },
  });

  // ===== CALCULATION FUNCTIONS =====
  const calculateChannelResult = useCallback((channelType: ChannelType, channelData: Partial<ChannelData>): ChannelCalculationResult => {
    if (!product || !channelData) {
      return {
        channelType,
        productCost: product?.costPrice || 0,
        totalCosts: 0,
        netProfit: 0,
        marginPercent: 0,
        roi: 0,
        isProfit: false,
        costBreakdown: {
          productCost: product?.costPrice || 0
        },
        calculations: {
          grossRevenue: 0,
          totalDeductions: 0,
          netRevenue: 0,
          totalCosts: 0,
          profit: 0
        }
      };
    }

    return calculateChannelProfitability(channelData as ChannelData, product.costPrice || 0);
  }, [product]);

  const recalculateChannel = useCallback((channelType: ChannelType) => {
    const channelData = state.formData[channelType];
    if (channelData) {
      const calculation = calculateChannelResult(channelType, channelData);
      setState(prev => ({
        ...prev,
        calculations: {
          ...prev.calculations,
          [channelType]: calculation
        }
      }));
    }
  }, [state.formData, calculateChannelResult]);

  const recalculateAllChannels = useCallback(() => {
    const newCalculations: Record<ChannelType, ChannelCalculationResult> = {} as any;
    
    Object.entries(state.formData).forEach(([channelType, channelData]) => {
      if (channelData) {
        newCalculations[channelType as ChannelType] = calculateChannelResult(channelType as ChannelType, channelData);
      }
    });

    setState(prev => ({
      ...prev,
      calculations: newCalculations
    }));
  }, [state.formData, calculateChannelResult]);

  // ===== FORM ACTIONS =====
  const updateChannelData = useCallback((channelType: ChannelType, field: string, value: any) => {
    setState(prev => {
      const updatedFormData = {
        ...prev.formData,
        [channelType]: {
          ...prev.formData[channelType],
          [field]: value,
          channelType,
          productId,
          isActive: true
        }
      };

      // Recalculate for this channel
      const channelData = updatedFormData[channelType];
      const calculation = channelData ? calculateChannelResult(channelType, channelData) : null;

      return {
        ...prev,
        formData: updatedFormData,
        hasUnsavedChanges: true,
        calculations: calculation ? {
          ...prev.calculations,
          [channelType]: calculation
        } : prev.calculations
      };
    });
  }, [productId, calculateChannelResult]);

  const toggleChannel = useCallback((channelType: ChannelType, enabled: boolean) => {
    setState(prev => {
      if (enabled) {
        // Enable channel with default values
        const channelConfig = CHANNEL_CONFIGS[channelType];
        const defaultData = {
          channelType,
          productId,
          isActive: true,
          ...channelConfig.defaultValues
        };

        return {
          ...prev,
          formData: {
            ...prev.formData,
            [channelType]: defaultData
          },
          expandedChannels: new Set([...prev.expandedChannels, channelType]),
          hasUnsavedChanges: true
        };
      } else {
        // Disable channel
        const newFormData = { ...prev.formData };
        delete newFormData[channelType];
        
        const newExpandedChannels = new Set(prev.expandedChannels);
        newExpandedChannels.delete(channelType);

        const newCalculations = { ...prev.calculations };
        delete newCalculations[channelType];

        return {
          ...prev,
          formData: newFormData,
          expandedChannels: newExpandedChannels,
          calculations: newCalculations,
          hasUnsavedChanges: true
        };
      }
    });
  }, [productId]);

  const expandChannel = useCallback((channelType: ChannelType) => {
    setState(prev => ({
      ...prev,
      expandedChannels: new Set([...prev.expandedChannels, channelType])
    }));
  }, []);

  const collapseChannel = useCallback((channelType: ChannelType) => {
    setState(prev => {
      const newExpandedChannels = new Set(prev.expandedChannels);
      newExpandedChannels.delete(channelType);
      return {
        ...prev,
        expandedChannels: newExpandedChannels
      };
    });
  }, []);

  const toggleChannelExpansion = useCallback((channelType: ChannelType) => {
    setState(prev => {
      const newExpandedChannels = new Set(prev.expandedChannels);
      if (newExpandedChannels.has(channelType)) {
        newExpandedChannels.delete(channelType);
      } else {
        newExpandedChannels.add(channelType);
      }
      return {
        ...prev,
        expandedChannels: newExpandedChannels
      };
    });
  }, []);

  // ===== DATA ACTIONS =====
  const saveChannels = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const channelDataArray = Object.values(state.formData).filter(Boolean) as Partial<ChannelData>[];
      await saveChannelsMutation.mutateAsync(channelDataArray);
    } catch (error) {
      logger.error('Error in saveChannels:', error);
    }
  }, [state.formData, saveChannelsMutation]);

  const resetForm = useCallback(() => {
    const initialFormData: ChannelsFormData = {};
    
    // Convert existing channels to form data
    channels.forEach(channel => {
      initialFormData[channel.channelType] = channel;
    });

    setState(prev => ({
      ...prev,
      formData: initialFormData,
      hasUnsavedChanges: false,
      error: null,
      expandedChannels: new Set()
    }));

    form.reset();
  }, [channels, form]);

  const loadChannels = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await refetchChannels();
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      logger.error('Error loading channels:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refetchChannels]);

  // ===== VALIDATION ACTIONS =====
  const validateChannel = useCallback((channelType: ChannelType): boolean => {
    const channelData = state.formData[channelType];
    if (!channelData) return false;

    // Validate required fields for each channel type
    const config = CHANNEL_CONFIGS[channelType];
    const requiredFields = config.fields.filter(field => field.required);
    
    return requiredFields.every(field => {
      const value = channelData[field.key as keyof typeof channelData];
      return value !== undefined && value !== null && value !== '';
    });
  }, [state.formData]);

  const validateAllChannels = useCallback((): boolean => {
    const activeChannels = Object.keys(state.formData) as ChannelType[];
    return activeChannels.every(channelType => validateChannel(channelType));
  }, [state.formData, validateChannel]);

  // ===== MODAL ACTIONS =====
  const closeEditor = useCallback(() => {
    if (state.hasUnsavedChanges) {
      if (confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [state.hasUnsavedChanges, onClose]);

  const confirmClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ===== UTILITIES =====
  const utils: ChannelsEditorUtils = useMemo(() => ({
    // Formatting
    formatCurrency: (value: number) => formatCurrency(value),
    formatPercent: (value: number) => formatPercent(value),
    formatNumber: (value: number, decimals = 2) => value.toFixed(decimals),

    // Calculations
    calculateChannelProfitability: calculateChannelResult,
    getChannelConfig: (channelType: ChannelType) => CHANNEL_CONFIGS[channelType],
    getChannelIcon: (channelType: ChannelType) => CHANNEL_CONFIGS[channelType].icon,
    getChannelName: (channelType: ChannelType) => CHANNEL_CONFIGS[channelType].name,

    // Validation
    isChannelActive: (channelType: ChannelType) => !!state.formData[channelType],
    isChannelExpanded: (channelType: ChannelType) => state.expandedChannels.has(channelType),
    hasChannelData: (channelType: ChannelType) => {
      const channelData = state.formData[channelType];
      if (!channelData) return false;
      
      const config = CHANNEL_CONFIGS[channelType];
      return config.fields.some(field => {
        const value = channelData[field.key as keyof typeof channelData];
        return value !== undefined && value !== null && value !== '';
      });
    },
    getChannelErrors: (channelType: ChannelType) => {
      const errors: string[] = [];
      const channelData = state.formData[channelType];
      
      if (!channelData) {
        errors.push('Canal não configurado');
        return errors;
      }

      const config = CHANNEL_CONFIGS[channelType];
      config.fields.forEach(field => {
        if (field.required) {
          const value = channelData[field.key as keyof typeof channelData];
          if (value === undefined || value === null || value === '') {
            errors.push(`${field.label} é obrigatório`);
          }
        }
      });

      return errors;
    },

    // Data transformation
    getChannelDataForAPI: (channelType: ChannelType) => state.formData[channelType] || null,
    getAllChannelDataForAPI: () => Object.values(state.formData).filter(Boolean) as Partial<ChannelData>[],
    mergeChannelData: (existing: ChannelData[], updated: Partial<ChannelData>[]) => {
      const merged = [...existing];
      
      updated.forEach(updatedChannel => {
        const existingIndex = merged.findIndex(
          channel => channel.channelType === updatedChannel.channelType
        );
        
        if (existingIndex >= 0) {
          merged[existingIndex] = { ...merged[existingIndex], ...updatedChannel } as ChannelData;
        } else if (updatedChannel.channelType) {
          merged.push(updatedChannel as ChannelData);
        }
      });
      
      return merged;
    }
  }), [state, calculateChannelResult]);

  // ===== ACTIONS OBJECT =====
  const actions: ChannelsEditorActions = useMemo(() => ({
    // Form actions
    updateChannelData,
    toggleChannel,
    expandChannel,
    collapseChannel,
    toggleChannelExpansion,
    
    // Data actions
    saveChannels,
    resetForm,
    loadChannels,
    
    // Calculation actions
    recalculateChannel,
    recalculateAllChannels,
    
    // Validation actions
    validateChannel,
    validateAllChannels,
    
    // Modal actions
    closeEditor,
    confirmClose
  }), [
    updateChannelData,
    toggleChannel,
    expandChannel,
    collapseChannel,
    toggleChannelExpansion,
    saveChannels,
    resetForm,
    loadChannels,
    recalculateChannel,
    recalculateAllChannels,
    validateChannel,
    validateAllChannels,
    closeEditor,
    confirmClose
  ]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (product) {
      setState(prev => ({ ...prev, product }));
    }
  }, [product]);

  useEffect(() => {
    if (channels.length > 0) {
      const initialFormData: ChannelsFormData = {};
      channels.forEach(channel => {
        initialFormData[channel.channelType] = channel;
      });

      setState(prev => ({
        ...prev,
        channels,
        formData: initialFormData,
        hasUnsavedChanges: false
      }));
    }
  }, [channels]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: productLoading || channelsLoading
    }));
  }, [productLoading, channelsLoading]);

  // Auto-recalculate when form data changes
  useEffect(() => {
    if (Object.keys(state.formData).length > 0) {
      recalculateAllChannels();
    }
  }, [state.formData, recalculateAllChannels]);

  // ===== COMBINED STATE =====
  const combinedState: ChannelsEditorState = {
    ...state,
    isLoading: state.isLoading || productLoading || channelsLoading
  };

  return {
    state: combinedState,
    actions,
    utils,
    form,
    readOnly
  };
};

export default useChannelsEditor;
