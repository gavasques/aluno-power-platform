/**
 * COMPONENTE: ForgotPasswordModal
 * Modal de recuperação de senha
 * Extraído de LoginNew.tsx para modularização
 */
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ForgotPasswordModalProps } from '../../types';

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  formData,
  errors,
  isLoading,
  onInputChange,
  onTypeChange,
  onSubmit,
  onOpenCodeModal
}: ForgotPasswordModalProps) => {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar Senha</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Recovery Method */}
          <div className="space-y-3">
            <Label>Como deseja recuperar sua senha?</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={(value: 'email' | 'phone') => onTypeChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-recovery" />
                <Label htmlFor="email-recovery" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Por Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-recovery" />
                <Label htmlFor="phone-recovery" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Por SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Identifier Field */}
          <div className="space-y-2">
            <Label htmlFor="identifier">
              {formData.type === 'email' ? 'Email' : 'Telefone'}
            </Label>
            <div className="relative">
              {formData.type === 'email' ? (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              ) : (
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                id="identifier"
                type={formData.type === 'email' ? 'email' : 'tel'}
                placeholder={formData.type === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                value={formData.identifier}
                onChange={onInputChange('identifier')}
                className={`pl-10 ${errors.identifier ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.identifier && (
              <p className="text-sm text-red-600">{errors.identifier}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </Button>

          {/* Help Text */}
          <p className="text-sm text-gray-600 text-center">
            Você receberá um código de verificação para redefinir sua senha.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};