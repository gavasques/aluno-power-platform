/**
 * Utility to prevent duplicate loading states
 * Helps avoid showing multiple "Carregando..." messages simultaneously
 */

let activeLoadingStates = new Set<string>();
let loadingTimeout: NodeJS.Timeout | null = null;

export interface LoadingDebounceOptions {
  key: string;
  delay?: number;
  onStateChange?: (isLoading: boolean) => void;
}

/**
 * Debounced loading state to prevent multiple loading messages
 */
export function useDebouncedLoading(options: LoadingDebounceOptions) {
  const { key, delay = 300, onStateChange } = options;
  
  const startLoading = () => {
    if (activeLoadingStates.has(key)) return;
    
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    activeLoadingStates.add(key);
    onStateChange?.(true);
  };
  
  const stopLoading = () => {
    activeLoadingStates.delete(key);
    
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    loadingTimeout = setTimeout(() => {
      if (activeLoadingStates.size === 0) {
        onStateChange?.(false);
      }
    }, delay);
  };
  
  const hasActiveLoading = () => activeLoadingStates.size > 0;
  const isCurrentKeyLoading = () => activeLoadingStates.has(key);
  
  return {
    startLoading,
    stopLoading,
    hasActiveLoading,
    isCurrentKeyLoading,
    activeCount: activeLoadingStates.size
  };
}

/**
 * Global loading state manager to coordinate all loading states
 */
export class LoadingCoordinator {
  private static instance: LoadingCoordinator;
  private activeStates = new Map<string, boolean>();
  private listeners = new Set<(states: Map<string, boolean>) => void>();
  
  static getInstance(): LoadingCoordinator {
    if (!LoadingCoordinator.instance) {
      LoadingCoordinator.instance = new LoadingCoordinator();
    }
    return LoadingCoordinator.instance;
  }
  
  setLoading(key: string, isLoading: boolean) {
    if (isLoading) {
      this.activeStates.set(key, true);
    } else {
      this.activeStates.delete(key);
    }
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(new Map(this.activeStates)));
  }
  
  isAnyLoading(): boolean {
    return this.activeStates.size > 0;
  }
  
  getActiveStates(): string[] {
    return Array.from(this.activeStates.keys());
  }
  
  subscribe(callback: (states: Map<string, boolean>) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  clear() {
    this.activeStates.clear();
    this.listeners.forEach(listener => listener(new Map()));
  }
}

/**
 * Hook to coordinate loading states globally
 */
export function useGlobalLoadingCoordinator(key: string) {
  const coordinator = LoadingCoordinator.getInstance();
  
  return {
    setLoading: (isLoading: boolean) => coordinator.setLoading(key, isLoading),
    isAnyLoading: () => coordinator.isAnyLoading(),
    getActiveStates: () => coordinator.getActiveStates(),
    subscribe: (callback: (states: Map<string, boolean>) => void) => coordinator.subscribe(callback)
  };
}