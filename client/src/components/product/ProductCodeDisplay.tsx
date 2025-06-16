
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductCodeDisplayProps {
  code?: string;
  placeholder?: string;
}

export const ProductCodeDisplay = ({ code, placeholder = "Sem código" }: ProductCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "O código foi copiado para a área de transferência."
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive"
      });
    }
  };

  if (!code) {
    return (
      <span className="text-xs text-muted-foreground italic">
        {placeholder}
      </span>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
      title="Clique para copiar"
    >
      <span className="font-mono">{code}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};
