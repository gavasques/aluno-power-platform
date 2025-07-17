import Stripe from 'stripe';
import { Request, Response } from 'express';
import { db } from '../db';
import { 
  users, 
  userSubscriptions, 
  billingHistory, 
  creditTransactions,
  stripeWebhookEvents,
  stripeProducts,
  stripePrices
} from '../../shared/schema';
import { eq } from 'drizzle-orm';

import { emailService } from '../services/emailService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// In-memory idempotency tracking
const processedEvents = new Set<string>();
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Clean up old events periodically
setInterval(() => {
  processedEvents.clear();
}, CLEANUP_INTERVAL);

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check for duplicate events (idempotency)
  if (processedEvents.has(event.id)) {
    console.log(`⚠️ Duplicate webhook event ignored: ${event.type} - ${event.id}`);
    return res.json({ received: true, status: 'duplicate' });
  }

  // Mark event as being processed
  processedEvents.add(event.id);

  // Log webhook event for auditing
  console.log(`🔔 Webhook received: ${event.type} - ${event.id}`);

  try {
    // Save webhook event to database
    await db.insert(stripeWebhookEvents).values({
      id: event.id,
      type: event.type,
      apiVersion: event.api_version,
      data: event.data,
      processed: false,
    });

    // Process event based on type
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await db.update(stripeWebhookEvents)
      .set({ 
        processed: true, 
        processedAt: new Date() 
      })
      .where(eq(stripeWebhookEvents.id, event.id));

    res.json({ received: true, status: 'processed' });
  } catch (error) {
    console.error(`❌ Error processing webhook ${event.type}:`, error);
    
    // Update webhook event with error
    await db.update(stripeWebhookEvents)
      .set({ 
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      .where(eq(stripeWebhookEvents.id, event.id));

    res.status(500).json({ 
      error: 'Internal server error',
      eventId: event.id
    });
  }
};

// Process subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);
  
  if (!user) {
    console.error('❌ User not found for customer_id:', customerId);
    return;
  }

  // Get plan info based on price ID
  const priceId = subscription.items.data[0].price.id;
  const planInfo = await getPlanInfoByPriceId(priceId);
  
  if (!planInfo) {
    console.error('❌ Plan not found for price_id:', priceId);
    return;
  }

  // Create subscription record
  await db.insert(userSubscriptions).values({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    planId: planInfo.id,
    status: subscription.status,
    billingCycle: subscription.items.data[0].price.recurring?.interval || 'month',
    startDate: new Date(subscription.start_date * 1000),
    endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
    nextBillingDate: new Date(subscription.current_period_end * 1000),
    cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    metadata: {
      priceId,
      planName: planInfo.name,
      stripeData: subscription,
    },
  });

  // Note: Credit system removed - subscription-only platform

  // Send welcome email
  await emailService.sendSubscriptionWelcome(user.email, planInfo.name);

  console.log(`✅ Subscription created for user ${user.id}: ${planInfo.name}`);
}

// Process subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const [existingSubscription] = await db.select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (!existingSubscription) {
    console.error('❌ Subscription not found:', subscription.id);
    return;
  }

  const oldStatus = existingSubscription.status;
  const newStatus = subscription.status;

  // Update subscription data
  await db.update(userSubscriptions)
    .set({
      status: subscription.status,
      startDate: new Date(subscription.start_date * 1000),
      endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
      metadata: {
        ...existingSubscription.metadata as any,
        stripeData: subscription,
      },
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

  // If subscription became active, add credits and update user group
  if (oldStatus !== 'active' && newStatus === 'active') {
    const priceId = subscription.items.data[0].price.id;
    const planInfo = await getPlanInfoByPriceId(priceId);
    
    if (planInfo) {
      await creditService.creditCredits(
        existingSubscription.userId,
        planInfo.creditsIncluded,
        `Renovação do plano ${planInfo.name}`,
        'subscription',
        subscription.id
      );
    }

    // Move user to "Pagantes" group (with exception for Alunos/Mentorados)
    const { UserGroupService } = await import('../services/userGroupService');
    await UserGroupService.handleSubscriptionActivated(existingSubscription.userId);
  }

  // If subscription became inactive, move user back to "Gratuito"
  if (oldStatus === 'active' && ['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(newStatus)) {
    const { UserGroupService } = await import('../services/userGroupService');
    await UserGroupService.handleSubscriptionEnded(existingSubscription.userId);
  }

  console.log(`✅ Subscription updated: ${subscription.id} (${oldStatus} → ${newStatus})`);
}

// Process subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get user before updating subscription
  const [existingSubscription] = await db.select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  await db.update(userSubscriptions)
    .set({
      status: 'canceled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

  const user = await getUserByCustomerId(subscription.customer as string);
  if (user) {
    await emailService.sendSubscriptionCanceled(user.email);

    // Move user back to "Gratuito" group (with exception for Alunos/Mentorados)
    if (existingSubscription) {
      const { UserGroupService } = await import('../services/userGroupService');
      await UserGroupService.handleSubscriptionEnded(existingSubscription.userId);
    }
  }

  console.log(`✅ Subscription canceled: ${subscription.id}`);
}

// Process trial will end
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const user = await getUserByCustomerId(subscription.customer as string);
  if (!user) return;

  const priceId = subscription.items.data[0].price.id;
  const planInfo = await getPlanInfoByPriceId(priceId);
  
  if (planInfo && subscription.trial_end) {
    await emailService.sendTrialEnding(
      user.email, 
      planInfo.name, 
      new Date(subscription.trial_end * 1000)
    );
  }

  console.log(`✅ Trial ending notification sent for subscription: ${subscription.id}`);
}

// Process successful payments
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByCustomerId(customerId);
  
  if (!user) {
    console.error('❌ User not found for customer_id:', customerId);
    return;
  }

  // Record payment in billing history
  await db.insert(billingHistory).values({
    userId: user.id,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.description || 'Pagamento de assinatura',
    invoiceUrl: invoice.hosted_invoice_url,
    metadata: {
      invoiceNumber: invoice.number,
      subscriptionId: invoice.subscription,
      stripeData: invoice,
    },
  });

  // If subscription renewal, add credits
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const priceId = subscription.items.data[0].price.id;
    const planInfo = await getPlanInfoByPriceId(priceId);
    
    if (planInfo) {
      await creditService.creditCredits(
        user.id,
        planInfo.creditsIncluded,
        `Renovação do plano ${planInfo.name}`,
        'subscription',
        subscription.id
      );
    }
  }

  // Send payment confirmation email
  await emailService.sendPaymentConfirmation(user.email, invoice.amount_paid / 100);

  console.log(`✅ Payment processed: ${invoice.id} - R$ ${(invoice.amount_paid / 100).toFixed(2)}`);
}

// Process failed payments
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByCustomerId(customerId);
  
  if (!user) {
    console.error('❌ User not found for customer_id:', customerId);
    return;
  }

  // Record failed payment
  await db.insert(billingHistory).values({
    userId: user.id,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    description: 'Falha no pagamento',
    failureReason: 'Pagamento recusado',
    metadata: {
      invoiceNumber: invoice.number,
      subscriptionId: invoice.subscription,
      stripeData: invoice,
    },
  });

  // Send payment failure email
  await emailService.sendPaymentFailed(user.email, invoice.amount_due / 100);

  console.log(`❌ Payment failed: ${invoice.id} - R$ ${(invoice.amount_due / 100).toFixed(2)}`);
}

// Process completed checkout sessions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const user = await getUserByCustomerId(customerId);
  
  if (!user) {
    console.error('❌ User not found for customer_id:', customerId);
    return;
  }

  const sessionType = session.metadata?.type;

  if (sessionType === 'credits') {
    // Process credit purchase
    const quantity = parseInt(session.metadata?.quantity || '1');
    const priceId = session.metadata?.priceId;
    
    if (priceId) {
      const creditsInfo = await getCreditPackageByPriceId(priceId);
      
      if (creditsInfo) {
        const totalCredits = creditsInfo.credits * quantity;
        
        await creditService.creditCredits(
          user.id,
          totalCredits,
          `Compra de ${totalCredits} créditos`,
          'purchase',
          session.id
        );

        // Record payment
        await db.insert(billingHistory).values({
          userId: user.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'brl',
          status: 'succeeded',
          description: `Compra de ${totalCredits} créditos`,
          metadata: {
            sessionId: session.id,
            creditsAmount: totalCredits,
            stripeData: session,
          },
        });

        // Send confirmation email
        await emailService.sendCreditsPurchase(user.email, totalCredits);
      }
    }
  }

  console.log(`✅ Checkout completed: ${session.id} - Type: ${sessionType}`);
}

// Process expired checkout sessions
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log(`⚠️ Checkout session expired: ${session.id}`);
  // Could add cleanup logic here if needed
}

// Process successful payment intents
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment intent succeeded: ${paymentIntent.id}`);
  // Additional processing if needed
}

// Process failed payment intents
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment intent failed: ${paymentIntent.id}`);
  // Additional processing if needed
}

// Process customer creation
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`✅ Customer created: ${customer.id}`);
  // Could sync additional customer data if needed
}

// Process customer updates
async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log(`✅ Customer updated: ${customer.id}`);
  // Could sync customer data changes if needed
}

// Process customer deletion
async function handleCustomerDeleted(customer: Stripe.Customer) {
  console.log(`⚠️ Customer deleted: ${customer.id}`);
  // Could handle customer deletion cleanup if needed
}

// Helper functions
async function getUserByCustomerId(customerId: string) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  
  return user || null;
}

async function getPlanInfoByPriceId(priceId: string) {
  try {
    const [price] = await db.select()
      .from(stripePrices)
      .where(eq(stripePrices.id, priceId))
      .limit(1);

    if (!price) return null;

    const [product] = await db.select()
      .from(stripeProducts)
      .where(eq(stripeProducts.id, price.productId))
      .limit(1);

    if (!product) return null;

    return {
      id: product.localId || 1,
      name: product.name,
      creditsIncluded: price.credits || 0,
      priceId: price.id,
    };
  } catch (error) {
    console.error('Error getting plan info:', error);
    return null;
  }
}

async function getCreditPackageByPriceId(priceId: string) {
  try {
    const [price] = await db.select()
      .from(stripePrices)
      .where(eq(stripePrices.id, priceId))
      .limit(1);

    if (!price) return null;

    const [product] = await db.select()
      .from(stripeProducts)
      .where(eq(stripeProducts.id, price.productId))
      .limit(1);

    if (!product) return null;

    return {
      credits: price.credits || 0,
      name: product.name,
      priceId: price.id,
    };
  } catch (error) {
    console.error('Error getting credit package info:', error);
    return null;
  }
}