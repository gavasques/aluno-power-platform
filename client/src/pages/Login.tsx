import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Componentes modulares
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';

type AuthView = 'login' | 'register' | 'forgot' | 'magic';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  // If user is logged in, don't render login page
  if (user) {
    return null;
  }

  const handleAuthSuccess = () => {
    setLocation('/');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const getViewConfig = () => {
    switch (currentView) {
      case 'login':
        return {
          title: 'Bem-vindo',
          subtitle: 'Faça login ou crie sua conta para começar'
        };
      case 'register':
        return {
          title: 'Criar conta',
          subtitle: 'Preencha os dados para criar sua conta'
        };
      case 'forgot':
        return {
          title: 'Recuperar senha',
          subtitle: 'Digite seu email para receber o link de recuperação'
        };
      case 'magic':
        return {
          title: 'Magic Link',
          subtitle: 'Receba um link mágico para fazer login sem senha'
        };
      default:
        return {
          title: 'Bem-vindo',
          subtitle: 'Faça login ou crie sua conta para começar'
        };
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <div className="space-y-6">
            <LoginForm onSuccess={handleAuthSuccess} />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('magic')}
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Magic Link
                </button>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Não tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Criar conta
                </button>
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-6">
            <RegisterForm onSuccess={handleAuthSuccess} />
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Já tem uma conta? </span>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Fazer login
              </button>
            </div>
          </div>
        );

      case 'forgot':
        return <ForgotPasswordForm onBack={handleBackToLogin} />;

      case 'magic':
        return <MagicLinkForm onBack={handleBackToLogin} />;

      default:
        return null;
    }
  };

  const viewConfig = getViewConfig();

  return (
    <AuthLayout title={viewConfig.title} subtitle={viewConfig.subtitle}>
      {renderCurrentView()}
    </AuthLayout>
  );
}