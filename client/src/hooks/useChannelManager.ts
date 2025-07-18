/**
 * Channel Manager Hook
 * Centralized state management for sales channels following SOLID principles
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  SalesChannel, 
  ChannelCalculationResult, 
  ProductWithChannels,
  ChannelUpdateRequest 
} from '@/shared/types/channels';
import { 
  calculateAllChannels,
  calculateChannelProfitability 
} from '@/shared/utils/channelCalculations';
import { ALL_CHANNEL_TYPES, createEmptyChannel } from '@/shared/constants/channels';

interface UseChannelManagerProps {
  productId: number;
  productCost: number;
  taxPercent: number;
}

export function useChannelManager({ productId, productCost, taxPercent }: UseChannelManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for form data
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Query for product data
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/products/${productId}`, 'channel-manager'],
    enabled: !!productId,
    staleTime: 0,
    gcTime: 0,
  });

  // Mutation for saving channels
  const saveMutation = useMutation({
    mutationFn: async (channelData: ChannelUpdateRequest) => {
      return apiRequest(`/api/products/${productId}/channels`, {
        method: 'PUT',
        body: JSON.stringify(channelData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Canais salvos com sucesso',
        description: 'As configurações dos canais foram atualizadas.',
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar canais',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  // Initialize channels when product loads
  const initializeChannels = useCallback(() => {
    if (!product?.data?.channels) return;

    const productChannels = product.data.channels as SalesChannel[];
    const initializedChannels: SalesChannel[] = [];

    // Ensure all channel types exist
    ALL_CHANNEL_TYPES.forEach(channelType => {
      const existingChannel = productChannels.find(ch => ch.type === channelType);
      if (existingChannel) {
        initializedChannels.push(existingChannel);
      } else {
        initializedChannels.push(createEmptyChannel(channelType));
      }
    });

    setChannels(initializedChannels);
    setHasChanges(false);
  }, [product]);

  // Calculate profitability for all channels
  const calculations = useMemo(() => {
    if (!channels.length || !productCost || !taxPercent) return {};
    return calculateAllChannels(channels, productCost, taxPercent);
  }, [channels, productCost, taxPercent]);

  // Update channel data
  const updateChannel = useCallback((channelType: string, updates: Partial<SalesChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.type === channelType 
        ? { ...channel, ...updates }
        : channel
    ));
    setHasChanges(true);
  }, []);

  // Toggle channel active state
  const toggleChannelActive = useCallback((channelType: string) => {
    setChannels(prev => prev.map(channel => 
      channel.type === channelType 
        ? { ...channel, isActive: !channel.isActive }
        : channel
    ));
    setHasChanges(true);
  }, []);

  // Update channel pricing data
  const updateChannelData = useCallback((channelType: string, data: Partial<SalesChannel['data']>) => {
    setChannels(prev => prev.map(channel => 
      channel.type === channelType 
        ? { ...channel, data: { ...channel.data, ...data } }
        : channel
    ));
    setHasChanges(true);
  }, []);

  // Toggle channel expansion in UI
  const toggleExpansion = useCallback((channelType: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelType)) {
        newSet.delete(channelType);
      } else {
        newSet.add(channelType);
      }
      return newSet;
    });
  }, []);

  // Save all channels
  const saveChannels = useCallback(async () => {
    if (!hasChanges || saveMutation.isPending) return;
    await saveMutation.mutateAsync({ channels });
  }, [channels, hasChanges, saveMutation]);

  // Reset to original state
  const resetChanges = useCallback(() => {
    initializeChannels();
  }, [initializeChannels]);

  // Get active channels
  const activeChannels = useMemo(() => 
    channels.filter(channel => channel.isActive), 
    [channels]
  );

  // Get channel by type
  const getChannel = useCallback((channelType: string) => 
    channels.find(channel => channel.type === channelType), 
    [channels]
  );

  // Get calculation result for channel
  const getCalculation = useCallback((channelType: string): ChannelCalculationResult | null => 
    calculations[channelType] || null, 
    [calculations]
  );

  // Initialize when product loads
  React.useEffect(() => {
    if (product?.data) {
      initializeChannels();
    }
  }, [product, initializeChannels]);

  return {
    // Data
    channels,
    activeChannels,
    calculations,
    product: product?.data,
    
    // State
    isLoading,
    error,
    hasChanges,
    isSaving: saveMutation.isPending,
    expandedChannels,
    
    // Actions
    updateChannel,
    updateChannelData,
    toggleChannelActive,
    toggleExpansion,
    saveChannels,
    resetChanges,
    getChannel,
    getCalculation,
    
    // Utilities
    initializeChannels,
  };
}