import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  // Initialize email transporter
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    // Force recreate transporter to apply new settings
    this.transporter = null;

    const port = parseInt(process.env.SMTP_PORT || '587');
    const config: EmailConfig = {
      host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
      port: port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER?.trim() || '',
        pass: process.env.SMTP_PASS?.trim() || '',
      },
    };

    console.log('📧 Configurando transporter SMTP:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user ? '✅ Configurado' : '❌ Não configurado',
      pass: config.auth.pass ? '✅ Configurado' : '❌ Não configurado'
    });

    this.transporter = nodemailer.createTransport(config);

    // Verify connection
    try {
      await this.transporter.verify();
      console.log('✅ Servidor SMTP conectado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar com servidor SMTP:', error);
      throw new Error('Falha na configuração SMTP');
    }

    return this.transporter;
  }

  // Send password reset email
  static async sendPasswordReset(email: string, resetToken: string, userName?: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      // Use custom domain only
      const baseUrl = 'https://core-guilherme-vasques.com.br';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
              <p>Core Guilherme Vasques</p>
            </div>
            <div class="content">
              <h2>Olá${userName ? `, ${userName}` : ''}!</h2>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
              </p>
              
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este link expira em <strong>1 hora</strong></li>
                  <li>Por segurança, use este link apenas uma vez</li>
                  <li>Se você não solicitou esta alteração, ignore este email</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Se você não conseguir clicar no botão, copie e cole o link acima no seu navegador.</p>
                <p>Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança.</p>
                <p><strong>Precisa de suporte?</strong><br>
                Envie email para suporte@guivasques.app</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Recuperação de Senha - Core Guilherme Vasques

Olá${userName ? `, ${userName}` : ''}!

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

IMPORTANTE:
- Este link expira em 1 hora
- Por segurança, use este link apenas uma vez  
- Se você não solicitou esta alteração, ignore este email

Se você não conseguir acessar o link, copie e cole no seu navegador.

Precisa de suporte?
Envie email para suporte@guivasques.app
      `;

      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Recuperação de Senha - Core Guilherme Vasques',
        text: textContent,
        html: htmlContent,
      };

      console.log('📧 Enviando email de recuperação para:', email);
      
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email de recuperação enviado com sucesso:', {
        messageId: result.messageId,
        to: email,
        response: result.response
      });

    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      throw new Error('Falha ao enviar email de recuperação');
    }
  }

  // Send subscription welcome email
  static async sendSubscriptionWelcome(email: string, planName: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `🎉 Bem-vindo ao plano ${planName}!`,
        html: `
          <h2>Bem-vindo ao Core Guilherme Vasques!</h2>
          <p>Sua assinatura do plano <strong>${planName}</strong> foi ativada com sucesso.</p>
          <p>Agora você tem acesso a todos os recursos exclusivos da plataforma.</p>
          <p>Acesse: <a href="https://core-guilherme-vasques.com.br">Core Guilherme Vasques</a></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de boas-vindas enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      // Don't throw error to prevent webhook failure
    }
  }

  static async sendSubscriptionCanceled(email: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Assinatura cancelada - Core Guilherme Vasques',
        html: `
          <h2>Assinatura Cancelada</h2>
          <p>Sua assinatura foi cancelada conforme solicitado.</p>
          <p>Você pode reativar sua assinatura a qualquer momento.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de cancelamento enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de cancelamento:', error);
    }
  }

  static async sendPaymentConfirmation(email: string, amount: number): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Pagamento confirmado - Core Guilherme Vasques',
        html: `
          <h2>Pagamento Confirmado</h2>
          <p>Seu pagamento de R$ ${amount.toFixed(2)} foi processado com sucesso.</p>
          <p>Obrigado por escolher o Core Guilherme Vasques!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmação de pagamento enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de confirmação:', error);
    }
  }

  static async sendPaymentFailed(email: string, amount: number): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Problema com pagamento - Core Guilherme Vasques',
        html: `
          <h2>Problema com Pagamento</h2>
          <p>Houve um problema ao processar seu pagamento de R$ ${amount.toFixed(2)}.</p>
          <p>Por favor, verifique seus dados de pagamento ou entre em contato conosco.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de falha de pagamento enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de falha:', error);
    }
  }

  static async sendCreditsPurchase(email: string, credits: number): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Créditos adicionados - Core Guilherme Vasques',
        html: `
          <h2>Créditos Adicionados</h2>
          <p>${credits} créditos foram adicionados à sua conta!</p>
          <p>Agora você pode usar nossos agentes de IA e ferramentas.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de compra de créditos enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de créditos:', error);
    }
  }

  static async sendRenewalReminder(email: string, planName: string, renewalDate: Date): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Lembrete de renovação - Core Guilherme Vasques',
        html: `
          <h2>Lembrete de Renovação</h2>
          <p>Seu plano ${planName} será renovado em ${renewalDate.toLocaleDateString('pt-BR')}.</p>
          <p>Certifique-se de que seus dados de pagamento estão atualizados.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de lembrete enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar lembrete:', error);
    }
  }

  static async sendTrialEnding(email: string, planName: string, endDate: Date): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"Core Guilherme Vasques" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Período de teste terminando - Core Guilherme Vasques',
        html: `
          <h2>Período de Teste Terminando</h2>
          <p>Seu período de teste do plano ${planName} termina em ${endDate.toLocaleDateString('pt-BR')}.</p>
          <p>Para continuar usando nossos serviços, faça a assinatura completa.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p><strong>Precisa de suporte?</strong><br>
            Envie email para suporte@guivasques.app</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de término de teste enviado para:', email);

    } catch (error) {
      console.error('❌ Erro ao enviar email de teste:', error);
    }
  }

  // Send subscription canceled email
  static async sendSubscriptionCanceled(email: string): Promise<void> {
    try {
      console.log(`📧 Sending subscription canceled email:`, {
        to: email,
        subject: 'Sua assinatura foi cancelada',
        template: 'subscription-canceled'
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending subscription canceled email:', error);
    }
  }

  // Send payment confirmation email
  static async sendPaymentConfirmation(email: string, amount: number): Promise<void> {
    try {
      console.log(`📧 Sending payment confirmation email:`, {
        to: email,
        subject: `Pagamento de R$ ${amount.toFixed(2)} confirmado`,
        template: 'payment-confirmation',
        data: { amount }
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  }

  // Send payment failed email
  static async sendPaymentFailed(email: string, amount: number): Promise<void> {
    try {
      console.log(`📧 Sending payment failed email:`, {
        to: email,
        subject: `Falha no pagamento de R$ ${amount.toFixed(2)}`,
        template: 'payment-failed',
        data: { amount }
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending payment failed email:', error);
    }
  }

  // Send credits purchase confirmation email
  static async sendCreditsPurchase(email: string, credits: number): Promise<void> {
    try {
      console.log(`📧 Sending credits purchase email:`, {
        to: email,
        subject: `${credits} créditos adicionados à sua conta`,
        template: 'credits-purchase',
        data: { credits }
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending credits purchase email:', error);
    }
  }

  // Send subscription renewal reminder
  static async sendRenewalReminder(email: string, planName: string, renewalDate: Date): Promise<void> {
    try {
      console.log(`📧 Sending renewal reminder email:`, {
        to: email,
        subject: `Seu plano ${planName} será renovado em breve`,
        template: 'renewal-reminder',
        data: { planName, renewalDate }
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending renewal reminder email:', error);
    }
  }

  // Send subscription trial ending email
  static async sendTrialEnding(email: string, planName: string, endDate: Date): Promise<void> {
    try {
      console.log(`📧 Sending trial ending email:`, {
        to: email,
        subject: `Seu período de teste do plano ${planName} está terminando`,
        template: 'trial-ending',
        data: { planName, endDate }
      });

      // TODO: Integrate with email service
    } catch (error) {
      console.error('Error sending trial ending email:', error);
    }
  }
}

export const emailService = EmailService;