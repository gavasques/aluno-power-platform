/**
 * Email Service - SMTP Integration for Core Guilherme Vasques
 * Handles password recovery, notifications, and user communications
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error(`[EMAIL_SERVICE] Missing environment variables: ${missingVars.join(', ')}`);
        this.isConfigured = false;
        return;
      }
      
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST?.trim(),
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER?.trim(),
          pass: process.env.SMTP_PASS?.trim(),
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      this.isConfigured = true;
      console.log('✅ [EMAIL_SERVICE] SMTP transporter initialized successfully');
      
      // Test the connection
      this.verifyConnection();
    } catch (error) {
      console.error('❌ [EMAIL_SERVICE] Failed to initialize transporter:', error);
      this.isConfigured = false;
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ [EMAIL_SERVICE] SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ [EMAIL_SERVICE] SMTP connection verification failed:', error);
      this.isConfigured = false;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('❌ [EMAIL_SERVICE] Cannot send email - service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'Core Guilherme Vasques',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL_SERVICE] Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL_SERVICE] Failed to send email:', error);
      return false;
    }
  }

  public async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<boolean> {
    // Use custom domain as primary, then BASE_URL, then REPLIT_DEV_DOMAIN fallback
    const baseUrl = 'https://core.guivasques.app' || 
                   process.env.BASE_URL || 
                   (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000');
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const template = this.getPasswordResetTemplate(resetUrl, userName);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  public async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  public async sendNotificationEmail(email: string, subject: string, message: string, userName?: string): Promise<boolean> {
    const template = this.getNotificationTemplate(subject, message, userName);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  private getPasswordResetTemplate(resetUrl: string, userName?: string): EmailTemplate {
    const displayName = userName || 'Usuário';
    
    return {
      subject: 'Redefinir sua senha - Core Guilherme Vasques',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .content { padding: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Core Guilherme Vasques</div>
            </div>
            
            <div class="content">
              <h2>Olá, ${displayName}!</h2>
              
              <p>Recebemos uma solicitação para redefinir sua senha. Se você não fez esta solicitação, pode ignorar este email.</p>
              
              <p>Para redefinir sua senha, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este link expira em 1 hora por segurança</li>
                  <li>Use apenas se você solicitou a redefinição</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
                </ul>
              </div>
              
              <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
              </p>
            </div>
            
            <div class="footer">
              <p>Esta é uma mensagem automática, não responda este email.</p>
              <p>© ${new Date().getFullYear()} Core Guilherme Vasques - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Olá, ${displayName}!
        
        Recebemos uma solicitação para redefinir sua senha.
        
        Para redefinir sua senha, acesse o link abaixo:
        ${resetUrl}
        
        IMPORTANTE:
        - Este link expira em 1 hora
        - Use apenas se você solicitou a redefinição
        - Nunca compartilhe este link
        
        Se você não fez esta solicitação, ignore este email.
        
        ---
        Core Guilherme Vasques
      `
    };
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Bem-vindo à Core Guilherme Vasques!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .content { padding: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
            .features { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Core Guilherme Vasques</div>
            </div>
            
            <div class="content">
              <h2>Bem-vindo, ${userName}! 🎉</h2>
              
              <p>Ficamos muito felizes em tê-lo conosco na plataforma Core Guilherme Vasques!</p>
              
              <div class="features">
                <h3>O que você pode fazer agora:</h3>
                <ul>
                  <li><strong>🤖 Agentes de IA:</strong> Mais de 10 agentes especializados em Amazon FBA</li>
                  <li><strong>🔧 Ferramentas:</strong> Geração de imagens, análise de keywords e muito mais</li>
                  <li><strong>📊 Simuladores:</strong> Cálculos financeiros e análise de ROI</li>
                  <li><strong>📚 Hub de Recursos:</strong> Materiais, fornecedores e parcerias</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="https://core.guivasques.app" class="button">Acessar Plataforma</a>
              </div>
              
              <p>Se tiver dúvidas, nossa equipe de suporte está sempre disponível para ajudar!</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Core Guilherme Vasques - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Bem-vindo, ${userName}!
        
        Ficamos muito felizes em tê-lo conosco na plataforma Core Guilherme Vasques!
        
        O que você pode fazer agora:
        - Agentes de IA especializados em Amazon FBA
        - Ferramentas de geração de imagens e análise
        - Simuladores financeiros e análise de ROI
        - Hub de recursos, materiais e fornecedores
        
        Acesse: https://core.guivasques.app
        
        ---
        Core Guilherme Vasques
      `
    };
  }

  private getNotificationTemplate(subject: string, message: string, userName?: string): EmailTemplate {
    const displayName = userName || 'Usuário';
    
    return {
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .content { padding: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Core Guilherme Vasques</div>
            </div>
            
            <div class="content">
              <h2>Olá, ${displayName}!</h2>
              <div>${message}</div>
            </div>
            
            <div class="footer">
              <p>Esta é uma mensagem automática, não responda este email.</p>
              <p>© ${new Date().getFullYear()} Core Guilherme Vasques - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Olá, ${displayName}!
        
        ${this.htmlToText(message)}
        
        ---
        Core Guilherme Vasques
      `
    };
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  public isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;