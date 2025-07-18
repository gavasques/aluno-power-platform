import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";
import { SCALE_OPTIONS, UPSCALE_ICONS } from "@/config/upscale";
import type { ScaleOption } from "@/types/upscale";

interface UpscaleControlsProps {
  selectedScale: ScaleOption;
  onScaleChange: (scale: ScaleOption) => void;
  onUpscale: () => void;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
}

const ScaleOptionCard = ({ 
  option, 
  isSelected, 
  isProcessing 
}: {
  option: (typeof SCALE_OPTIONS)[0];
  isSelected: boolean;
  isProcessing: boolean;
}) => {
  const IconComponent = UPSCALE_ICONS[option.value];

  return (
    <div className="relative">
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
};

const ProcessingInfo = () => (
  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" className="text-yellow-600" />
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
);

const UploadingInfo = () => (
  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" className="text-blue-600" />
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">
            Carregando imagem...
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Por favor, aguarde enquanto sua imagem é carregada.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UpscaleButton = ({ 
  selectedScale, 
  isProcessing, 
  isUploading,
  hasUploadedImage,
  onUpscale 
}: {
  selectedScale: ScaleOption;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
  onUpscale: () => void;
}) => {
  const isDisabled = isProcessing || isUploading || !hasUploadedImage;

  return (
    <Button
      onClick={onUpscale}
      disabled={isDisabled}
      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
    >
      {isProcessing ? (
        <>
          <ButtonLoader />
          Processando...
        </>
      ) : isUploading ? (
        <>
          <ButtonLoader />
          Carregando imagem...
        </>
      ) : !hasUploadedImage ? (
        <>
          <Zap className="mr-2 h-5 w-5" />
          Selecione uma imagem primeiro
        </>
      ) : (
        <>
          <Zap className="mr-2 h-5 w-5" />
          Fazer Upscale {selectedScale}x
        </>
      )}
    </Button>
  );
};

const UpscaleTips = () => (
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
);

export function UpscaleControls({
  selectedScale,
  onScaleChange,
  onUpscale,
  isProcessing,
  isUploading,
  hasUploadedImage,
}: UpscaleControlsProps) {
  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedScale.toString()}
        onValueChange={(value) => onScaleChange(parseInt(value) as ScaleOption)}
        className="space-y-4"
      >
        {SCALE_OPTIONS.map((option) => (
          <ScaleOptionCard
            key={option.value}
            option={option}
            isSelected={selectedScale === option.value}
            isProcessing={isProcessing || isUploading}
          />
        ))}
      </RadioGroup>

      {isUploading && <UploadingInfo />}
      {isProcessing && <ProcessingInfo />}
      
      <UpscaleButton
        selectedScale={selectedScale}
        isProcessing={isProcessing}
        isUploading={isUploading}
        hasUploadedImage={hasUploadedImage}
        onUpscale={onUpscale}
      />

      <UpscaleTips />
    </div>
  );
}