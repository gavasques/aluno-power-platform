import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordCodeFormProps {
  onBack: () => void;
}

export function ForgotPasswordCodeForm({ onBack }: ForgotPasswordCodeFormProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendCode = async () => {
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite seu email.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar código');
      }

      toast({
        title: 'Código enviado!',
        description: 'Verifique seu email para o código de verificação.',
        variant: 'default'
      });

      setStep('code');
    } catch (error) {
      console.error('Error sending code:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro interno do servidor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: 'Erro',
        description: 'O código deve ter 6 dígitos.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Código inválido');
      }

      toast({
        title: 'Código verificado!',
        description: 'Agora defina sua nova senha.',
        variant: 'default'
      });

      setStep('password');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Código inválido ou expirado',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao redefinir senha');
      }

      toast({
        title: 'Sucesso!',
        description: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
        variant: 'default'
      });

      onBack();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro interno do servidor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              {step === 'email' && 'Digite seu email para receber o código'}
              {step === 'code' && 'Digite o código enviado para seu email'}
              {step === 'password' && 'Defina sua nova senha'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, sendCode)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              onClick={sendCode} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          </>
        )}

        {/* Step 2: Code */}
        {step === 'code' && (
          <>
            <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Código enviado para: <strong>{email}</strong></span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                onKeyPress={(e) => handleKeyPress(e, verifyCode)}
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Digite o código de 6 dígitos enviado para seu email
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('email')}
                className="flex-1"
                disabled={isLoading}
              >
                Voltar
              </Button>
              <Button 
                onClick={verifyCode} 
                className="flex-1" 
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={sendCode}
                disabled={isLoading}
                className="text-sm"
              >
                Reenviar código
              </Button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <>
            <div className="text-sm text-green-600 mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Código verificado com sucesso!</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, resetPassword)}
                disabled={isLoading}
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Sua senha deve conter:</p>
              <ul className="ml-4 space-y-1">
                <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                  • Pelo menos 8 caracteres
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                  • Uma letra minúscula
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                  • Uma letra maiúscula
                </li>
                <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                  • Um número
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={resetPassword} 
              className="w-full" 
              disabled={isLoading || !newPassword || newPassword !== confirmPassword}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}