import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Tool as DbTool, InsertTool } from '@shared/schema';

interface ToolsContextType {
  tools: DbTool[];
  toolTypes: any[];
  loading: boolean;
  error: string | null;
  addTool: (tool: InsertTool) => Promise<void>;
  updateTool: (id: number, tool: Partial<InsertTool>) => Promise<void>;
  deleteTool: (id: number) => Promise<void>;
  getToolById: (id: number) => DbTool | undefined;
  getToolsByType: (typeId: string) => DbTool[];
  searchTools: (query: string) => DbTool[];
  getUserReviewsForTool: (toolId: string) => any[];
  addUserReview: (review: any) => Promise<void>;
  deleteUserReview: (reviewId: string) => Promise<void>;
  addReplyToReview: (reviewId: string, reply: string) => Promise<void>;
  refetch: () => void;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: tools = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: () => apiRequest<DbTool[]>('/api/tools'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch tool types from database
  const {
    data: toolTypes = [],
  } = useQuery({
    queryKey: ['/api/tool-types'],
    queryFn: () => apiRequest<any[]>('/api/tool-types'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const addToolMutation = useMutation({
    mutationFn: (tool: InsertTool) =>
      apiRequest<DbTool>('/api/tools', {
        method: 'POST',
        body: JSON.stringify(tool),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });

  const updateToolMutation = useMutation({
    mutationFn: ({ id, tool }: { id: number; tool: Partial<InsertTool> }) =>
      apiRequest<DbTool>(`/api/tools/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tool),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/tools/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });

  const addTool = async (tool: InsertTool): Promise<void> => {
    await addToolMutation.mutateAsync(tool);
  };

  const updateTool = async (id: number, tool: Partial<InsertTool>): Promise<void> => {
    await updateToolMutation.mutateAsync({ id, tool });
  };

  const deleteTool = async (id: number): Promise<void> => {
    await deleteToolMutation.mutateAsync(id);
  };

  const getToolById = (id: number): DbTool | undefined => {
    return tools.find(tool => tool.id === id);
  };

  const getToolsByType = (typeId: string): DbTool[] => {
    return tools.filter(tool => tool.typeId?.toString() === typeId);
  };

  const searchTools = (query: string): DbTool[] => {
    if (!query) return tools;
    return tools.filter(tool =>
      tool.name?.toLowerCase().includes(query.toLowerCase()) ||
      tool.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Mock review functions - temporary until review system is implemented
  const getUserReviewsForTool = (toolId: string): any[] => {
    return [];
  };

  const addUserReview = async (review: any): Promise<void> => {
    // Placeholder for future implementation
  };

  const deleteUserReview = async (reviewId: string): Promise<void> => {
    // Placeholder for future implementation
  };

  const addReplyToReview = async (reviewId: string, reply: string): Promise<void> => {
    // Placeholder for future implementation
  };

  const value: ToolsContextType = {
    tools,
    toolTypes,
    loading,
    error: error?.message || null,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    getToolsByType,
    searchTools,
    getUserReviewsForTool,
    addUserReview,
    deleteUserReview,
    addReplyToReview,
    refetch,
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools() {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
}