import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
  variant?: "outline" | "secondary" | "default";
  size?: "sm" | "default" | "lg";
}

export const ResetButton = ({ 
  onReset, 
  disabled = false,
  variant = "outline",
  size = "default"
}: ResetButtonProps) => (
  <div className="flex justify-center pt-6">
    <Button 
      onClick={onReset}
      disabled={disabled}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Recomeçar
    </Button>
  </div>
);