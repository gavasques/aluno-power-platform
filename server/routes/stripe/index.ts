import { Router } from 'express';
import { stripeService } from '../../services/stripeService';
import { requireAuth } from '../../security';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  quantity: z.number().optional().default(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const createPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

// Create subscription checkout session
router.post('/create-subscription-checkout', requireAuth, async (req: any, res: any) => {
  try {
    const { priceId, successUrl, cancelUrl } = createCheckoutSchema.parse(req.body);
    const userId = req.user.id;

    const defaultSuccessUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/cancel`;

    const session = await stripeService.createSubscriptionCheckout(
      userId,
      priceId,
      successUrl || defaultSuccessUrl,
      cancelUrl || defaultCancelUrl
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erro ao criar checkout de assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create credits checkout session
router.post('/create-credits-checkout', requireAuth, async (req: any, res: any) => {
  try {
    const { priceId, quantity, successUrl, cancelUrl } = createCheckoutSchema.parse(req.body);
    const userId = req.user.id;

    const defaultSuccessUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/credits/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/credits/cancel`;

    const session = await stripeService.createCreditsCheckout(
      userId,
      priceId,
      quantity || 1,
      successUrl || defaultSuccessUrl,
      cancelUrl || defaultCancelUrl
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erro ao criar checkout de créditos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create customer portal session
router.post('/create-customer-portal', requireAuth, async (req: any, res: any) => {
  try {
    const { returnUrl } = createPortalSchema.parse(req.body);
    const userId = req.user.id;

    const defaultReturnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription`;

    const session = await stripeService.createCustomerPortal(
      userId,
      returnUrl || defaultReturnUrl
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar portal do cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's subscription info
router.get('/subscription', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const subscriptionInfo = await stripeService.getUserSubscription(userId);

    if (!subscriptionInfo) {
      return res.json({ subscription: null, plan: null });
    }

    res.json({
      subscription: {
        id: subscriptionInfo.subscription.id,
        status: subscriptionInfo.subscription.status,
        currentPeriodStart: subscriptionInfo.subscription.current_period_start,
        currentPeriodEnd: subscriptionInfo.subscription.current_period_end,
        cancelAtPeriodEnd: subscriptionInfo.subscription.cancel_at_period_end,
        canceledAt: subscriptionInfo.subscription.canceled_at,
      },
      plan: subscriptionInfo.plan
    });
  } catch (error) {
    console.error('Erro ao obter informações da assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', requireAuth, async (req: any, res: any) => {
  try {
    const { subscriptionId, atPeriodEnd = true } = req.body;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const subscriptionInfo = await stripeService.getUserSubscription(userId);
    if (!subscriptionInfo || subscriptionInfo.subscription.id !== subscriptionId) {
      return res.status(403).json({ error: 'Subscription not found or unauthorized' });
    }

    const updatedSubscription = await stripeService.cancelSubscription(subscriptionId, atPeriodEnd);

    res.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        canceledAt: updatedSubscription.canceled_at,
      }
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update subscription (upgrade/downgrade)
router.post('/update-subscription', requireAuth, async (req: any, res: any) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    const userId = req.user.id;

    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({ error: 'subscriptionId and newPriceId are required' });
    }

    // Verify subscription belongs to user
    const subscriptionInfo = await stripeService.getUserSubscription(userId);
    if (!subscriptionInfo || subscriptionInfo.subscription.id !== subscriptionId) {
      return res.status(403).json({ error: 'Subscription not found or unauthorized' });
    }

    const updatedSubscription = await stripeService.updateSubscription(subscriptionId, newPriceId);

    res.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodStart: updatedSubscription.current_period_start,
        currentPeriodEnd: updatedSubscription.current_period_end,
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's invoices
router.get('/invoices', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const invoices = await stripeService.getCustomerInvoices(userId, limit);

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    }));

    res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Erro ao obter faturas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available products and prices
router.get('/products', async (req: any, res: any) => {
  try {
    const { subscriptions, credits } = await stripeService.getProductsAndPrices();

    res.json({
      subscriptions,
      credits
    });
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook endpoint
router.post('/webhook', async (req: any, res: any) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Get raw body for signature verification
    const payload = req.body;

    // Verify webhook signature and parse event
    const event = stripeService.verifyWebhookSignature(payload, signature);

    // Process the webhook event
    await stripeService.processWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;