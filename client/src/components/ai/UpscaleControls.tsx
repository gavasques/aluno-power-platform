import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, Sparkles, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpscaleControlsProps {
  selectedScale: 2 | 4;
  onScaleChange: (scale: 2 | 4) => void;
  onUpscale: () => void;
  isProcessing: boolean;
}

export function UpscaleControls({
  selectedScale,
  onScaleChange,
  onUpscale,
  isProcessing,
}: UpscaleControlsProps) {
  const scaleOptions = [
    {
      value: 2,
      title: "2x Upscale",
      description: "Dobra a resolução rapidamente",
      icon: Sparkles,
      time: "~30s",
      color: "blue",
    },
    {
      value: 4,
      title: "4x Upscale",
      description: "Quadruplica a resolução com máxima qualidade",
      icon: Rocket,
      time: "~60s",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scale Selection */}
      <RadioGroup
        value={selectedScale.toString()}
        onValueChange={(value) => onScaleChange(parseInt(value) as 2 | 4)}
        className="space-y-4"
      >
        {scaleOptions.map((option) => {
          const isSelected = selectedScale === option.value;
          const IconComponent = option.icon;
          
          return (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value.toString()}
                id={`scale-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`scale-${option.value}`}
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected
                    ? option.color === "blue"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-purple-500 bg-purple-50 dark:bg-purple-950"
                    : "border-border hover:border-muted-foreground",
                  isProcessing && "pointer-events-none opacity-60"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg flex items-center justify-center",
                  isSelected 
                    ? option.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-purple-100 dark:bg-purple-900"
                    : "bg-muted"
                )}>
                  <IconComponent className={cn(
                    "h-6 w-6",
                    isSelected 
                      ? option.color === "blue"
                        ? "text-blue-600"
                        : "text-purple-600"
                      : "text-muted-foreground"
                  )} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "font-semibold",
                      isSelected 
                        ? option.color === "blue"
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-purple-900 dark:text-purple-100"
                        : ""
                    )}>
                      {option.title}
                    </h3>
                    <span className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      isSelected 
                        ? option.color === "blue"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {option.time}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm mt-1",
                    isSelected 
                      ? option.color === "blue"
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-purple-700 dark:text-purple-300"
                      : "text-muted-foreground"
                  )}>
                    {option.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 border-white",
                    option.color === "blue" ? "bg-blue-500" : "bg-purple-500"
                  )} />
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Processing Info */}
      {isProcessing && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Processando imagem...
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Isso pode levar alguns segundos. Não feche a página.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Button
        onClick={onUpscale}
        disabled={isProcessing}
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            Fazer Upscale {selectedScale}x
          </>
        )}
      </Button>

      {/* Tips */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-blue-500 rounded-full" />
          <span>2x é ideal para imagens que precisam de processamento rápido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-purple-500 rounded-full" />
          <span>4x oferece máxima qualidade para impressão ou ampliação</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 bg-green-500 rounded-full" />
          <span>O resultado será otimizado automaticamente</span>
        </div>
      </div>
    </div>
  );
}