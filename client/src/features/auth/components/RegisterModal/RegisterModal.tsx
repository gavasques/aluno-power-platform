/**
 * COMPONENTE: RegisterModal
 * Modal de registro de usuário
 * Extraído de LoginNew.tsx para modularização
 */
import { Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RegisterModalProps } from '../../types';

export const RegisterModal = ({
  isOpen,
  onClose,
  formData,
  errors,
  showPassword,
  isLoading,
  onInputChange,
  onSubmit,
  onTogglePassword
}: RegisterModalProps) => {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Conta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="register-name">Nome Completo</Label>
            <Input
              id="register-name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => onInputChange('name')(e)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => onInputChange('email')(e)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="register-phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="register-phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => onInputChange('phone')(e)}
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="register-password">Senha</Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha"
                value={formData.password}
                onChange={(e) => onInputChange('password')(e)}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={(e) => onInputChange('confirmPassword')(e)}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptedTerms}
              onCheckedChange={(checked) => onInputChange('acceptedTerms')(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceito os termos de uso
              </Label>
              <p className="text-xs text-muted-foreground">
                Ao se registrar, você concorda com nossos{' '}
                <a href="/termos" className="text-blue-600 hover:underline">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          </div>
          {errors.acceptedTerms && (
            <p className="text-sm text-red-600">{errors.acceptedTerms}</p>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};