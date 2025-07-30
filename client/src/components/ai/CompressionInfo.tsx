
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Archive, FileImage, Zap } from "lucide-react";

interface CompressionInfoProps {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format?: string;
  className?: string;
}

export function CompressionInfo({
  originalSize,
  compressedSize,
  compressionRatio,
  format,
  className,
}: CompressionInfoProps) {
  const formatBytes = (bytes: number): string => {
    const { formatFileSize } = require('@/lib/utils/unifiedFormatters');
    return formatFileSize(bytes);
  };

  const getCompressionColor = (ratio: number): string => {
    if (ratio >= 70) return 'text-green-600 bg-green-100';
    if (ratio >= 50) return 'text-blue-600 bg-blue-100';
    if (ratio >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className={`p-3 space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Compressão Aplicada</span>
        {format && (
          <Badge variant="outline" className="text-xs">
            {format.toUpperCase()}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <FileImage className="h-3 w-3 text-gray-500" />
          <div>
            <div className="text-gray-500">Original</div>
            <div className="font-medium">{formatBytes(originalSize)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-green-500" />
          <div>
            <div className="text-gray-500">Comprimido</div>
            <div className="font-medium">{formatBytes(compressedSize)}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-xs text-gray-500">Economia de espaço:</span>
        <Badge className={getCompressionColor(compressionRatio)}>
          {compressionRatio.toFixed(1)}%
        </Badge>
      </div>
      
      <div className="text-xs text-gray-500">
        Economia: {formatBytes(originalSize - compressedSize)}
      </div>
    </Card>
  );
}
