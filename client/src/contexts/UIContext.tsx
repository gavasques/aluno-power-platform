/**
 * UIContext Centralizado
 * Gerencia todo estado de interface da aplicação
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Theme types
type Theme = 'light' | 'dark' | 'system';

// Sidebar state
interface SidebarState {
  isOpen: boolean;
  isPinned: boolean;
  activeSection: string | null;
}

// Modal state  
interface ModalState {
  openModals: Set<string>;
  modalData: Record<string, any>;
}

// Notification state
interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    autoHide?: boolean;
  }>;
}

// Loading states globais
interface LoadingState {
  globalLoading: boolean;
  pageLoading: boolean;
  operationLoading: Record<string, boolean>;
}

// Search state global
interface SearchState {
  globalSearchTerm: string;
  recentSearches: string[];
  searchHistory: Record<string, string[]>;
}

// Consolidated UI State
interface UIState {
  theme: Theme;
  sidebar: SidebarState;
  modals: ModalState;
  notifications: NotificationState;
  loading: LoadingState;
  search: SearchState;
}

// UI Actions
interface UIActions {
  // Theme actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Sidebar actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
  setActiveSection: (section: string | null) => void;
  
  // Modal actions
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  getModalData: (modalId: string) => any;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications']['notifications'][0], 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  setOperationLoading: (operation: string, loading: boolean) => void;
  
  // Search actions
  setGlobalSearch: (term: string) => void;
  addToSearchHistory: (context: string, term: string) => void;
  clearSearchHistory: (context?: string) => void;
}

type UIContextType = UIState & UIActions;

const UIContext = createContext<UIContextType | null>(null);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [state, setState] = useState<UIState>({
    theme: (localStorage.getItem('theme') as Theme) || 'system',
    sidebar: {
      isOpen: window.innerWidth >= 1024, // Desktop por padrão
      isPinned: localStorage.getItem('sidebar-pinned') === 'true',
      activeSection: null,
    },
    modals: {
      openModals: new Set(),
      modalData: {},
    },
    notifications: {
      notifications: [],
    },
    loading: {
      globalLoading: false,
      pageLoading: false,
      operationLoading: {},
    },
    search: {
      globalSearchTerm: '',
      recentSearches: JSON.parse(localStorage.getItem('recent-searches') || '[]'),
      searchHistory: JSON.parse(localStorage.getItem('search-history') || '{}'),
    },
  });

  // Theme actions
  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
    
    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [state.theme, setTheme]);

  // Sidebar actions
  const openSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: true }
    }));
  }, []);

  const closeSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: false }
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, isOpen: !prev.sidebar.isOpen }
    }));
  }, []);

  const pinSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, isPinned: true }
    }));
    localStorage.setItem('sidebar-pinned', 'true');
  }, []);

  const unpinSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, isPinned: false }
    }));
    localStorage.setItem('sidebar-pinned', 'false');
  }, []);

  const setActiveSection = useCallback((section: string | null) => {
    setState(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, activeSection: section }
    }));
  }, []);

  // Modal actions
  const openModal = useCallback((modalId: string, data?: any) => {
    setState(prev => ({
      ...prev,
      modals: {
        openModals: new Set([...prev.modals.openModals, modalId]),
        modalData: data ? { ...prev.modals.modalData, [modalId]: data } : prev.modals.modalData,
      }
    }));
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setState(prev => {
      const newOpenModals = new Set(prev.modals.openModals);
      newOpenModals.delete(modalId);
      
      const newModalData = { ...prev.modals.modalData };
      delete newModalData[modalId];
      
      return {
        ...prev,
        modals: {
          openModals: newOpenModals,
          modalData: newModalData,
        }
      };
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setState(prev => ({
      ...prev,
      modals: {
        openModals: new Set(),
        modalData: {},
      }
    }));
  }, []);

  const getModalData = useCallback((modalId: string) => {
    return state.modals.modalData[modalId];
  }, [state.modals.modalData]);

  // Notification actions
  const addNotification = useCallback((notification: Omit<UIState['notifications']['notifications'][0], 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      notifications: {
        notifications: [...prev.notifications.notifications, newNotification],
      }
    }));

    // Auto-remove after 5 seconds if autoHide is true (default)
    if (notification.autoHide !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: {
        notifications: prev.notifications.notifications.filter(n => n.id !== id),
      }
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: { notifications: [] }
    }));
  }, []);

  // Loading actions
  const setGlobalLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, globalLoading: loading }
    }));
  }, []);

  const setPageLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, pageLoading: loading }
    }));
  }, []);

  const setOperationLoading = useCallback((operation: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        operationLoading: {
          ...prev.loading.operationLoading,
          [operation]: loading,
        }
      }
    }));
  }, []);

  // Search actions
  const setGlobalSearch = useCallback((term: string) => {
    setState(prev => ({
      ...prev,
      search: { ...prev.search, globalSearchTerm: term }
    }));
  }, []);

  const addToSearchHistory = useCallback((context: string, term: string) => {
    if (!term.trim()) return;

    setState(prev => {
      const contextHistory = prev.search.searchHistory[context] || [];
      const newHistory = [term, ...contextHistory.filter(t => t !== term)].slice(0, 10);
      const newSearchHistory = { ...prev.search.searchHistory, [context]: newHistory };
      
      // Update recent searches (global)
      const newRecentSearches = [term, ...prev.search.recentSearches.filter(t => t !== term)].slice(0, 5);
      
      // Persist to localStorage
      localStorage.setItem('search-history', JSON.stringify(newSearchHistory));
      localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));
      
      return {
        ...prev,
        search: {
          ...prev.search,
          searchHistory: newSearchHistory,
          recentSearches: newRecentSearches,
        }
      };
    });
  }, []);

  const clearSearchHistory = useCallback((context?: string) => {
    setState(prev => {
      if (context) {
        const newSearchHistory = { ...prev.search.searchHistory };
        delete newSearchHistory[context];
        localStorage.setItem('search-history', JSON.stringify(newSearchHistory));
        
        return {
          ...prev,
          search: { ...prev.search, searchHistory: newSearchHistory }
        };
      } else {
        localStorage.removeItem('search-history');
        localStorage.removeItem('recent-searches');
        
        return {
          ...prev,
          search: {
            ...prev.search,
            searchHistory: {},
            recentSearches: [],
          }
        };
      }
    });
  }, []);

  const contextValue: UIContextType = {
    ...state,
    setTheme,
    toggleTheme,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    pinSidebar,
    unpinSidebar,
    setActiveSection,
    openModal,
    closeModal,
    closeAllModals,
    getModalData,
    addNotification,
    removeNotification,
    clearAllNotifications,
    setGlobalLoading,
    setPageLoading,
    setOperationLoading,
    setGlobalSearch,
    addToSearchHistory,
    clearSearchHistory,
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// Specialized hooks for better ergonomics
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUI();
  return { theme, setTheme, toggleTheme };
};

export const useSidebar = () => {
  const { sidebar, openSidebar, closeSidebar, toggleSidebar, pinSidebar, unpinSidebar, setActiveSection } = useUI();
  return { 
    ...sidebar, 
    open: openSidebar, 
    close: closeSidebar, 
    toggle: toggleSidebar, 
    pin: pinSidebar, 
    unpin: unpinSidebar, 
    setActiveSection 
  };
};

export const useModals = () => {
  const { modals, openModal, closeModal, closeAllModals, getModalData } = useUI();
  return { 
    ...modals, 
    open: openModal, 
    close: closeModal, 
    closeAll: closeAllModals, 
    getData: getModalData 
  };
};

export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearAllNotifications } = useUI();
  return { 
    ...notifications, 
    add: addNotification, 
    remove: removeNotification, 
    clear: clearAllNotifications 
  };
};

export const useGlobalLoading = () => {
  const { loading, setGlobalLoading, setPageLoading, setOperationLoading } = useUI();
  return { 
    ...loading, 
    setGlobal: setGlobalLoading, 
    setPage: setPageLoading, 
    setOperation: setOperationLoading 
  };
};

export const useGlobalSearch = () => {
  const { search, setGlobalSearch, addToSearchHistory, clearSearchHistory } = useUI();
  return { 
    ...search, 
    setTerm: setGlobalSearch, 
    addToHistory: addToSearchHistory, 
    clearHistory: clearSearchHistory 
  };
};