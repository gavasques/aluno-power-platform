import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { logger } from '@/utils/logger';

interface StripeCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  checkoutUrl: string;
}

export function StripeCheckoutModal({ open, onClose, checkoutUrl }: StripeCheckoutModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (open && checkoutUrl) {
      logger.debug('🔍 [STRIPE MODAL] Opening checkout modal with URL:', checkoutUrl);
      
      // Redirect immediately in the same window
      window.location.href = checkoutUrl;
    }
  }, [open, checkoutUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 overflow-hidden">
        <div className="relative w-full h-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Redirecionando para o checkout...</p>
              <p className="text-sm text-gray-600 mt-2">Você será redirecionado automaticamente</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}