export class EmailService {
  // Send subscription welcome email
  static async sendSubscriptionWelcome(email: string, planName: string): Promise<void> {
    try {
      // Log email sending (replace with actual email service)
      console.log(`📧 Sending subscription welcome email:`, {
        to: email,
        subject: `Bem-vindo ao plano ${planName}!`,
        template: 'subscription-welcome',
        data: { planName }
      });

      // TODO: Integrate with email service (SendGrid, SES, etc.)
      // await emailProvider.send({
      //   to: email,
      //   subject: `Bem-vindo ao plano ${planName}!`,
      //   template: 'subscription-welcome',
      //   data: { planName }
      // });

    } catch (error) {
      console.error('Error sending subscription welcome email:', error);
      // Don't throw error to prevent webhook failure
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