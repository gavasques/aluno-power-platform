/**
 * Phone Verification Page
 * Handles WhatsApp phone verification flow
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface PhoneStatus {
  phone: string | null;
  phoneVerified: boolean;
  hasVerificationPending: boolean;
}

export default function PhoneVerification() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code' | 'verified'>('phone');
  
  const [formData, setFormData] = useState({
    phone: '',
    code: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPhoneStatus();
  }, []);

  const loadPhoneStatus = async () => {
    try {
      const response = await fetch('/api/phone/status');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar status');
      }

      const data = await response.json();
      
      if (data.success) {
        setPhoneStatus(data.data);
        
        if (data.data.phoneVerified) {
          setStep('verified');
        } else if (data.data.hasVerificationPending && data.data.phone) {
          setFormData(prev => ({ ...prev, phone: data.data.phone }));
          setStep('code');
        } else if (data.data.phone) {
          setFormData(prev => ({ ...prev, phone: data.data.phone }));
        }
      }
    } catch (error) {

      toast({
        title: "Erro",
        description: "Erro ao carregar informações do telefone",
        variant: "destructive",
      });
    }
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/phone/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Código Enviado!",
          description: "Verifique seu WhatsApp para o código de verificação",
        });
        setStep('code');
        loadPhoneStatus();
      } else {
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          data.errors.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          toast({
            title: "Erro",
            description: data.message || "Erro ao enviar código de verificação",
            variant: "destructive",
          });
        }
      }
    } catch (error) {

      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/phone/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          code: formData.code
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Telefone Verificado!",
          description: "Seu telefone foi verificado com sucesso",
        });
        setStep('verified');
        loadPhoneStatus();
      } else {
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          data.errors.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          toast({
            title: "Erro",
            description: data.message || "Código de verificação inválido",
            variant: "destructive",
          });
        }
      }
    } catch (error) {

      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified' && phoneStatus?.phoneVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Helmet>
          <title>Telefone Verificado - Core Guilherme Vasques</title>
        </Helmet>

        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Telefone Verificado!
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                Seu número {phoneStatus.phone} foi verificado com sucesso
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="text-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-400">
                    ✅ Agora você pode receber notificações via WhatsApp
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setLocation('/user/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  >
                    Ir para Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setLocation('/login')}
                    className="w-full h-12 text-gray-600 dark:text-gray-400"
                  >
                    Voltar para Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Helmet>
        <title>Verificação de Telefone - Core Guilherme Vasques</title>
      </Helmet>

      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              {step === 'phone' ? (
                <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {step === 'phone' ? 'Verificar Telefone' : 'Confirmar Código'}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              {step === 'phone' 
                ? 'Adicione seu telefone para receber notificações via WhatsApp'
                : 'Digite o código de 6 dígitos enviado para seu WhatsApp'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            {step === 'phone' ? (
              <form onSubmit={handleSendVerification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone com WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={isLoading}
                    className={`h-12 text-base bg-white dark:bg-gray-700 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    📱 Como funciona:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Enviamos um código via WhatsApp</li>
                    <li>• Digite o código de 6 dígitos</li>
                    <li>• Seu telefone ficará verificado</li>
                    <li>• Receberá notificações importantes</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enviar Código via WhatsApp
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/login')}
                    disabled={isLoading}
                    className="w-full h-12 text-gray-600 dark:text-gray-400"
                  >
                    Voltar para Login
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código de Verificação
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="123456"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className={`h-12 text-base text-center font-mono tracking-widest bg-white dark:bg-gray-700 ${
                      errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.code}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    📱 Código enviado para: <strong>{formData.phone}</strong>
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    O código expira em 10 minutos
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || formData.code.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verificar Código
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone')}
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    Alterar Telefone
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation('/login')}
                    disabled={isLoading}
                    className="w-full h-12 text-gray-600 dark:text-gray-400"
                  >
                    Voltar para Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}