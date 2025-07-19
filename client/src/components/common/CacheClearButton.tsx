import { RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoCacheRequest } from "@/hooks/useNoCacheRequest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface CacheClearButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
  className?: string;
}

export function CacheClearButton({ 
  variant = "outline", 
  size = "sm", 
  showText = false,
  className = ""
}: CacheClearButtonProps) {
  const { clearCache, refreshPreview, hardRefresh, isClearing } = useNoCacheRequest();

  const handleClearCache = async () => {
    await clearCache();
  };

  const handleRefreshPreview = async () => {
    await refreshPreview();
  };

  const handleHardRefresh = () => {
    hardRefresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={isClearing}
          className={className}
        >
          {isClearing ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {showText && (
            <span className="ml-2">
              {isClearing ? "Limpando..." : "Limpar Cache"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleClearCache} disabled={isClearing}>
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Cache do Servidor
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleRefreshPreview} disabled={isClearing}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Atualizar Preview
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleHardRefresh} disabled={isClearing}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Recarregar Página Completa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple cache clear button without dropdown (for minimal usage)
 */
export function SimpleCacheClearButton({ 
  variant = "outline", 
  size = "sm",
  className = ""
}: Omit<CacheClearButtonProps, 'showText'>) {
  const { refreshPreview, isClearing } = useNoCacheRequest();

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={refreshPreview}
      disabled={isClearing}
      className={className}
      title="Limpar cache do preview"
    >
      {isClearing ? (
        <RefreshCcw className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
    </Button>
  );
}