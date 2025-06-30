import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Componentes modulares
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
    setActiveTab('login');
  };

  return (
    <AuthLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
          <TabsTrigger value="forgot">Esqueci</TabsTrigger>
          <TabsTrigger value="magic">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4 mt-6">
          <LoginForm onSuccess={handleAuthSuccess} />
        </TabsContent>

        <TabsContent value="register" className="space-y-4 mt-6">
          <RegisterForm onSuccess={handleAuthSuccess} />
        </TabsContent>

        <TabsContent value="forgot" className="space-y-4 mt-6">
          <ForgotPasswordForm onBack={handleBackToLogin} />
        </TabsContent>

        <TabsContent value="magic" className="space-y-4 mt-6">
          <MagicLinkForm onBack={handleBackToLogin} />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}