import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  className?: string;
}

/**
 * Standardized Loading Components
 * Replaces 60+ duplicate loading implementations across the codebase
 */

// Page-level loading state - replaces full-page loading patterns
export function PageLoadingState({ 
  message = "Carregando...", 
  className = "" 
}: { message?: string; className?: string }) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Card content loading state
export function CardLoadingState({ 
  message = "Carregando...", 
  className = "" 
}: { message?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// Table loading state
export function TableLoadingState({ 
  message = "Carregando dados...", 
  className = "" 
}: { message?: string; className?: string }) {
  return (
    <div className={cn("text-center py-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// List loading state
export function ListLoadingState({ 
  message = "Carregando lista...", 
  className = "" 
}: { message?: string; className?: string }) {
  return (
    <div className={cn("p-6", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Button with loading state - replaces all button loading patterns
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  loadingText,
  disabled,
  children,
  className,
  variant = "default",
  size = "default",
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? (loadingText || children) : children}
    </Button>
  );
}

// Inline loading text
export function LoadingText({ 
  text = "Carregando...", 
  className = "" 
}: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

// Overlay loading state
export function LoadingOverlay({ 
  message = "Processando...", 
  show = true,
  className = "" 
}: { message?: string; show?: boolean; className?: string }) {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white rounded-lg p-6 text-center shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loading patterns
export function SkeletonCard({ className = "" }: LoadingStateProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

// Hook for loading states management
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const isLoading = (key: string) => !!loadingStates[key];

  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
}

export default {
  PageLoadingState,
  CardLoadingState,
  TableLoadingState,
  ListLoadingState,
  LoadingButton,
  LoadingText,
  LoadingOverlay,
  SkeletonCard,
  SkeletonTable,
  useLoadingStates,
};