/**
 * PRESENTATION: LoginFormPresentation
 * Interface de usuário para sistema de login/registro
 * Extraído de LoginNew.tsx (1012 linhas) para modularização
 */
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Users, BarChart3, Zap, ShoppingBag, TrendingUp, Shield, Crown, UserPlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';

// Import components
import { RegisterModal } from '../RegisterModal/RegisterModal';
import { ForgotPasswordModal } from '../ForgotPasswordModal/ForgotPasswordModal';

// Import types
import { 
  LoginFormProps, 
  RegisterModalProps, 
  ModalStates
} from '../../types';

import logoPath from '@assets/Asset 14-8_1752953662731.png';

// ===== COMPONENT PROPS =====
interface LoginFormPresentationProps {
  loginProps: LoginFormProps;
  registerProps: RegisterModalProps;
  modalProps: {
    modalStates: ModalStates;
    onOpenRegister: () => void;
    onCloseAll: () => void;
  };
}

export const LoginFormPresentation = ({
  loginProps,
  registerProps,
  modalProps
}: LoginFormPresentationProps) => {
  
  // ===== AUTHENTICATION CHECK =====
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Se o usuário já está logado, não mostra elementos internos
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Você já está logado!</h2>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Ir para Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }



  return (
    <>
      <Helmet>
        <title>Login - Guilherme Vasques | Plataforma de E-commerce</title>
        <meta 
          name="description" 
          content="Acesse sua conta na plataforma de e-commerce mais completa. Gerencie fornecedores, analise dados e automatize processos com inteligência artificial." 
        />
        <meta name="keywords" content="login, e-commerce, fornecedores, análise de dados, automação" />
        <meta property="og:title" content="Login - Guilherme Vasques | Plataforma de E-commerce" />
        <meta property="og:description" content="Acesse sua conta e descubra ferramentas avançadas para seu negócio online." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://guilhermevasques.replit.app/login" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        
        {/* Simple Public Header */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <img src={logoPath} alt="Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">Plataforma de E-commerce</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Section - Public Version */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Acesse sua
                  <span className="text-blue-600"> Plataforma</span> de
                  <span className="text-green-600"> E-commerce</span>
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Entre na sua conta para acessar suas ferramentas de gestão e análise.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={modalProps.onOpenRegister}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar Conta
                </Button>
              </div>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Fazer Login</h2>
                  <p className="text-gray-600">Entre na sua conta para acessar a plataforma</p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={loginProps.onSubmit} className="space-y-4">
                    
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginProps.formData.email}
                          onChange={loginProps.onInputChange('email')}
                          className={`pl-10 ${loginProps.errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {loginProps.errors.email && (
                        <p className="text-sm text-red-600">{loginProps.errors.email}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={loginProps.showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginProps.formData.password}
                          onChange={loginProps.onInputChange('password')}
                          className={`pl-10 pr-10 ${loginProps.errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={loginProps.onTogglePassword}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {loginProps.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginProps.errors.password && (
                        <p className="text-sm text-red-600">{loginProps.errors.password}</p>
                      )}
                    </div>

                    {/* General Error */}
                    {loginProps.errors.general && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{loginProps.errors.general}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loginProps.isLoading}
                    >
                      {loginProps.isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    {/* Forgot Password */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={loginProps.onForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Esqueceu sua senha?
                      </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <button
                          type="button"
                          onClick={modalProps.onOpenRegister}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Criar conta gratuita
                        </button>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Simple Footer for Public Page */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              Precisa de ajuda? Entre em contato conosco.
            </p>
          </div>
        </div>

        {/* Simple Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-600">
              © 2025 Plataforma de E-commerce. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <RegisterModal {...registerProps} />
      
      <ForgotPasswordModal
        isOpen={modalProps.modalStates.isForgotPasswordModalOpen}
        onClose={() => modalProps.onCloseAll()}
        formData={{ identifier: '', type: 'email' }}
        errors={{}}
        isLoading={false}
        onInputChange={() => () => {}}
        onTypeChange={() => {}}
        onSubmit={async () => {}}
        onOpenCodeModal={() => {}}
      />
    </>
  );
};