/**
 * Header component for Upscale PRO tool
 */

import { ZoomIn, Coins } from 'lucide-react';
import { Badge, Separator } from '@/components/ui';
import { UPSCALE_CONFIG } from '../constants';

export const UpscaleHeader = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <ZoomIn className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upscale PRO</h1>
            <p className="text-muted-foreground">Aumente a qualidade das suas imagens com IA</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
          <Coins className="h-4 w-4" />
          {UPSCALE_CONFIG.creditsPerUse} créditos por uso
        </Badge>
      </div>
      <Separator />
    </>
  );
};