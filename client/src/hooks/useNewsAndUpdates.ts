import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

export const useNewsAndUpdates = () => {
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Fetch published news preview
  const { data: newsData = [], isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/news/published/preview');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
  });

  // Fetch published updates preview
  const { data: updatesData = [], isLoading: updatesLoading } = useQuery({
    queryKey: ['/api/updates/published/preview'],
    queryFn: async () => {
      const response = await fetch('/api/updates/published/preview');
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
  });

  // Função para buscar dados completos de uma notícia
  const fetchFullNews = useCallback(async (newsId: number) => {
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.error('Erro ao buscar notícia completa:', error);
    }
    return null;
  }, []);

  // Função para buscar dados completos de uma novidade
  const fetchFullUpdate = useCallback(async (updateId: number) => {
    try {
      const response = await fetch(`/api/updates/${updateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.error('Erro ao buscar novidade completa:', error);
    }
    return null;
  }, []);

  // Função para abrir modal de notícia
  const openNewsModal = useCallback(async (news: any) => {
    const fullNews = await fetchFullNews(news.id);
    if (fullNews) {
      setSelectedNews(fullNews);
      setNewsModalOpen(true);
    }
  }, [fetchFullNews]);

  // Função para abrir modal de novidade
  const openUpdateModal = useCallback(async (update: any) => {
    const fullUpdate = await fetchFullUpdate(update.id);
    if (fullUpdate) {
      setSelectedUpdate(fullUpdate);
      setUpdateModalOpen(true);
    }
  }, [fetchFullUpdate]);

  // Função para formatar datas
  const formatCreatedDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  }, []);

  return useMemo(() => ({
    // Data
    newsData,
    updatesData,
    newsLoading,
    updatesLoading,
    
    // Modal states
    selectedNews,
    selectedUpdate,
    newsModalOpen,
    updateModalOpen,
    setNewsModalOpen,
    setUpdateModalOpen,
    
    // Functions
    openNewsModal,
    openUpdateModal,
    formatCreatedDate,
  }), [
    newsData,
    updatesData,
    newsLoading,
    updatesLoading,
    selectedNews,
    selectedUpdate,
    newsModalOpen,
    updateModalOpen,
    openNewsModal,
    openUpdateModal,
    formatCreatedDate,
  ]);
};

export default useNewsAndUpdates;