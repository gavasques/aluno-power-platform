import Stripe from 'stripe';
import { db } from '../db';
import { 
  users, 
  userSubscriptions, 
  creditTransactions, 
  billingHistory,
  stripeProducts,
  stripePrices,
  stripePaymentIntents,
  stripeCheckoutSessions,
  stripeWebhookEvents
} from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { 
  InsertStripeProduct,
  InsertStripePrice,
  InsertStripeCheckoutSession,
  InsertStripeWebhookEvent,
  InsertCreditTransaction,
  InsertBillingHistory,
  InsertUserSubscription
} from '../../shared/schema';

class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  // Create or get Stripe customer
  async createOrGetCustomer(userId: number, email: string, name: string): Promise<Stripe.Customer> {
    try {
      // Check if user already has a Stripe customer ID
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user?.stripeCustomerId) {
        // Retrieve existing customer
        const customer = await this.stripe.customers.retrieve(user.stripeCustomerId);
        if (customer && !customer.deleted) {
          return customer as Stripe.Customer;
        }
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId: userId.toString(),
        },
      });

      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, userId));

      return customer;
    } catch (error) {
      console.error('Error creating/getting Stripe customer:', error);
      throw new Error('Failed to create or retrieve customer');
    }
  }

  // Create subscription checkout session
  async createSubscriptionCheckout(
    userId: number,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      const customer = await this.createOrGetCustomer(userId, user.email, user.name);

      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          type: 'subscription',
          userId: userId.toString(),
          priceId: priceId,
        },
      });

      // Save checkout session to database
      await db.insert(stripeCheckoutSessions).values({
        id: session.id,
        userId: userId,
        customerId: customer.id,
        mode: 'subscription',
        status: session.status || 'open',
        amountTotal: session.amount_total,
        currency: session.currency || 'brl',
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        metadata: session.metadata,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
      });

      return session;
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw new Error('Failed to create subscription checkout');
    }
  }

  // Create credits checkout session
  async createCreditsCheckout(
    userId: number,
    priceId: string,
    quantity: number,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new Error('User not found');

      const customer = await this.createOrGetCustomer(userId, user.email, user.name);

      // Get price information for credits
      const [priceInfo] = await db.select().from(stripePrices).where(eq(stripePrices.id, priceId)).limit(1);
      
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          type: 'credits',
          userId: userId.toString(),
          priceId: priceId,
          quantity: quantity.toString(),
          credits: priceInfo?.credits ? (priceInfo.credits * quantity).toString() : '0',
        },
      });

      // Save checkout session to database
      await db.insert(stripeCheckoutSessions).values({
        id: session.id,
        userId: userId,
        customerId: customer.id,
        mode: 'payment',
        status: session.status || 'open',
        amountTotal: session.amount_total,
        currency: session.currency || 'brl',
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        metadata: session.metadata,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
      });

      return session;
    } catch (error) {
      console.error('Error creating credits checkout:', error);
      throw new Error('Failed to create credits checkout');
    }
  }

  // Get user's active subscription
  async getUserSubscription(userId: number): Promise<{subscription: any, plan: any} | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user?.stripeCustomerId) return null;

      const subscriptions = await this.stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) return null;

      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0]?.price.id;
      
      // Get price info from database
      const [priceInfo] = await db.select().from(stripePrices).where(eq(stripePrices.id, priceId)).limit(1);

      return {
        subscription,
        plan: priceInfo
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Update subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      return await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Create customer portal session
  async createCustomerPortal(userId: number, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user?.stripeCustomerId) {
        throw new Error('Customer not found in Stripe');
      }

      return await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });
    } catch (error) {
      console.error('Error creating customer portal:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  // Get customer invoices
  async getCustomerInvoices(userId: number, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user?.stripeCustomerId) return [];

      const invoices = await this.stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit,
      });

      return invoices.data;
    } catch (error) {
      console.error('Error getting customer invoices:', error);
      return [];
    }
  }

  // Process webhook event
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      // Save webhook event to database
      await db.insert(stripeWebhookEvents).values({
        id: event.id,
        type: event.type,
        apiVersion: event.api_version,
        data: event.data,
        processed: false,
      });

      // Process the event
      await this.handleWebhookEvent(event);

      // Mark event as processed
      await db.update(stripeWebhookEvents)
        .set({ 
          processed: true, 
          processedAt: new Date() 
        })
        .where(eq(stripeWebhookEvents.id, event.id));

    } catch (error) {
      console.error('Error processing webhook event:', error);
      
      // Update event with error
      await db.update(stripeWebhookEvents)
        .set({ 
          processingError: error instanceof Error ? error.message : 'Unknown error' 
        })
        .where(eq(stripeWebhookEvents.id, event.id));
      
      throw error;
    }
  }

  // Handle specific webhook events
  private async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // Handle checkout session completed
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = parseInt(session.metadata?.userId || '0');
    if (!userId) return;

    if (session.mode === 'subscription') {
      // Handle subscription purchase
      console.log(`Subscription checkout completed for user ${userId}`);
    } else if (session.mode === 'payment') {
      // Handle credits purchase
      const credits = parseInt(session.metadata?.credits || '0');
      const amount = session.amount_total || 0;
      
      if (credits > 0) {
        await this.addCreditsToUser(userId, credits, amount / 100, session.id);
      }
    }

    // Add billing history record
    await db.insert(billingHistory).values({
      userId: userId,
      stripeSessionId: session.id,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'brl',
      status: 'completed',
      type: session.mode === 'subscription' ? 'subscription' : 'credits',
      description: session.mode === 'subscription' ? 'Subscription payment' : 'Credits purchase',
      metadata: session.metadata || {},
    });
  }

  // Handle subscription updates
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    // Find user by customer ID
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
    if (!user) return;

    const priceId = subscription.items.data[0]?.price.id;
    const [priceInfo] = await db.select().from(stripePrices).where(eq(stripePrices.id, priceId)).limit(1);

    // Update or create user subscription
    const existingSubscription = await db.select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);

    const subscriptionData = {
      userId: user.id,
      status: subscription.status,
      planId: priceInfo?.id || 0,
      billingCycle: subscription.items.data[0]?.price.recurring?.interval || 'month',
      startDate: new Date(subscription.start_date * 1000),
      endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      nextBillingDate: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      metadata: subscription.metadata || {},
    };

    if (existingSubscription.length > 0) {
      await db.update(userSubscriptions)
        .set(subscriptionData)
        .where(eq(userSubscriptions.userId, user.id));
    } else {
      await db.insert(userSubscriptions).values(subscriptionData);
    }

    // Add monthly credits if subscription is active
    if (subscription.status === 'active' && priceInfo?.credits) {
      await this.addCreditsToUser(user.id, priceInfo.credits, 0, `subscription_${subscription.id}`);
    }
  }

  // Handle subscription deletion
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
    if (!user) return;

    await db.update(userSubscriptions)
      .set({ 
        status: 'cancelled',
        cancelledAt: new Date(),
      })
      .where(eq(userSubscriptions.userId, user.id));
  }

  // Handle invoice payment succeeded
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    // Add any additional logic for successful payments
  }

  // Handle invoice payment failed
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Invoice payment failed: ${invoice.id}`);
    // Add logic for failed payments (email notifications, etc.)
  }

  // Add credits to user account
  private async addCreditsToUser(userId: number, credits: number, amountPaid: number, reference: string): Promise<void> {
    try {
      // Get or create user credit balance
      let [balance] = await db.select().from(userCreditBalance).where(eq(userCreditBalance.userId, userId)).limit(1);
      
      if (!balance) {
        // Create new balance record
        await db.insert(userCreditBalance).values({
          userId: userId,
          currentBalance: credits,
          totalEarned: credits,
          totalSpent: 0,
          lastResetDate: null,
        });
      } else {
        // Update existing balance
        await db.update(userCreditBalance)
          .set({
            currentBalance: balance.currentBalance + credits,
            totalEarned: balance.totalEarned + credits,
          })
          .where(eq(userCreditBalance.userId, userId));
      }

      // Add transaction record
      await db.insert(creditTransactions).values({
        userId: userId,
        type: 'purchase',
        amount: credits,
        cost: amountPaid,
        description: `Credit purchase - ${credits} credits`,
        reference: reference,
        status: 'completed',
        metadata: { source: 'stripe' },
      });

    } catch (error) {
      console.error('Error adding credits to user:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  // Get available products and prices
  async getProductsAndPrices(): Promise<{subscriptions: any[], credits: any[]}> {
    try {
      const products = await db.select().from(stripeProducts).where(eq(stripeProducts.isActive, true));
      const prices = await db.select().from(stripePrices).where(eq(stripePrices.isActive, true));

      const subscriptions = products
        .filter(p => p.type === 'subscription')
        .map(product => ({
          ...product,
          prices: prices.filter(p => p.productId === product.id)
        }));

      const credits = products
        .filter(p => p.type === 'credits')
        .map(product => ({
          ...product,
          prices: prices.filter(p => p.productId === product.id)
        }));

      return { subscriptions, credits };
    } catch (error) {
      console.error('Error getting products and prices:', error);
      return { subscriptions: [], credits: [] };
    }
  }
}

export const stripeService = new StripeService();