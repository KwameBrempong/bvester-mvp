const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs from your Stripe Dashboard
const PRICE_IDS = {
  pro_monthly: 'price_1ABC123...',    // Replace with actual price IDs
  pro_yearly: 'price_1DEF456...',
  business_monthly: 'price_1GHI789...',
  business_yearly: 'price_1JKL012...',
  accelerator_full: 'price_1MNO345...',
  accelerator_installment: 'price_1PQR678...'
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { action, ...params } = JSON.parse(event.body);

    switch (action) {
      case 'create_checkout_session':
        return await createCheckoutSession(params, headers);
      
      case 'webhook':
        return await handleWebhook(event, headers);
      
      case 'get_customer_portal':
        return await createCustomerPortal(params, headers);
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function createCheckoutSession(params, headers) {
  const { 
    priceId, 
    successUrl, 
    cancelUrl, 
    customerEmail, 
    userId,
    productType = 'subscription' // 'subscription' or 'one_time'
  } = params;

  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: productType === 'subscription' ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      userId: userId,
      productType: productType
    }
  };

  // For installment plans, limit to 3 payments
  if (priceId === PRICE_IDS.accelerator_installment) {
    sessionConfig.subscription_data = {
      metadata: {
        installment_plan: 'true',
        userId: userId
      }
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    })
  };
}

async function createCustomerPortal(params, headers) {
  const { customerId, returnUrl } = params;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: portalSession.url })
  };
}

async function handleWebhook(event, headers) {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(stripeEvent.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(stripeEvent.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(stripeEvent.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(stripeEvent.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object);
      break;

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true })
  };
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const productType = session.metadata.productType;
  
  console.log('Checkout completed for user:', userId, 'Product type:', productType);
  
  // Here you would typically:
  // 1. Update user subscription in your database
  // 2. Send confirmation email
  // 3. Grant access to features
  
  // For now, we'll log the successful payment
  console.log('Payment successful:', {
    userId,
    customerId: session.customer,
    subscriptionId: session.subscription,
    amountTotal: session.amount_total,
    currency: session.currency
  });
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Determine which plan based on price ID
  const priceId = subscription.items.data[0].price.id;
  let planType = 'unknown';
  
  Object.entries(PRICE_IDS).forEach(([key, value]) => {
    if (value === priceId) {
      planType = key;
    }
  });
  
  console.log('Plan type:', planType, 'for customer:', subscription.customer);
  
  // Update your database here
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  // Handle plan changes, payment method updates, etc.
}

async function handleSubscriptionCanceled(subscription) {
  console.log('Subscription canceled:', subscription.id);
  // Downgrade user to free tier
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  // For installment plans, check if this is the 3rd payment
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    if (subscription.metadata.installment_plan === 'true') {
      // Count how many invoices have been paid
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        status: 'paid'
      });
      
      if (invoices.data.length >= 3) {
        // Cancel subscription after 3 payments
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true
        });
        
        console.log('Installment plan completed, subscription will cancel');
      }
    }
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // Handle failed payments - send email, retry logic, etc.
}