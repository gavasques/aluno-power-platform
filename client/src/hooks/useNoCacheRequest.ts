import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { noCacheRequest, clearServerCache, forcePreviewRefresh } from '@/lib/cacheUtils';

interface UseNoCacheRequestOptions {
  showToasts?: boolean;
}

export function useNoCacheRequest(options: UseNoCacheRequestOptions = {}) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const { showToasts = true } = options;

  const makeNoCacheRequest = useCallback(async (url: string, requestOptions = {}) => {
    try {
      const response = await noCacheRequest(url, requestOptions);
      return response;
    } catch (error) {
      console.error('No-cache request failed:', error);
      if (showToasts) {
        toast({
          variant: "destructive",
          title: "Erro na requisição",
          description: "Falha ao fazer requisição sem cache"
        });
      }
      throw error;
    }
  }, [toast, showToasts]);

  const clearCache = useCallback(async () => {
    if (isClearing) return false;
    
    setIsClearing(true);
    
    try {
      await clearServerCache();
      
      if (showToasts) {
        toast({
          title: "Cache limpo",
          description: "Cache do servidor foi limpo com sucesso"
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      if (showToasts) {
        toast({
          variant: "destructive",
          title: "Erro ao limpar cache",
          description: "Não foi possível limpar o cache do servidor"
        });
      }
      return false;
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, toast, showToasts]);

  const refreshPreview = useCallback(async () => {
    if (isClearing) return false;
    
    setIsClearing(true);
    
    try {
      const success = await forcePreviewRefresh();
      
      if (success && showToasts) {
        toast({
          title: "Preview atualizado",
          description: "Cache do preview foi limpo e dados atualizados"
        });
      } else if (!success && showToasts) {
        toast({
          variant: "destructive",
          title: "Erro no refresh",
          description: "Não foi possível atualizar o preview"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to refresh preview:', error);
      if (showToasts) {
        toast({
          variant: "destructive",
          title: "Erro no preview",
          description: "Falha ao atualizar preview sem cache"
        });
      }
      return false;
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, toast, showToasts]);

  const hardRefresh = useCallback(() => {
    // Force complete page reload without cache
    window.location.reload();
  }, []);

  return {
    makeNoCacheRequest,
    clearCache,
    refreshPreview,
    hardRefresh,
    isClearing
  };
}