/**
 * Evolution API WhatsApp Integration Service
 * Handles phone verification and WhatsApp messaging
 */

interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

interface WhatsAppMessagePayload {
  number: string;
  text: string;
}

interface SendMessageResponse {
  key: {
    id: string;
    remoteJid: string;
    fromMe: boolean;
  };
  message: any;
  messageTimestamp: string;
  status: string;
}

class EvolutionAPIService {
  private apiUrl: string;
  private apiKey: string;
  private instanceName: string;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    try {
      const apiUrl = process.env.EVOLUTION_API_URL?.trim();
      const apiKey = process.env.EVOLUTION_API_KEY?.trim();
      const instanceName = process.env.EVOLUTION_INSTANCE_NAME?.trim();

      if (!apiUrl || !apiKey || !instanceName) {
        console.error('[EVOLUTION_API] Missing required environment variables');
        this.isConfigured = false;
        return;
      }

      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.instanceName = instanceName;
      this.isConfigured = true;

      console.log('✅ [EVOLUTION_API] Service initialized successfully');
      this.verifyConnection();
    } catch (error) {
      console.error('[EVOLUTION_API] Initialization failed:', error);
      this.isConfigured = false;
    }
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  private async verifyConnection(): Promise<void> {
    if (!this.isConfigured) return;

    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [EVOLUTION_API] Connection verified successfully:', data.state);
      } else {
        console.warn(`⚠️ [EVOLUTION_API] Connection check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [EVOLUTION_API] Connection verification error:', error);
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Se não tem código do país, assume Brasil (+55)
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Remove o 0 inicial e adiciona 55
      cleaned = '55' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      // Adiciona 55 para números de 10 dígitos
      cleaned = '55' + cleaned;
    } else if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      // Adiciona 55 para números de 11 dígitos sem código do país
      cleaned = '55' + cleaned;
    }

    // Adiciona @s.whatsapp.net para formato do WhatsApp
    return cleaned + '@s.whatsapp.net';
  }

  public async sendMessage(phone: string, message: string): Promise<EvolutionAPIResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Evolution API service not configured'
      };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const payload: WhatsAppMessagePayload = {
        number: formattedPhone,
        text: message
      };

      console.log(`[EVOLUTION_API] Sending message to ${phone} (formatted: ${formattedPhone})`);

      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[EVOLUTION_API] HTTP Error ${response.status}:`, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const data: SendMessageResponse = await response.json();
      console.log('✅ [EVOLUTION_API] Message sent successfully:', data.key.id);

      return {
        success: true,
        message: 'Message sent successfully',
        data: data
      };

    } catch (error) {
      console.error('❌ [EVOLUTION_API] Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async sendPhoneVerificationCode(phone: string, code: string, userName?: string): Promise<boolean> {
    const displayName = userName || 'Usuário';
    
    const message = `🔐 *Core Guilherme Vasques*

Olá, ${displayName}!

Seu código de verificação é: *${code}*

Este código expira em 10 minutos. Use-o para confirmar seu telefone na plataforma.

⚠️ *Importante:*
• Não compartilhe este código
• Use apenas no site oficial
• Código válido por 10 minutos

---
© Core Guilherme Vasques`;

    const result = await this.sendMessage(phone, message);
    return result.success;
  }

  public async sendWelcomeMessage(phone: string, userName: string): Promise<boolean> {
    const message = `🎉 *Bem-vindo à Core Guilherme Vasques!*

Olá, ${userName}!

Sua conta foi criada com sucesso! Agora você tem acesso a:

🤖 *Agentes de IA* especializados em Amazon FBA
🔧 *Ferramentas* de otimização e análise
📊 *Simuladores* financeiros avançados
📚 *Hub de Recursos* completo

Acesse: https://core.guivasques.app

Bem-vindo à nossa comunidade!

---
© Core Guilherme Vasques`;

    const result = await this.sendMessage(phone, message);
    return result.success;
  }

  public async getInstanceInfo(): Promise<EvolutionAPIResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Evolution API service not configured'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ [EVOLUTION_API] Error getting instance info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export default new EvolutionAPIService();