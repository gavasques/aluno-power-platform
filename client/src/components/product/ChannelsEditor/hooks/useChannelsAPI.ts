import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { ChannelFormData, CHANNEL_FIELDS } from './useChannelsState';

export const useChannelsAPI = (productId: number, onClose: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const saveChannelsMutation = useMutation({
    mutationFn: async (data: ChannelFormData) => {
      const token = localStorage.getItem("auth_token");
      
      logger.debug("🔍 [CHANNELS_FORM] Form data being submitted:", data);

      // Validate that active channels have price filled
      const validationErrors: string[] = [];
      
      data.channels.forEach((channel, index) => {
        if (channel.isActive) {
          const price = (channel.data as any)?.price;
          if (!price || parseFloat(price.toString()) <= 0) {
            const channelConfig = Object.values(CHANNEL_FIELDS)[index] as any;
            validationErrors.push(`${channelConfig.name}: Preço de venda é obrigatório`);
          }
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' • '));
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

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Canais atualizados",
        description: "Os canais de venda foram atualizados com sucesso!",
      });

      // Invalidate and refresh product data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });

      onClose();
    },
    onError: (error: any) => {
      logger.error('Error updating channels:', error);
      
      if (error.message.includes('Preço de venda é obrigatório')) {
        toast({
          title: "Preço obrigatório",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar os canais de venda.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = async (data: ChannelFormData) => {
    setIsSaving(true);
    try {
      await saveChannelsMutation.mutateAsync(data);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSubmit,
    isSaving: isSaving || saveChannelsMutation.isPending
  };
}; 