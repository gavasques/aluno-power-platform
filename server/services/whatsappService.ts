/**
 * WhatsApp Service - Integração com Evolution API
 * Responsável pelo envio de códigos de verificação via WhatsApp
 */

import crypto from 'crypto';

interface WhatsAppMessage {
  phone: string;
  message: string;
}

interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class WhatsAppService {
  private readonly evolutionApiUrl: string;
  private readonly evolutionApiKey: string;
  private readonly instanceName: string;

  constructor() {
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'core-guilherme';
  }

  /**
   * Gera código de verificação de 6 dígitos
   */
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Formata número de telefone para WhatsApp (formato brasileiro)
   * Remove parênteses, espaços, hífens e adiciona código do país
   */
  private formatPhoneNumber(phone: string): string {
    // Remove formatação: (11) 99999-9999 -> 11999999999
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
      return '55' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Cria mensagem de verificação personalizada
   */
  private createVerificationMessage(code: string): string {
    return `🔐 *Core Guilherme Vasques*

Seu código de verificação é: *${code}*

Este código expira em 10 minutos.
Não compartilhe este código com ninguém.

Se você não solicitou este código, ignore esta mensagem.`;
  }

  /**
   * Envia mensagem via Evolution API
   */
  private async sendMessage(phone: string, message: string): Promise<EvolutionAPIResponse> {
    try {
      if (!this.evolutionApiUrl || !this.evolutionApiKey) {
        console.error('🚨 WhatsApp Service: Evolution API não configurado');
        return { 
          success: false, 
          error: 'Evolution API não configurado' 
        };
      }

      const formattedPhone = this.formatPhoneNumber(phone);
      
      console.log(`📱 [WHATSAPP] Enviando para: +${formattedPhone}`);

      const response = await fetch(`${this.evolutionApiUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.key) {
        console.log(`✅ [WHATSAPP] Mensagem enviada com sucesso: ${result.key.id}`);
        return { success: true, message: 'Mensagem enviada com sucesso' };
      } else {
        console.error(`❌ [WHATSAPP] Erro no envio:`, result);
        return { 
          success: false, 
          error: result.message || 'Erro ao enviar mensagem'
        };
      }
    } catch (error) {
      console.error('❌ [WHATSAPP] Erro de conexão:', error);
      return { 
        success: false, 
        error: 'Erro de conexão com WhatsApp'
      };
    }
  }

  /**
   * Envia código de verificação via WhatsApp
   */
  async sendVerificationCode(phone: string, code: string): Promise<EvolutionAPIResponse> {
    const message = this.createVerificationMessage(code);
    return this.sendMessage(phone, message);
  }

  /**
   * Verifica se Evolution API está disponível
   */
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.evolutionApiUrl || !this.evolutionApiKey) {
        return false;
      }

      const response = await fetch(`${this.evolutionApiUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.evolutionApiKey,
        },
      });

      const result = await response.json();
      return result.instance?.state === 'open';
    } catch (error) {
      console.error('❌ [WHATSAPP] Erro ao verificar conexão:', error);
      return false;
    }
  }

  /**
   * Envia mensagem de boas-vindas após verificação
   */
  async sendWelcomeMessage(phone: string, userName: string): Promise<void> {
    const welcomeMessage = `🎉 *Bem-vindo ao Core Guilherme Vasques, ${userName}!*

Sua conta foi verificada com sucesso! 

🚀 Agora você tem acesso a:
• +10 Agentes de IA especializados
• Ferramentas avançadas para Amazon
• Análises e relatórios profissionais
• Suporte completo da nossa equipe

Para começar, acesse: https://seu-dominio.com

Precisando de ajuda? Estamos aqui! 💪`;

    await this.sendMessage(phone, welcomeMessage);
  }
}

export const whatsappService = new WhatsAppService();